export default class Tile {
    constructor(ch, fg, bg = { desc: '' }, props = { desc: '' }) {
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
    tiles.wall = new Tile('#', 'white', {
        desc: 'a wall',
        impassable: true,
        opaque: true
    });
    tiles.floor = new Tile('.', 'white', {
        desc: 'a floor'
    });
    tiles.opendoor = new Tile('\'', 'brown', {
        desc: 'an opened door'
    });
    tiles.door = new Tile('+', 'brown', {
        desc: 'a door',
        impassable: true,
        opaque: true,
        open: tiles.opendoor
    });
    tiles.opendoor.props.close = tiles.door;
})(tiles || (tiles = {}));
//# sourceMappingURL=tile.js.map