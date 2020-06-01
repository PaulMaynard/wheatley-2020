import Dungeon from './lib/ROT/map/dungeon.js'
import { RNG, KEYS, Display, Color } from './lib/ROT/index.js'
import Tile, { tiles } from './tile.js'
import Screen from './screen.js'
import Monster, { genMonster } from './monster.js'
import Point from './point.js'
import FOV from './lib/ROT/fov/fov.js'
import PreciseShadowcasting from './lib/ROT/fov/precise-shadowcasting.js'
import Scheduler from './lib/ROT/scheduler/scheduler.js'
import Speed from './lib/ROT/scheduler/speed.js'
import RecursiveShadowcasting from './lib/ROT/fov/recursive-shadowcasting.js'
import { Game } from './game.js'
import HelpScreen from './help.js'


export class Level {
    tiles: Tile[][]
    seen: (number | Tile)[][]
    monsters: Monster[]
    start: Point
    fov: FOV
    scheduler: Scheduler
    constructor(public game: Game,
                readonly width: number, readonly height: number, nmonsters: number,
                generator: { new(w: number, h: number): Dungeon }) {
        this.tiles = new Array(height)
        this.seen = new Array(height)
        for (let y = 0; y < height; y++) {
            this.tiles[y] = new Array(width)
            this.seen[y] = new Array(width)
        }

        this.scheduler = new Speed()
        this.fov = new RecursiveShadowcasting((x, y) => {
            let p = new Point(x, y)
            return this.in(p) && !this.tile(p).props.opaque
        })

        let gen = new generator(width, height)
        gen.create((x, y, type) => {
            if (type == 1) {
                this.tiles[y][x] = tiles.wall
            } else {
                this.tiles[y][x] = tiles.floor
            }
        })
        for (let room of gen.getRooms()) {
            room.getDoors((x, y) => this.tiles[y][x] = tiles.door)
        }
        let room = RNG.getItem(gen.getRooms())
        this.start = new Point(...room.getCenter() as [number, number])

        this.monsters = new Array()
        for (let i = 0; i < nmonsters; i++) {
            let mon = genMonster()
            while (true) {
                let x = RNG.getUniformInt(0, this.width - 1)
                let y = RNG.getUniformInt(0, this.height - 1)
                if (!this.tiles[y][x].props.impassable) {
                    mon.pos = new Point(x, y)
                    this.monsters.push(mon)
                    this.scheduler.add(mon, true)
                    break
                }
            }
        }
    }
    iter(lb: Point, ub: Point, cb: (t: Tile, p: Point) => void) {
        for (let y = 0; y < this.height; y++) {
            if ((lb && lb.y < y) || (ub && y < ub.y)) {
                for (let x = 0; x < this.width; x++) {
                    if ((lb && lb.x < x) || (ub && x < ub.x)) {
                        cb(this.tiles[y][x], new Point(x, y))
                    }
                }
            }
        }
    }
    in(p: Point): boolean {
        return 0 <= p.x && p.x < this.width && 0 <= p.y && p.y < this.height
    }
    tile(p: Point): Tile {
        for (let m of this.monsters) {
            if (m.pos.equals(p) && m.health > 0) {
                return m
            }
        }
        return this.tiles[p.y][p.x]
    }
}

