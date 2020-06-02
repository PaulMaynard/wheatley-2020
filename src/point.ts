export default class Point {

    constructor(public x: number, public y: number) {}
    *[Symbol.iterator]() {
        yield this.x
        yield this.y
    }
    plus(p: Point) {
        return new Point(this.x + p.x, this.y + p.y)
    }
    minus(p: Point) {
        return new Point(this.x - p.x, this.y - p.y)
    }
    times(n: number) {
        return new Point(this.x * n, this.y * n)
    }
    right() {
        return new Point(this.y, -this.x)
    }
    equals(p: Point) {
        return this.x == p.x && this.y == p.y
    }
    manhattan() {
        return Math.abs(this.x) + Math.abs(this.y)
    }
    chebyshev() {
        return Math.max(Math.abs(this.x), Math.abs(this.y))
    }
}