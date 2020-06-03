import { RNG } from "./lib/ROT/index.js";
export class Die {
    constructor() {
        this.amt = 1;
    }
    roll() {
        return this.rolls().reduce((a, b) => a + b, 0);
    }
    plus(d) {
        if (d instanceof Sum) {
            return new Sum([this].concat(...d.dice));
        }
        else {
            return new Sum([this, d]);
        }
    }
    neg() {
        return new Neg(this);
    }
}
class Roll extends Die {
    constructor(amt, sides) {
        if (!sides) {
            sides = amt;
            amt = 1;
        }
        super();
        this.amt = amt;
        this.sides = sides;
    }
    rolls() {
        let l = new Array(this.amt);
        for (var i = 0; i < this.amt; i++) {
            l[i] = RNG.getUniformInt(1, this.sides);
        }
        return l;
    }
    toString() {
        return this.amt + 'd' + this.sides;
    }
}
class Const extends Die {
    constructor(val) {
        super();
        this.val = val;
    }
    rolls() {
        return [this.val];
    }
    neg() {
        return new Const(-this.val);
    }
    toString() {
        return '' + this.val;
    }
}
class Neg extends Die {
    constructor(die) {
        super();
        this.die = die;
        this.amt = die.amt;
    }
    rolls() {
        return this.die.rolls().map(r => -r);
    }
    neg() {
        return this.die;
    }
    toString() {
        return '-' + this.die;
    }
}
class Sum extends Die {
    constructor(dice) {
        super();
        this.dice = dice;
        this.amt = dice.reduce((a, b) => a + b.amt, 0);
    }
    rolls() {
        let rs = [];
        for (let d of this.dice) {
            rs.push(...d.rolls());
        }
        return rs;
    }
    plus(d) {
        return new Sum(this.dice.concat(d));
    }
    neg() {
        return new Sum(this.dice.map(d => d.neg()));
    }
    toString() {
        return this.dice.join(' + ');
    }
}
let specs = [
    [/^(\d+)d(\d+)$/i, (_, s, a) => new Roll(+s, +a)],
    [/^(-?\d+)$/i, (_, n) => new Const(+n)],
    [/^-(\w+)$/i, (_, d) => die(d).neg()],
    [/^(.+?)\s*\+\s*(.+)$/i, (_, a, b) => die(a).plus(die(b))]
];
export function die(s) {
    for (let [spec, fn] of specs) {
        let m = spec.exec(s);
        if (m) {
            return fn(...m);
        }
    }
    throw new SyntaxError("Invalid die: " + s);
}
//# sourceMappingURL=dice.js.map