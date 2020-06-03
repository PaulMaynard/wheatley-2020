import Monster, { MonsterProps, Attack, Damage } from "./monster.js"
import Item, { items } from "./item.js"
import Tile from "./tile.js"
import { RNG } from "./lib/ROT/index.js"
import { die } from "./dice.js"

interface PlayerProps extends MonsterProps {
}

export class Player extends Monster {
    props: PlayerProps
    mana: number
    weapon: Item | undefined
    // items: Item[]
    isPlayer = true
    constructor(t: Tile, props: PlayerProps) {
        super('player', t.ch, t.fg, t.bg, props)
        this.props = props
        this.mana = props.maxmana ?? 1
        this.effects.push([(self) => {
            if (self.props.maxhealth && self.health < self.props.maxhealth && RNG.getPercentage() <= 10) {
                self.health++
            }
        }, ''])
        this.effects.push([(self, l) => {
            if (RNG.getPercentage() <= 1) {
                l.game.madness++
            }
        }, ''])
    }
    getAttack(): Attack {
        if (this.weapon?.props.attack) {
            return this.weapon.props.attack
        } else {
            return super.getAttack()
        }
    }
}
export let player = new Player(
    new Tile('@', 'goldenrod'),
    {
        desc: 'yourself',
        speed: 100,
        defsight: 10,
        maxhealth: 20,
        maxmana: 10,
        attacks: [
            [die('1d6'), ['dab on', 'yeet', 'cringe at', 'own', 'post at', 'dunk on'], Damage.CRINGE]
        ]
    }
)
// player.weapon = new Item('slide rule', '=', 'yellow', '', {
//     desc: 'a slide rule',
//     attack: [die('2d7'), [
//         'exponentiate', 'approximate', 'calculate', 'take the logarithm of'
//     ], Damage.MATH]
// })
player.weapon = items[0]