import Tile from "./tile.js";
class Item extends Tile {
    constructor(name, ch, fg, bg, props) {
        super(ch, fg, bg, props);
        this.name = name;
        this.props = super.props;
    }
}
export default Item;
//# sourceMappingURL=item.js.map