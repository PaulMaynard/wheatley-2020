import Map, { CreateCallback } from "./lib/ROT/map/map.js"
import { RNG } from "./lib/ROT/index.js"
import Dungeon from "./lib/ROT/map/dungeon.js"
import Tile from "./tile.js"
import Monster, { monsters, mkMonster } from "./monster.js"
import Item from "./item.js"

export enum Feature {
    FLOOR = 0,
    WALL = 1,
    DOOR = 2
}

function clamp(n: number, a: number, b: number) {
    return Math.min(Math.max(a, n), b)
}

export abstract class Gen {
    constructor(
        protected _width: number,
        protected _height: number
    ) {}
    abstract create(cb: (x: number, y: number, contents: Tile, m?: Monster, i?: Item) => void): void
}

export default class WheatleyGen extends Gen {
    constructor(width: number, height: number, private level: number, private size: number) {
        super(width, height)
    }
    create(cb: (x: number, y: number, contents: Tile, m?: Monster, i?: Item) => void) {
        let cbhelper = (x: number, y: number, v: Tile, m?: Monster, i?: Item) => {
            if (!(x < 0 || x >= this._width || y < 0 || y >= this._height)) {
                cb(x, y, v, m)
            }
        }
        this._create(cbhelper, this.size, this.level, !!RNG.getUniformInt(0,1),
                     0, this._width, 0, this._height)
        // close off edges
        for (let y = 0; y < this._width; y++) {
            cbhelper(0, y, Tile.wall)
            cbhelper(this._width-1, y, Tile.wall)
        }
        for (let x = 1; x < this._height-1; x++) {
            cbhelper(x, 0, Tile.wall)
            cbhelper(x, this._height-1, Tile.wall)
        }
    }
    private _create(cb: (x: number, y: number, contents: Tile, m?: Monster, i?: Item) => void,
                    s: number, l: number, axis: boolean, x0: number, x1: number, y0: number, y1: number) {
        if (x1 < x0 || y1 < y0) return
        if (l > 1) { // hallways
            if (axis) { // x axis
                let x = clamp(RNG.getNormal((x0+x1)/2, (x1-x0)/5) | 0, x0+1+s, x1-l-1-s) //RNG.getUniformInt(x0+1, x1-l-1)
                let door1 = RNG.getUniformInt(0, 1)
                let door2 = RNG.getUniformInt(0, 1)

                for (let i = 0; i < l; i++) {
                    cb(x+i, y0-1, door1 ? Tile.door : Tile.floor)
                    cb(x+i, y1, door2 ? Tile.door : Tile.floor)
                }
                cb(x-1, y0-1, Tile.wall)
                cb(x+l, y0-1, Tile.wall)
                cb(x-1, y1, Tile.wall)
                cb(x+l, y1, Tile.wall)

                for(let y = y0; y < y1; y++) {
                    cb(x-1, y, Tile.wall)
                    for (let i = 0; i < l; i++) {
                        cb(x+i, y, Tile.floor)
                    }
                    cb(x+l, y, Tile.wall)
                }
                this._create(cb, s, l-1, !axis, x0, x-1, y0, y1)
                this._create(cb, s, l-1, !axis, x+l+1, x1, y0, y1)

            } else {
                let y = clamp(RNG.getNormal((y0+y1)/2, (y1-y0)/5) | 0, y0+1+s, y1-l-1-s) //RNG.getUniformInt(y0+1, y1-l-1)
                let door1 = RNG.getUniformInt(0, 1)
                let door2 = RNG.getUniformInt(0, 1)
                for (let i = 0; i < l; i++) {
                    cb(x0-1, y+i, door1 ? Tile.door : Tile.floor)
                    cb(x1, y+i, door2 ? Tile.door : Tile.floor)
                }
                cb(x0-1, y-1, Tile.wall)
                cb(x0-1, y+l, Tile.wall)
                cb(x1, y-1, Tile.wall)
                cb(x1, y+l, Tile.wall)

                for(let x = x0; x < x1; x++) {
                    cb(x, y-1, Tile.wall)
                    for (let i = 0; i < l; i++) {
                        cb(x, y+i, Tile.floor)
                    }
                    cb(x, y+l, Tile.wall)
                }
                this._create(cb, s, l-1, !axis, x0, x1, y0, y-1)
                this._create(cb, s, l-1, !axis, x0, x1, y+l+1, y1)
            }
        } else { // rooms
            for (let x = x0; x < x1; x++) {
                for (let y = y0; y < y1; y++) {
                    cb(x, y, Tile.wall)
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
                                    cb(i+x-1, y0+y-1, ...r[y][x])
                                }
                            }
                            if (y0+y > newy0) {
                                newy0 = y0+y
                            }
                        }
                        i += r[0].length-1
                    }
                    y0 = newy0 //- RNG.getUniformInt(0, s-2)
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
                                    cb(i+x-1, y1-y, ...r[y][x])
                                }
                            }
                            if (y1-y < newy1) {
                                newy1 = y1-y
                            }
                        }
                        i += r[0].length-1
                    }
                    y1 = newy1 //+ RNG.getUniformInt(0, s-2)

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
                                    let t = r[x][y][0]
                                    cb(x0+x-1, i+y-1, t.props.flip ? t.props.flip : t)
                                }
                            }
                            if (x0+x > newx0) {
                                newx0 = x0+x
                            }
                        }
                        i += r[0].length-1
                    }
                    x0 = newx0 //- RNG.getUniformInt(0, s-2)
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
                                    let t = r[x][y][0]
                                    cb(x1-x, i+y-1, t.props.flip ? t.props.flip : t)
                                }
                            }
                            if (x1-x < newx1) {
                                newx1 = x1-x
                            }
                        }
                        i += r[0].length-1
                    }
                    x1 = newx1 //+ RNG.getUniformInt(0, s-2)
                }
            ];
            RNG.shuffle(sides).forEach(s => s())
        }
    }
    private _mkroom(xmin: number, xmax: number, ymin: number, ymax: number): [Tile, Monster | undefined, Item | undefined][][] {
        let w = Math.max(3, xmin + RNG.getUniformInt(-1, 2))
        let h = ymin + RNG.getUniformInt(0, 2)
        if (xmax < xmin*2) {
            w = xmax
        }
        if (ymax < ymin*2) {
            h = ymax
        }
        let r: [Tile, Monster | undefined, Item | undefined][][] = new Array(h)
        for (let y = 0; y < h; y++) {
            r[y] = new Array(w)
            for (let x = 0; x < w; x++) {
                r[y][x] = [Tile.floor, undefined, undefined]
            }
        }
        if (w > 0) {
            // walls
            for (let y = 0; y < h; y++) {
                    r[y][0][0] = Tile.wall
                    r[y][w-1][0] = Tile.wall
            }
            for (let x = 1; x < w-1; x++) {
                r[0][x][0] = Tile.wall
                r[h-1][x][0] = Tile.wall
            }
            // doors
            if (RNG.getUniformInt(0, 1)) {
                r[0][1][0] = Tile.door
            } else {
                r[0][w-2][0] = Tile.door
            }
        }

        let rtype = RNG.getPercentage()
        let done = false
        if (rtype <= 100) {
            for (let prefab of RNG.shuffle(prefabs)) {
                if (h == prefab.length && w == prefab[0].length) {
                    for (let y = 0; y < prefab.length; y++) {
                        for (let x = 0; x < prefab[y].length; x++) {
                            r[y][x][0] = ts[prefab[y][x]] ?? Tile.floor
                        }
                    }
                    done = true
                    break
                }
            }
        }
        if (!done && rtype <= 90 && w > 5 && h > 7) { // regular classroom
            // monsters

            // furniture
            for (let x = 2; x < w-2; x++) {
                r[1][x][0] = Tile.hboard
            }
            let students = RNG.getPercentage() <= 10
            if (students) {
                r[1][w>>1][1] = mkMonster(RNG.getItem([Monster.prof, Monster.mprof]))
            }
            for (let x = RNG.getUniformInt(1,2); x < w-1; x += 2) {
                for (let y = 3; y < h-1; y += 1) {
                    r[y][x][0] = Tile.desk
                    if (students && RNG.getPercentage() <= 40) {
                        r[y][x][1] = mkMonster(Monster.student)
                    }
                }
            }
            // extra doors
            if (h == ymax && RNG.getUniformInt(0, 1)) {
                r[h-1][RNG.getUniformInt(1, w-2)][0] = Tile.door
            }
            if (h > 3 && RNG.getPercentage() < 25) {
                r[RNG.getUniformInt(1, h-2)][0][0] = Tile.door
            }
            if (h > 3 && RNG.getPercentage() < 25) {
                r[RNG.getUniformInt(1, h-2)][w-1][0] = Tile.door
            }
        }
        return r
    }
}

let prefabs = [
    [
        '####+####',
        '#.......#',
        '#.R...R.#',
        '#.......#',
        '#.......#',
        '#.R...R.#',
        '#..RRR..#',
        '#.......#',
        '#########',
    ],
    [
        '####+####',
        '#.......#',
        '#.|..||.#',
        '#.......#',
        '#.||.|-.#',
        '#.......#',
        '#########',
    ]
]
let ts: {[t: string]: Tile} = {
    '#': Tile.wall,
    '.': Tile.floor,
    '+': Tile.door,
    'R': Tile.desk,
    '|': Tile.vboard,
    '-': Tile.hboard,
}

console.log(prefabs[1][0].length)