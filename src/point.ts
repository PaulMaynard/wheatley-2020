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
    equals(p: Point) {
        return this.x == p.x && this.y == p.y
    }
    manhatan() {
        return Math.abs(this.x) + Math.abs(this.y)
    }
    chebyshev() {
        return Math.max(Math.abs(this.x), Math.abs(this.y))
    }
}