import Tile from "./tile.js";
class Item extends Tile {
    constructor(name, ch, fg, props) {
        super(ch, fg, props);
        this.name = name;
        this.props = super.props;
    }
}
export default Item;
//# sourceMappingURL=item.js.map