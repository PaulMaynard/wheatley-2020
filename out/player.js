import Monster, { Damage } from "./monster.js";
import { items } from "./item.js";
import Tile from "./tile.js";
import { RNG } from "./lib/ROT/index.js";
import { die } from "./dice.js";
export class Player extends Monster {
    constructor(t, props) {
        super('player', t.ch, t.fg, t.bg, props);
        // items: Item[]
        this.isPlayer = true;
        this.props = props;
        this.mana = props.maxmana ?? 1;
        this.effects.push([(self) => {
                if (self.props.maxhealth && self.health < self.props.maxhealth && RNG.getPercentage() <= 10) {
                    self.health++;
                }
            }, '']);
        this.effects.push([(self, l) => {
                if (RNG.getPercentage() <= 1) {
                    l.game.madness++;
                }
            }, '']);
    }
    getAttack() {
        if (this.weapon?.props.attack) {
            return this.weapon.props.attack;
        }
        else {
            return super.getAttack();
        }
    }
}
export let player = new Player(new Tile('@', 'goldenrod'), {
    desc: 'yourself',
    speed: 100,
    defsight: 10,
    maxhealth: 20,
    maxmana: 10,
    attacks: [
        [die('1d6'), ['dab on', 'yeet', 'cringe at', 'own', 'post at', 'dunk on', 'vibe check'], Damage.CRINGE]
    ]
});
player.weapon = items[0];
//# sourceMappingURL=player.js.map