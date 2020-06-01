export default class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }
    plus(p) {
        return new Point(this.x + p.x, this.y + p.y);
    }
    minus(p) {
        return new Point(this.x - p.x, this.y - p.y);
    }
    equals(p) {
        return this.x == p.x && this.y == p.y;
    }
}
//# sourceMappingURL=point.js.map