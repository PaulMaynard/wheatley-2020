import Tile, { TileProps } from "./tile.js";
import { Die } from "./dice.js";
import { Attack } from "./monster.js";
import Point from "./point.js";

interface ItemProps extends TileProps {
    attack?: Attack
}

class Item extends Tile {
    props: ItemProps
    pos: Point | undefined
    constructor(public name: string, ch: string, fg: string, bg?: string, props?: ItemProps) {
        super(ch, fg, bg, props)
        this.props = super.props
    }
}
namespace Item {}

export default Item