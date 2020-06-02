import { RNG, KEYS, Color } from './lib/ROT/index.js';
import Tile from './tile.js';
import Screen from './screen.js';
import Monster, { genMonster } from './monster.js';
import Point from './point.js';
import Speed from './lib/ROT/scheduler/speed.js';
import HelpScreen from './help.js';
import PreciseShadowcasting from './lib/ROT/fov/precise-shadowcasting.js';
export class Level {
    constructor(game, width, height, nmonsters, generator) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.tiles = new Array(height);
        this.seen = new Array(height);
        for (let y = 0; y < height; y++) {
            this.tiles[y] = new Array(width);
            this.seen[y] = new Array(width);
        }
        this.scheduler = new Speed();
        this.fov = new PreciseShadowcasting((x, y) => {
            let p = new Point(x, y);
            return this.in(p) && !this.tile(p).props.opaque;
        });
        this.monsters = new Array();
        let gen = generator(width, height);
        gen.create((x, y, t, m) => {
            this.tiles[y][x] = t;
            if (m) {
                this.addMonster(m, new Point(x, y), false);
            }
        });
        while (true) {
            let x = RNG.getUniformInt(0, this.width - 1);
            let y = RNG.getUniformInt(0, this.height - 1);
            if (!this.tiles[y][x].props.impassable) {
                this.start = new Point(x, y);
                break;
            }
        }
        for (let i = 0; i < nmonsters; i++) {
            let mon = genMonster();
            while (true) {
                let x = RNG.getUniformInt(0, this.width - 1);
                let y = RNG.getUniformInt(0, this.height - 1);
                if (!this.tiles[y][x].props.impassable) {
                    this.addMonster(mon, new Point(x, y));
                    break;
                }
            }
        }
    }
    addMonster(mon, pos, active = true) {
        mon.pos = pos;
        this.monsters.push(mon);
        if (active) {
            this.scheduler.add(mon, true);
            mon.active = true;
        }
    }
    iter(lb, ub, cb) {
        for (let y = 0; y < this.height; y++) {
            if ((lb && lb.y < y) || (ub && y < ub.y)) {
                for (let x = 0; x < this.width; x++) {
                    if ((lb && lb.x < x) || (ub && x < ub.x)) {
                        cb(this.tile(new Point(x, y)), new Point(x, y));
                    }
                }
            }
        }
    }
    in(p) {
        return 0 <= p.x && p.x < this.width && 0 <= p.y && p.y < this.height;
    }
    tile(p) {
        for (let m of this.monsters) {
            if (m.pos.equals(p) && m.health > 0) {
                return m;
            }
        }
        return this.tiles[p.y][p.x];
    }
}
export class LevelScreen extends Screen {
    constructor(player, level) {
        super();
        this.player = player;
        this.level = level;
        this.center = level.start;
    }
    enter() {
        this.level.addMonster(this.player, this.level.start);
        this.game.log("Welcome to Wheatley! Use the arow keys to move around, and don't forget to social distance!");
    }
    render(display) {
        let dim = new Point(display.getOptions().width - 20, display.getOptions().height - 5);
        let offset = this.center.minus(new Point(dim.x >> 1, dim.y >> 1));
        for (let y = 0; y < dim.y - 5; y++) {
            for (let x = 0; x < dim.x; x++) {
                let p = new Point(x, y);
                let po = p.plus(offset);
                if (this.level.in(po)) {
                    if (typeof this.level.seen[po.y][po.x] == 'number') {
                        this.level.seen[po.y][po.x] = this.level.tile(po);
                    }
                }
            }
        }
        this.level.fov.compute(this.player.pos.x, this.player.pos.y, this.player.props.sight, (x, y, v) => {
            this.level.seen[y][x] = 1 + v;
        });
        for (let y = 0; y < dim.y - 5; y++) {
            for (let x = 0; x < dim.x - 20; x++) {
                let p = new Point(x, y);
                let po = p.plus(offset);
                if (this.level.in(po)) {
                    let vis = this.level.seen[po.y][po.x];
                    if (vis instanceof Tile) {
                        vis.draw(display, p, 'gray');
                    }
                    else if (vis > 0) {
                        let tile = this.level.tile(po);
                        if (tile instanceof Monster && !tile.active) {
                            this.level.scheduler.add(tile, true);
                            tile.active = true;
                        }
                        let col = Color.fromString(tile.fg);
                        // col = Color.interpolate(col, Color.fromString('gray'),
                        //     vis * .03)
                        tile.draw(display, p, Color.toHex(col));
                    }
                }
            }
        }
        // render player stats
        display.drawText(dim.x - 19, 1, 'Grade: ' + grade(this.player.health, this.player.props.maxhealth) + ' (' +
            this.player.health + '/' + this.player.props.maxhealth + ')');
        display.drawText(dim.x - 19, 2, 'Will to live: ' + this.player.mana + '/' + this.player.props.maxmana);
        let i = 4;
        for (let [_, name] of this.player.effects) {
            if (name) {
                display.drawText(dim.x - 19, i++, name);
            }
        }
    }
    handle(key) {
        let [x, y] = this.player.pos;
        switch (key) {
            case KEYS.VK_UP:
            case KEYS.VK_K:
            case KEYS.VK_NUMPAD8:
                y--;
                break;
            case KEYS.VK_DOWN:
            case KEYS.VK_J:
            case KEYS.VK_NUMPAD2:
                y++;
                break;
            case KEYS.VK_LEFT:
            case KEYS.VK_H:
            case KEYS.VK_NUMPAD4:
                x--;
                break;
            case KEYS.VK_RIGHT:
            case KEYS.VK_L:
            case KEYS.VK_NUMPAD6:
                x++;
                break;
            case KEYS.VK_Y:
            case KEYS.VK_NUMPAD7:
                x--;
                y--;
                break;
            case KEYS.VK_U:
            case KEYS.VK_NUMPAD9:
                x++;
                y--;
                break;
            case KEYS.VK_B:
            case KEYS.VK_NUMPAD1:
                x--;
                y++;
                break;
            case KEYS.VK_N:
            case KEYS.VK_NUMPAD3:
                x++;
                y++;
                break;
            case KEYS.VK_X:
                this.game.push(new LookScreen(this, this.player.pos));
                return;
            case KEYS.VK_SLASH:
                this.game.push(new HelpScreen());
                return;
            case KEYS.VK_ESCAPE:
                this.game.pop();
                return;
            default:
                return;
        }
        this.player.move(this.level, new Point(x, y));
        // if (this.player.pos.minus(this.center).chebyshev() > 5) {
        this.center = this.player.pos;
        // }
        let m;
        while (((m = this.level.scheduler.next()) != this.player)) {
            if (m.health > 0) {
                m.act(this.level);
            }
        }
        this.player.act(this.level);
        if (this.player.health <= 0) {
            this.game.pop();
        }
    }
}
function grade(n, m) {
    let gpa = n / m * 4;
    if (gpa <= 0) {
        return 'F';
    }
    else if (gpa <= 1) {
        return 'D';
    }
    else if (gpa <= 1.3) {
        return 'D+';
    }
    else if (gpa <= 1.7) {
        return 'C-';
    }
    else if (gpa <= 2) {
        return 'C';
    }
    else if (gpa <= 2.3) {
        return 'C+';
    }
    else if (gpa <= 2.7) {
        return 'B-';
    }
    else if (gpa <= 3) {
        return 'B';
    }
    else if (gpa <= 3.3) {
        return 'B+';
    }
    else if (gpa <= 3.7) {
        return 'A-';
    }
    else {
        return 'A';
    }
}
class LookScreen extends Screen {
    constructor(scr, pos) {
        super();
        this.scr = scr;
        this.pos = pos;
    }
    render(display) {
        this.scr.render(display);
        let dim = new Point(display.getOptions().width, display.getOptions().height);
        let offset = this.scr.center.minus(new Point(dim.x - 20 >> 1, dim.y - 5 >> 1));
        let pos = this.pos.minus(offset);
        new Tile('X', 'lightblue').draw(display, pos);
        if (this.scr.level.seen[this.pos.y][this.pos.x] > 0) {
            display.drawText(pos.x + 2, pos.y, "You see " + this.scr.level.tile(this.pos).props.desc);
        }
    }
    handle(key) {
        let [x, y] = this.pos;
        switch (key) {
            case KEYS.VK_UP:
            case KEYS.VK_K:
            case KEYS.VK_NUMPAD8:
                y--;
                break;
            case KEYS.VK_DOWN:
            case KEYS.VK_J:
            case KEYS.VK_NUMPAD2:
                y++;
                break;
            case KEYS.VK_LEFT:
            case KEYS.VK_H:
            case KEYS.VK_NUMPAD4:
                x--;
                break;
            case KEYS.VK_RIGHT:
            case KEYS.VK_L:
            case KEYS.VK_NUMPAD6:
                x++;
                break;
            case KEYS.VK_Y:
            case KEYS.VK_NUMPAD7:
                x--;
                y--;
                break;
            case KEYS.VK_U:
            case KEYS.VK_NUMPAD9:
                x++;
                y--;
                break;
            case KEYS.VK_B:
            case KEYS.VK_NUMPAD1:
                x--;
                y++;
                break;
            case KEYS.VK_N:
            case KEYS.VK_NUMPAD3:
                x++;
                y++;
                break;
            case KEYS.VK_ESCAPE:
                this.game.pop();
                break;
            default:
                return;
        }
        this.pos = new Point(x, y);
    }
}
//# sourceMappingURL=level.js.map