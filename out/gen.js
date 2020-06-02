import { RNG } from "./lib/ROT/index.js";
import Dungeon from "./lib/ROT/map/dungeon.js";
export var Feature;
(function (Feature) {
    Feature[Feature["FLOOR"] = 0] = "FLOOR";
    Feature[Feature["WALL"] = 1] = "WALL";
    Feature[Feature["DOOR"] = 2] = "DOOR";
})(Feature || (Feature = {}));
function clamp(n, a, b) {
    return Math.min(Math.max(a, n), b);
}
// kinda hacky solution
export default class WheatleyGen extends Dungeon {
    constructor(width, height, level, size) {
        super(width, height);
        this.level = level;
        this.size = size;
    }
    create(cb) {
        this._create(cb, this.size, this.level, !!RNG.getUniformInt(0, 1), 0, this._width, 0, this._height);
    }
    _create(cb, s, l, axis, x0, x1, y0, y1) {
        console.log('_create(cb', s, l, axis, x0, x1, y0, y1, ')');
        if (x1 < x0 || y1 < y0)
            return;
        if (l < -1)
            return;
        if (x1 - x0 > 5 || y1 - y0 > 5) {
            if (axis) { // x axis
                if (l > 1) { // hallways
                    let x = clamp(RNG.getNormal((x0 + x1) / 2, (x1 - x0) / 6) | 0, x0 + 1, x1 - l - 1); //RNG.getUniformInt(x0+1, x1-l-1)
                    let door1 = RNG.getUniformInt(0, 1);
                    let door2 = RNG.getUniformInt(0, 1);
                    for (let i = 0; i < l; i++) {
                        cb(x + i, y0 - 1, door1 ? Feature.DOOR : Feature.FLOOR);
                        cb(x + i, y1, door2 ? Feature.DOOR : Feature.FLOOR);
                    }
                    for (let y = y0; y < y1; y++) {
                        cb(x - 1, y, Feature.WALL);
                        for (let i = 0; i < l; i++) {
                            cb(x + i, y, Feature.FLOOR);
                        }
                        cb(x + l, y, Feature.WALL);
                    }
                    this._create(cb, s, l - 1, !axis, x0, x - 1, y0, y1);
                    this._create(cb, s, l - 1, !axis, x + l + 1, x1, y0, y1);
                }
                else {
                    let x = RNG.getUniformInt(x0, x1 - 1);
                    for (let y = y0; y < y1; y++) {
                        cb(x, y, Feature.WALL);
                    }
                    this._create(cb, s, l - 1, !axis, x0, x, y0, y1);
                    this._create(cb, s, l - 1, !axis, x + 1, x1, y0, y1);
                }
            }
            else {
                if (l > 1) {
                    let y = clamp(RNG.getNormal((y0 + y1) / 2, (y1 - y0) / 6) | 0, y0 + 1, y1 - l - 1); //RNG.getUniformInt(x0+1, x1-l-1)
                    let door1 = RNG.getUniformInt(0, 1);
                    let door2 = RNG.getUniformInt(0, 1);
                    for (let i = 0; i < l; i++) {
                        cb(x0 - 1, y + i, door1 ? Feature.DOOR : Feature.FLOOR);
                        cb(x1, y + i, door2 ? Feature.DOOR : Feature.FLOOR);
                    }
                    for (let x = x0; x < x1; x++) {
                        cb(x, y - 1, Feature.WALL);
                        for (let i = 0; i < l; i++) {
                            cb(x, y + i, Feature.FLOOR);
                        }
                        cb(x, y + l, Feature.WALL);
                    }
                    this._create(cb, s, l - 1, !axis, x0, x1, y0, y - 1);
                    this._create(cb, s, l - 1, !axis, x0, x1, y + l + 1, y1);
                }
                else {
                    // let y = RNG.getUniformInt(y0, y1-1)
                    // for(let x = x0; x < x1; x++) {
                    //     cb(x, y, Feature.WALL)
                    // }
                    // this._create(cb, s, l-1, !axis, x0, x1, y0, y)
                    // this._create(cb, s, l-1, !axis, x0, x1, y+1, y1)
                }
            }
        }
    }
}
//# sourceMappingURL=gen.js.map