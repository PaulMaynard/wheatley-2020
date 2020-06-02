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
    times(n) {
        return new Point(this.x * n, this.y * n);
    }
    right() {
        return new Point(this.y, -this.x);
    }
    equals(p) {
        return this.x == p.x && this.y == p.y;
    }
    manhattan() {
        return Math.abs(this.x) + Math.abs(this.y);
    }
    chebyshev() {
        return Math.max(Math.abs(this.x), Math.abs(this.y));
    }
}
//# sourceMappingURL=point.js.map