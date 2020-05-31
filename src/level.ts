import Dungeon from './lib/ROT/map/dungeon.js'
import { RNG, KEYS, Display } from './lib/ROT/index.js'
import Tile, { tiles } from './tile.js'
import Screen from './screen.js'
import Monster from './monster.js'

export class Level {
    public tiles: Tile[][]
    public monsters: Monster[]
    public start: [number, number]
    constructor(readonly width: number, readonly height: number,
                generator: { new(w: number, h: number): Dungeon }) {
        this.tiles = new Array(height)
        for (let y = 0; y < height; y++) {
            this.tiles[y] = new Array(height)
        }
        this.monsters = []

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
        this.start = room.getCenter() as [number, number]
    }
}

export class LevelScreen extends Screen {
    constructor(public player: Monster, public level: Level) {
        super()
    }
    enter() {
        this.level.monsters.push(this.player)
        console.log(this.level.start);
        [this.player.x, this.player.y] = this.level.start
    }
    render(display: Display) {
        this.level.tiles.forEach((row, y) =>
            row.forEach((tile, x) => tile.draw(display, x, y))
        )
        this.level.monsters.forEach(mon =>
            mon.tile.draw(display, mon.x, mon.y))
    }
    handle(key: number) {
        let x = this.player.x, y = this.player.y;
        switch (key) {
            case KEYS.VK_UP:
            case KEYS.VK_K:
                y--
            break
            case KEYS.VK_DOWN:
            case KEYS.VK_J:
                y++
            break
            case KEYS.VK_LEFT:
            case KEYS.VK_H:
                x--
            break
            case KEYS.VK_RIGHT:
            case KEYS.VK_L:
                x++
            break
        }
        let tile = this.level.tiles[y][x]
        if (!tile.props.impassable) {
            this.player.x = x
            this.player.y = y
        }
        if (tile.props.open) {
            this.level.tiles[y][x] = tile.props.open
        }
    }
}