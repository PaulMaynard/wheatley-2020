export class Tile {
    constructor(ch, fg, bg = { desc: '' }, props = { desc: '' }) {
        this.ch = ch;
        this.fg = fg;
        if (typeof bg != 'string') {
            props = bg;
            bg = '';
        }
        this.bg = bg;
        this.props = props;
    }
    draw(display, p, fg = this.fg, bg = this.bg) {
        display.draw(p.x, p.y, this.ch, fg, bg);
    }
}
(function (Tile) {
    Tile.wall = new Tile('#', 'white', {
        desc: 'a wall',
        impassable: true,
        opaque: true
    });
    Tile.floor = new Tile('.', 'white', {
        desc: 'a floor'
    });
    Tile.opendoor = new Tile('\'', 'brown', {
        desc: 'an opened door'
    });
    Tile.door = new Tile('+', 'brown', {
        desc: 'a door',
        impassable: true,
        opaque: true,
        open: Tile.opendoor
    });
    Tile.opendoor.props.close = Tile.door;
})(Tile || (Tile = {}));
export default Tile;
//# sourceMappingURL=tile.js.map