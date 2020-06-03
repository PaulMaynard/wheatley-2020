import Tile, { TileProps } from "./tile.js";
import { Die, die } from "./dice.js";
import { Attack, Damage } from "./monster.js";
import Point from "./point.js";

interface ItemProps extends TileProps {
    attack?: Attack
}

class Item extends Tile {
    props: ItemProps
    pos: Point | undefined
    constructor(public name: string, ch: string, fg: string, bg: string, props: ItemProps) {
        super(ch, fg, bg, props)
        this.props = props
    }
}
console.log(Damage)
export let items = [
    new Item('burrito', '=', 'tan', '', {
        desc: 'a monoid in the category of endofunctors',
        attack: [die('1d8'), [
            'bind', 'recurse on',
            ['check', ' for termination'],
            ['lift', ' into a monadic context'],
            'pattern match on',
            'purify'
        ], Damage.RECURSION]
    }),
    new Item('slide rule', '=', 'yellow', '', {
        desc: 'a slide rule',
        attack: [die('2d7'), [
            'exponentiate', 'approximate', 'calculate', 'take the logarithm of'
        ], Damage.MATH]
    }),
    new Item('hammer and sickle', '☭', 'red', '', {
        desc: 'the symbol of liberation of the working class',
        attack: [die('5'), [
            'collectivize',
            ['seize', '\'s means of production'],
            ['propagandize', ' by the deed'],
            'hammer',
            ['slash', ' with your sickle'],
            'gulag'
        ], Damage.COMMUNISM]
    })
]

export default Item
