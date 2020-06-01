export default class Tile {
    constructor(ch, fg, bg = {}, props = {}) {
        this.ch = ch;
        this.fg = fg;
        if (typeof bg != 'string') {
            props = bg;
            bg = 'black';
        }
        this.bg = bg;
        this.props = props;
    }
    draw(display, p, fg = this.fg, bg = this.bg) {
        display.draw(p.x, p.y, this.ch, fg, bg);
    }
}
export var tiles;
(function (tiles) {
    tiles.wall = new Tile('#', 'white', { impassable: true, opaque: true });
    tiles.floor = new Tile('.', 'white');
    tiles.opendoor = new Tile(',', 'brown');
    tiles.door = new Tile('+', 'brown', {
        impassable: true,
        opaque: true,
        open: tiles.opendoor
    });
    tiles.opendoor.props.close = tiles.door;
})(tiles || (tiles = {}));
//# sourceMappingURL=tile.js.map