import { RNG } from "./lib/ROT/index.js"

export abstract class Die {
    amt: number = 1
    roll() {
        return this.rolls().reduce((a, b) => a + b, 0)
    }
    abstract rolls(): number[]
    plus(d: Die): Die {
        if (d instanceof Sum) {
            return new Sum([this as Die].concat(...d.dice))
        } else {
            return new Sum([this, d])
        }
    }
    neg(): Die {
        return new Neg(this)
    }
}
class Roll extends Die {
    sides: number
    constructor(sides: number)
    constructor(amt: number, sides: number)
    constructor(amt: number, sides?: number) {
        if (!sides) {
            sides = amt
            amt = 1
        }
        super()
        this.amt = amt
        this.sides = sides
    }
    rolls() {
        let l = new Array(this.amt)
        for (var i = 0; i < this.amt; i++) {
            l[i] = RNG.getUniformInt(1, this.sides)
        }
        return l
    }
    toString() {
        return this.amt + 'd' + this.sides
    }
}
class Const extends Die {
    constructor(public val: number) {
        super()
    }
    rolls() {
        return [this.val]
    }
    neg() {
        return new Const(-this.val)
    }
    toString() {
        return '' + this.val
    }
}
class Neg extends Die {
    constructor(public die: Die) {
        super()
        this.amt = die.amt
    }
    rolls() {
        return this.die.rolls().map(r => -r)
    }
    neg() {
        return this.die
    }
    toString() {
        return '-' + this.die
    }
}
class Sum extends Die {
    constructor(public dice: Die[]) {
        super()
        this.amt = dice.reduce((a, b) => a + b.amt, 0)
    }
    rolls() {
        let rs = []
        for (let d of this.dice) {
            rs.push(...d.rolls())
        }
        return rs
    }
    plus(d: Die) {
        return new Sum(this.dice.concat(d))
    }
    neg() {
        return new Sum(this.dice.map(d => d.neg()))
    }
    toString() {
        return this.dice.join(' + ')
    }
}

let specs: [RegExp, (...ms: string[]) => Die][] = [
    [/^(\d+)d(\d+)$/i, (_, s, a) => new Roll(+s, +a)],
    [/^(-?\d+)$/i, (_, n) => new Const(+n)],
    [/^-(\w+)$/i, (_, d) => die(d).neg()],
    [/^(.+?)\s*\+\s*(.+)$/i, (_, a, b) => die(a).plus(die(b))]
]

export function die(s: string): Die {
    for (let [spec, fn] of specs) {
        let m = spec.exec(s)
        if (m) {
            return fn(...m)
        }
    }
    throw new SyntaxError("Invalid die: " + s)
}
