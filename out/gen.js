import Map from "./lib/ROT/map/map.js";
import { RNG } from "./lib/ROT/index.js";
export var Feature;
(function (Feature) {
    Feature[Feature["FLOOR"] = 0] = "FLOOR";
    Feature[Feature["WALL"] = 1] = "WALL";
    Feature[Feature["DOOR"] = 2] = "DOOR";
})(Feature || (Feature = {}));
// kinda hacky solution
export default class WheatleyGen extends Map {
    constructor(width, height, level, size) {
        super(width, height);
        this.level = level;
        this.size = size;
    }
    create(cb) {
        this._create(cb, this.size, this.level, !!RNG.getUniformInt(0, 1), 0, this._width, 0, this._height);
    }
    _create(cb, s, l, axis, x0, x1, y0, y1) {
        // console.log('_create(cb', s,  l, axis, x0, x1, y0, y1, ')')
        if (x1 - x0 > 5 || y1 - y0 > 5) {
            if (axis) { // x axis
                let x = RNG.getUniformInt(x0, x1 - 1);
                // console.log('create hall at x = ', x)
                for (let y = y0; y < y1; y++) {
                    cb(x, y, l > 0 ? Feature.DOOR : Feature.WALL);
                }
                this._create(cb, s, l - 1, !axis, x0, x, y0, y1);
                this._create(cb, s, l - 1, !axis, x + 1, x1, y0, y1);
            }
            else {
                let y = RNG.getUniformInt(y0, y1 - 1);
                // console.log('create hall at y = ', y)
                for (let x = x0; x < x1; x++) {
                    cb(x, y, l > 0 ? Feature.DOOR : Feature.WALL);
                }
                this._create(cb, s, l - 1, !axis, x0, x1, y0, y);
                this._create(cb, s, l - 1, !axis, x0, x1, y + 1, y1);
            }
        }
        // place corridor (l wide)
        // if (l > 0) {
        //     let axmin: number,
        //         axmax: number,
        //         offmin: number,
        //         offmax: number,
        //         realcb: typeof cb
        //     console.log(Axis[axis])
        //     if (axis == Axis.X) {
        //         axmin = x0
        //         axmax = x1
        //         offmin = y0
        //         offmax = y1
        //         realcb = cb
        //     } else {
        //         axmin = y0
        //         axmax = y1
        //         offmin = x0
        //         offmax = x1
        //         realcb = (i, j, c) => cb(j, i, c)
        //     }
        //     console.log(offmin, offmax, l)
        //     let corr = RNG.getUniformInt(axmin + 1, axmax - l - 1)
        //     for (let i = offmin; i < offmax; i++) {
        //         realcb(corr-1, i, Feature.WALL)
        //         // realcb(corr+l, i, Feature.WALL)
        //         // for (let j = 0; j < l; j++) {
        //         //     realcb(corr+j, i, Feature.FLOOR)
        //         // }
        //     }
        //     if (axis == Axis.X) {
        //         this._create(cb, l-1, Axis.Y, x0, corr - 1, y0, y1)
        //         this._create(cb, l-1, Axis.Y, corr /* + l */ + 1, x1, y0, y1)
        //     } else {
        //         this._create(cb, l-1, Axis.X, x0, x1, y0, corr-1)
        //         this._create(cb, l-1, Axis.Y, x0, x1, corr /* + l */ + 1, y1)
        //     }
        //     return
        // }
        // // for (let x = x0; x < x1; x++) {
        // //     for (let y = y0; y < y1; y++) {
        // //         cb(x, y, Feature.FLOOR)
        // //     }
        // // }
    }
}
//# sourceMappingURL=gen.js.map