export class LevelScreen extends Screen {
    center: Point
    constructor(public player: Monster, public level: Level) {
        super()
        this.center = level.start
    }
    enter() {
        this.level.monsters.push(this.player)
        this.player.pos = this.level.start
    }
    render(display: Display) {
        let dim = new Point(
            display.getOptions().width,
            display.getOptions().height
        )
        let offset = this.center.minus(new Point(dim.x >> 1, dim.y >> 1))

        for (let y = 0; y < dim.y-5; y++) {
            for (let x = 0; x < dim.x; x++) {
                let p = new Point(x, y)
                let po = p.plus(offset)
                if (typeof this.level.seen[po.y][po.x] == 'number') {
                    this.level.seen[po.y][po.x] = this.level.tile(po)
                }
            }
        }
        this.level.fov.compute(this.player.pos.x, this.player.pos.y, this.player.props.sight, (x, y, v) => {
            this.level.seen[y][x] = 1 + v
        })

        for (let y = 0; y < dim.y-5; y++) {
            for (let x = 0; x < dim.x; x++) {
                let p = new Point(x, y)
                let po = p.plus(offset)
                if (this.level.in(po)) {
                    let vis = this.level.seen[po.y][po.x]
                    if (vis instanceof Tile) {
                        vis.draw(display, p, 'gray')
                    } else if (vis > 0) {
                        let tile = this.level.tile(po)
                        let col = Color.fromString(tile.fg)
                        col = Color.interpolate(col, Color.fromString('gray'),
                            vis * .06)
                        tile.draw(display, p, Color.toHex(col))
                    }
                }
            }
        }
        // this.level.monsters.forEach(mon => {
        //     if (this.level.seen[mon.pos.y][mon.pos.x]) {
        //         mon.draw(display, mon.pos.minus(offset))
        //     }
        // })
        display.drawText(0, 0, grade(this.player.health, this.player.props.maxhealth) + ' (' +
            this.player.health + '/' + this.player.props.maxhealth + ')')
    }
    handle(key: number) {
        let [x, y] = this.player.pos
        switch (key) {
            case KEYS.VK_UP:
            case KEYS.VK_K:
            case KEYS.VK_NUMPAD8:
                y--
            break
            case KEYS.VK_DOWN:
            case KEYS.VK_J:
            case KEYS.VK_NUMPAD2:
                y++
            break
            case KEYS.VK_LEFT:
            case KEYS.VK_H:
            case KEYS.VK_NUMPAD4:
                x--
            break
            case KEYS.VK_RIGHT:
            case KEYS.VK_L:
            case KEYS.VK_NUMPAD6:
                x++
            break
            case KEYS.VK_Y:
            case KEYS.VK_NUMPAD7:
                x--
                y--
            break
            case KEYS.VK_U:
            case KEYS.VK_NUMPAD9:
                x++
                y--
            break
            case KEYS.VK_B:
            case KEYS.VK_NUMPAD1:
                x--
                y++
            break
            case KEYS.VK_N:
            case KEYS.VK_NUMPAD3:
                x++
                y++
            break
            case KEYS.VK_X:
                this.game.push(new LookScreen(this, this.player.pos))
            return
            case KEYS.VK_SLASH:
                this.game.push(new HelpScreen())
            return
            default:
                return
        }
        this.player.move(this.level, new Point(x, y))
        // if (this.player.pos.minus(this.center).chebyshev() > 5) {
        this.center = this.player.pos
        // }
        for (let m of this.level.monsters) {
            if (m.health > 0) {
                m.act(this.level)
            }
        }
    }
}

function grade(n: number, m: number) {
    let gpa = n/m * 4
    if (gpa <= 0) {
        return 'F'
    } else if (gpa <= 1) {
        return 'D'
    } else if (gpa <= 1.3) {
        return 'D+'
    } else if (gpa <= 1.7) {
        return 'C-'
    } else if (gpa <= 2) {
        return 'C'
    } else if (gpa <= 2.3) {
        return 'C+'
    } else if (gpa <= 2.7) {
        return 'B-'
    } else if (gpa <= 3) {
        return 'B'
    } else if (gpa <= 3.3) {
        return 'B+'
    } else if (gpa <= 3.7) {
        return 'A-'
    } else {
        return 'A'
    }
}

class LookScreen extends Screen {
    constructor(private scr: LevelScreen, public pos: Point) {
        super()
    }
    render(display: Display) {
        this.scr.render(display)
        let dim = new Point(
            display.getOptions().width,
            display.getOptions().height
        )
        let offset = this.scr.center.minus(new Point(dim.x >> 1, dim.y >> 1))
        let pos = this.pos.minus(offset)

        new Tile('X', 'lightblue').draw(display, pos)
        if (this.scr.level.seen[this.pos.y][this.pos.x] > 0) {
            display.drawText(pos.x+2, pos.y, "You see " + this.scr.level.tile(this.pos).props.desc)
        }
    }
    handle(key: number) {
        let [x, y] = this.pos
        switch (key) {
            case KEYS.VK_UP:
            case KEYS.VK_K:
            case KEYS.VK_NUMPAD8:
                y--
            break
            case KEYS.VK_DOWN:
            case KEYS.VK_J:
            case KEYS.VK_NUMPAD2:
                y++
            break
            case KEYS.VK_LEFT:
            case KEYS.VK_H:
            case KEYS.VK_NUMPAD4:
                x--
            break
            case KEYS.VK_RIGHT:
            case KEYS.VK_L:
            case KEYS.VK_NUMPAD6:
                x++
            break
            case KEYS.VK_Y:
            case KEYS.VK_NUMPAD7:
                x--
                y--
            break
            case KEYS.VK_U:
            case KEYS.VK_NUMPAD9:
                x++
                y--
            break
            case KEYS.VK_B:
            case KEYS.VK_NUMPAD1:
                x--
                y++
            break
            case KEYS.VK_N:
            case KEYS.VK_NUMPAD3:
                x++
                y++
            break
            case KEYS.VK_ESCAPE:
                this.game.pop()
            break
            default:
                return
        }
        this.pos = new Point(x, y)
    }

}