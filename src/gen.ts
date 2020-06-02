import Map, { CreateCallback } from "./lib/ROT/map/map.js"
import { RNG } from "./lib/ROT/index.js"
import Dungeon from "./lib/ROT/map/dungeon.js"

export enum Feature {
    FLOOR = 0,
    WALL = 1,
    DOOR = 2
}

function clamp(n: number, a: number, b: number) {
    return Math.min(Math.max(a, n), b)
}

// kinda hacky solution
export default class WheatleyGen extends Dungeon {
    constructor(width: number, height: number, private level: number, private size: number) {
        super(width, height)
    }
    create(cb: (x: number, y: number, contents: Feature) => void) {
        this._create(cb, this.size, this.level, !!RNG.getUniformInt(0,1),
                     0, this._width, 0, this._height)
        // close off edges
        for (let y = 0; y < this._width; y++) {
            cb(0, y, Feature.WALL)
            cb(this._width-1, y, Feature.WALL)
        }
        for (let x = 1; x < this._height-1; x++) {
            cb(x, 0, Feature.WALL)
            cb(x, this._height-1, Feature.WALL)
        }
    }
    private _create(cb: (x: number, y: number, contents: Feature) => void,
                    s: number, l: number, axis: boolean, x0: number, x1: number, y0: number, y1: number) {
        if (x1 < x0 || y1 < y0) return
        if (l > 1) { // hallways
            if (axis) { // x axis
                let x = clamp(RNG.getNormal((x0+x1)/2, (x1-x0)/5) | 0, x0+1+s, x1-l-1-s) //RNG.getUniformInt(x0+1, x1-l-1)
                let door1 = RNG.getUniformInt(0, 1)
                let door2 = RNG.getUniformInt(0, 1)

                for (let i = 0; i < l; i++) {
                    cb(x+i, y0-1, door1 ? Feature.DOOR : Feature.FLOOR)
                    cb(x+i, y1, door2 ? Feature.DOOR : Feature.FLOOR)
                }
                cb(x-1, y0-1, Feature.WALL)
                cb(x+l, y0-1, Feature.WALL)
                cb(x-1, y1, Feature.WALL)
                cb(x+l, y1, Feature.WALL)

                for(let y = y0; y < y1; y++) {
                    cb(x-1, y, Feature.WALL)
                    for (let i = 0; i < l; i++) {
                        cb(x+i, y, Feature.FLOOR)
                    }
                    cb(x+l, y, Feature.WALL)
                }
                this._create(cb, s, l-1, !axis, x0, x-1, y0, y1)
                this._create(cb, s, l-1, !axis, x+l+1, x1, y0, y1)

            } else {
                let y = clamp(RNG.getNormal((y0+y1)/2, (y1-y0)/5) | 0, y0+1+s, y1-l-1-s) //RNG.getUniformInt(y0+1, y1-l-1)
                let door1 = RNG.getUniformInt(0, 1)
                let door2 = RNG.getUniformInt(0, 1)
                for (let i = 0; i < l; i++) {
                    cb(x0-1, y+i, door1 ? Feature.DOOR : Feature.FLOOR)
                    cb(x1, y+i, door2 ? Feature.DOOR : Feature.FLOOR)
                }
                cb(x0-1, y-1, Feature.WALL)
                cb(x0-1, y+l, Feature.WALL)
                cb(x1, y-1, Feature.WALL)
                cb(x1, y+l, Feature.WALL)

                for(let x = x0; x < x1; x++) {
                    cb(x, y-1, Feature.WALL)
                    for (let i = 0; i < l; i++) {
                        cb(x, y+i, Feature.FLOOR)
                    }
                    cb(x, y+l, Feature.WALL)
                }
                this._create(cb, s, l-1, !axis, x0, x1, y0, y-1)
                this._create(cb, s, l-1, !axis, x0, x1, y+l+1, y1)
            }
        } else { // rooms
            for (let x = x0; x < x1; x++) {
                for (let y = y0; y < y1; y++) {
                    cb(x, y, Feature.WALL)
                }
            }
            if (RNG.getPercentage() < 10) return // empty block
            x0 = x0 || 1
            y0 = y0 || 1
            x1 = Math.min(x1, this._width-1)
            y1 = Math.min(y1, this._height-1)
            // top
            let sides = [
                () => { // top
                    if (y0 == 1 || y0 >= y1) return
                    let i = x0
                    let newy0 = y0
                    while (i < x1) {
                        let r = this._mkroom(
                            Math.min(Math.max(s, ((x1-x0)/8)|0, ((y1-y0)/4)|0), x1-x0),
                            x1-i+2,
                            Math.min(Math.max(s, ((x1-x0)/8)|0, ((y1-y0)/4)|0), x1-x0),
                            y1-y0+2)
                        for (let y = 0; y < r.length; y++) {
                            for (let x = 0; x < r[y].length; x++) {
                                if (r[y][x] != null) {
                                    cb(i+x-1, y0+y-1, r[y][x])
                                }
                            }
                            if (y0+y > newy0) {
                                newy0 = y0+y
                            }
                        }
                        i += r[0].length-1
                    }
                    y0 = newy0 - RNG.getUniformInt(0, s-2)
                },
                () => { // bottom
                    if (y1 == this._height-1 || y0 >= y1) return
                    let i = x0
                    let newy1 = y1
                    while (i < x1) {
                        let r = this._mkroom(
                            Math.min(Math.max(s, ((x1-x0)/8)|0, ((y1-y0)/4)|0), x1-x0),
                            x1-i+2,
                            Math.min(Math.max(s, ((x1-x0)/8)|0, ((y1-y0)/4)|0), x1-x0),
                            y1-y0+2)
                        for (let y = 0; y < r.length; y++) {
                            for (let x = 0; x < r[y].length; x++) {
                                if (r[y][x] != null) {
                                    cb(i+x-1, y1-y, r[y][x])
                                }
                            }
                            if (y1-y < newy1) {
                                newy1 = y1-y
                            }
                        }
                        i += r[0].length-1
                    }
                    y1 = newy1 + RNG.getUniformInt(0, s-2)

                },
                () => { // left
                    if (x0 == 1 || x0 >= x1) return
                    let i = y0
                    let newx0 = x0
                    while (i < y1) {
                        let r = this._mkroom(
                            Math.min(Math.max(s, ((y1-y0)/8)|0, ((x1-x0)/4)|0), y1-y0),
                            y1-i+2,
                            Math.min(Math.max(s, ((y1-y0)/8)|0, ((x1-x0)/4)|0), y1-y0),
                            x1-x0+2)
                        for (let x = 0; x < r.length; x++) {
                            for (let y = 0; y < r[x].length; y++) {
                                if (r[x][y] != null) {
                                    cb(x0+x-1, i+y-1, r[x][y])
                                }
                            }
                            if (x0+x > newx0) {
                                newx0 = x0+x
                            }
                        }
                        i += r[0].length-1
                    }
                    x0 = newx0 - RNG.getUniformInt(0, s-2)
                },
                () => { // right
                    if (x1 == this._height-1 || x0 >= x1) return
                    let i = y0
                    let newx1 = x1
                    while (i < y1) {
                        let r = this._mkroom(
                            Math.min(Math.max(s, ((y1-y0)/8)|0, ((x1-x0)/4)|0), y1-y0),
                            y1-i+2,
                            Math.min(Math.max(s, ((y1-y0)/8)|0, ((x1-x0)/4)|0), y1-y0),
                            x1-x0+2)
                        for (let x = 0; x < r.length; x++) {
                            for (let y = 0; y < r[x].length; y++) {
                                if (r[x][y] != null) {
                                    cb(x1-x, i+y-1, r[x][y])
                                }
                            }
                            if (x1-x < newx1) {
                                newx1 = x1-x
                            }
                        }
                        i += r[0].length-1
                    }
                    x1 = newx1 + RNG.getUniformInt(0, s-2)
                }
            ];
            RNG.shuffle(sides).forEach(s => s())
        }
    }
    private _mkroom(xmin: number, xmax: number, ymin: number, ymax: number): Feature[][] {
        let rtype = RNG.getPercentage()
        if (rtype <= 100) { // regular classroom
            let w = xmin + RNG.getUniformInt(-1, 2)
            let h = ymin
            if (xmax < xmin*2) {
                w = xmax
            }
            if (ymax < ymin*2) {
                h = ymax
            }
            let r = new Array(h)
            for (let y = 0; y < h; y++) {
                r[y] = new Array(w)
                for (let x = 0; x < w; x++) {
                    r[y][x] = Feature.FLOOR
                }
            }
            // walls
            for (let y = 0; y < h; y++) {
                r[y][0] = Feature.WALL
                r[y][w-1] = Feature.WALL
            }
            for (let x = 1; x < w-1; x++) {
                r[0][x] = Feature.WALL
                r[h-1][x] = Feature.WALL
            }
            r[0][RNG.getUniformInt(1, w-2)] = Feature.DOOR
            if (h == ymax && RNG.getUniformInt(0, 1)) {
                r[h-1][RNG.getUniformInt(1, w-2)] = Feature.DOOR
            }
            if (h > 3 && RNG.getPercentage() < 25) {
                console.log(h, r)
                r[RNG.getUniformInt(1, h-2)][0] = Feature.DOOR
            }
            if (h > 3 && RNG.getPercentage() < 25) {
                r[RNG.getUniformInt(1, h-2)][w-1] = Feature.DOOR
            }
            return r
        }
    }
}