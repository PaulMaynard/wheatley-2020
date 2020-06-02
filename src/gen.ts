import Map, { CreateCallback } from "./lib/ROT/map/map.js"
import { RNG } from "./lib/ROT/index.js"

export enum Feature {
    FLOOR = 0,
    WALL = 1,
    DOOR = 2
}

// kinda hacky solution
export default class WheatleyGen extends Map {
    constructor(width: number, height: number, private level: number, private size: number) {
        super(width, height)
    }
    create(cb: (x: number, y: number, contents: Feature) => void) {
        this._create(cb, this.size, this.level, !!RNG.getUniformInt(0,1),
                     0, this._width, 0, this._height)
    }
    private _create(cb: (x: number, y: number, contents: Feature) => void,
                    s: number, l: number, axis: boolean, x0: number, x1: number, y0: number, y1: number) {
        // console.log('_create(cb', s,  l, axis, x0, x1, y0, y1, ')')
        if (x1 - x0 > 5 || y1 - y0 > 5) {
            if (axis) { // x axis
                let x = RNG.getUniformInt(x0, x1-1)
                // console.log('create hall at x = ', x)
                for(let y = y0; y < y1; y++) {
                    cb(x, y, l > 0 ? Feature.DOOR : Feature.WALL)
                }
                this._create(cb, s, l-1, !axis, x0, x, y0, y1)
                this._create(cb, s, l-1, !axis, x+1, x1, y0, y1)
            } else {
                let y = RNG.getUniformInt(y0, y1-1)
                // console.log('create hall at y = ', y)
                for(let x = x0; x < x1; x++) {
                    cb(x, y, l > 0 ? Feature.DOOR : Feature.WALL)
                }
                this._create(cb, s, l-1, !axis, x0, x1, y0, y)
                this._create(cb, s, l-1, !axis, x0, x1, y+1, y1)
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