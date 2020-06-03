import Point from "./point";

interface KDNode<T> {
    elem: T
    axis: boolean
    pos: number
    ul?: KDNode<T>
    dr?: KDNode<T>
}

class KDTree<T> {
    root?: KDNode<T>
    get(p: Point): T | undefined {
        return this._get(p, this.root)
    }
    private _get(p: Point, n?: KDNode<T>): T | undefined {
        if (n == null) {
            return
        } else {
            let pos = n.axis ? p.x : p.y
            if (pos == n.pos) {
                return n.elem
            } else if (pos < n.pos) {
                return this._get(p, n.ul)
            } else if (pos > n.pos) {
                return this._get(p, n.dr)
            }
        }
    }
    put(p: Point, v: T) {
        this._put(p, v, this.root, this.root?.axis)
    }
    private _put(p: Point, v: T, n?: KDNode<T>, ax?: boolean) {
        ax = ax ?? true
        if (n) {
            let pos = n.axis ? p.x : p.y
        }
    }
}