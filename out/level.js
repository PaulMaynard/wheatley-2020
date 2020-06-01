import { RNG, KEYS } from './lib/ROT/index.js';
import { tiles } from './tile.js';
import Screen from './screen.js';
import Point from './point.js';
import PreciseShadowcasting from './lib/ROT/fov/precise-shadowcasting.js';
export class Level {
    constructor(width, height, generator) {
        this.width = width;
        this.height = height;
        this.tiles = new Array(height);
        this.seen = new Array(height);
        for (let y = 0; y < height; y++) {
            this.tiles[y] = new Array(width);
            this.seen[y] = new Array(width);
        }
        this.monsters = [];
        let gen = new generator(width, height);
        gen.create((x, y, type) => {
            if (type == 1) {
                this.tiles[y][x] = tiles.wall;
            }
            else {
                this.tiles[y][x] = tiles.floor;
            }
        });
        for (let room of gen.getRooms()) {
            room.getDoors((x, y) => this.tiles[y][x] = tiles.door);
        }
        let room = RNG.getItem(gen.getRooms());
        this.start = new Point(...room.getCenter());
    }
    iter(lb, ub, cb) {
        for (let y = 0; y < this.height; y++) {
            if ((lb && lb.y < y) || (ub && y < ub.y)) {
                for (let x = 0; x < this.width; x++) {
                    if ((lb && lb.x < x) || (ub && x < ub.x)) {
                        cb(this.tiles[y][x], new Point(x, y));
                    }
                }
            }
        }
    }
}
export class LevelScreen extends Screen {
    constructor(player, level) {
        super();
        this.player = player;
        this.level = level;
        this.center = level.start;
        this.fov = new PreciseShadowcasting((x, y) => {
            if (y in this.level.tiles && x in this.level.tiles[y]) {
                return !this.level.tiles[y][x].props.opaque;
            }
            else {
                return false;
            }
        });
    }
    enter() {
        this.level.monsters.push(this.player);
        this.player.pos = this.level.start;
    }
    render(display) {
        let visible = new Array(this.level.height);
        for (let y = 0; y < this.level.height; y++) {
            visible[y] = new Array(this.level.width);
        }
        this.fov.compute(this.player.pos.x, this.player.pos.y, 11, (x, y, v) => {
            visible[y][x] = v;
            this.level.seen[y][x] = true;
        });
        let dim = new Point(display.getOptions().width, display.getOptions().height);
        let offset = this.center.minus(new Point(dim.x >> 1, dim.y >> 1));
        this.level.iter(offset, offset.plus(dim), (tile, p) => {
            if (visible[p.y][p.x]) {
                tile.draw(display, p.minus(offset));
            }
            else if (this.level.seen[p.y][p.x]) {
                tile.draw(display, p.minus(offset), 'gray');
            }
        });
        this.level.monsters.forEach(mon => mon.tile.draw(display, mon.pos.minus(offset)));
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
        }
        let tile = this.level.tiles[y][x];
        if (!tile.props.impassable) {
            this.player.pos = new Point(x, y);
            this.center = this.player.pos;
        }
        if (tile.props.open) {
            this.level.tiles[y][x] = tile.props.open;
        }
    }
}
//# sourceMappingURL=level.js.map