class KDTree {
    get(p) {
        return this._get(p, this.root);
    }
    _get(p, n) {
        if (n == null) {
            return;
        }
        else {
            let pos = n.axis ? p.x : p.y;
            if (pos == n.pos) {
                return n.elem;
            }
            else if (pos < n.pos) {
                return this._get(p, n.ul);
            }
            else if (pos > n.pos) {
                return this._get(p, n.dr);
            }
        }
    }
    put(p, v) {
        this._put(p, v, this.root, this.root?.axis);
    }
    _put(p, v, n, ax) {
        ax = ax ?? true;
        if (n) {
            let pos = n.axis ? p.x : p.y;
        }
    }
}
//# sourceMappingURL=kdtree.js.map