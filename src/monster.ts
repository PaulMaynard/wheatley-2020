import Tile, { TileProps } from './tile.js'
import Point from './point.js'
import { RNG, Util } from './lib/ROT/index.js'
import { Level } from './level.js'
import { Die, die } from './dice.js'

enum Damage {
    PHYSICAL = 'physical',
    POISON = 'poison',
    WEED = 'weed',
    GROSS = 'gross',
    SPOOKY = 'spooky',
    LECTURE = 'lecture',
    MATH = 'math',
    RECURSION = 'recursion',
    CS = 'computer',
    LITERATURE = 'literature',
    RELIGION = 'religion',
    ANIME = 'anime',
    CRINGE = 'cringe',
    COVID = 'coronavirus',
    LOGIC = 'logic'
}
let deaths = {
    [Damage.LECTURE]: [' have failed', ' has failed'],
    [Damage.MATH]: [' are left as an exercise for the reader', ' is left as an exercise for the reader'],
    [Damage.RECURSION]: ['r stack has overflowed', "'s stack has overflowed"],
    [Damage.CS]: [' have been garbage collected', 'has been garbage collected'],
    [Damage.RELIGION]: [' are condemned to hell', ' is condemned to hell'],
    [Damage.ANIME]: [' are sent to the shadow realm!!', ' is sent to the shadow realm!!'],
    [Damage.CRINGE]: [' loose subscriber', ' looses subscriber'],
    [Damage.COVID]: [' die of Coronavirus', ' dies of Coronavirus'],
    [Damage.LOGIC]: [' are destroyed by facts and logic', ' is destroyed by facts and logic'],
}

interface MonsterProps extends TileProps {
    speed?: number
    inactive?: boolean
    friendly?: boolean
    sight?: number
    maxhealth?: number
    weapons?: [Die, string[], Damage][]
    resistance?: {[d in Damage]?: number}
}

export default class Monster extends Tile {
    name: string
    pos: Point
    props: MonsterProps
    health: number
    active: boolean
    effects: [((m: Monster, l?: Level) => void), string][]
    constructor(name: string, tile: Tile, props: MonsterProps)
    constructor(name: string, ch: string, fg: string, bg: string, props: MonsterProps)
    constructor(name: string, ch: string, fg: string, props: MonsterProps)
    constructor(
        name: string,
        ch: any, fg?: any, bg?: any,
        props?: any
    ) {
        if (ch instanceof Tile) { // constructor 1
            super(ch.ch, ch.fg, ch.bg, fg)
        } else if (typeof bg == 'string') { //constructor 2
            super(ch, fg, bg, props)
        } else { // constructor 3
            super(ch, fg, '', bg)
        }
        this.name = name
        this.health = this.props.maxhealth = null ? 1 : this.props.maxhealth
        if (this.props.impassable == null) {
            this.props.impassable = true
        }
        this.active = false
        this.effects = []
    }
    getSpeed(): number {
        return this.props.speed || 100
    }
    act(level: Level) {
        for (let [eff, _] of this.effects) {
            eff(this, level)
        }
        if (!(this.props.inactive || this instanceof Player)) {
            let mv: Point
            if (!this.props.friendly) {
                let ppos: Point = null
                level.fov.compute(this.pos.x, this.pos.y, this.props.sight, (x, y, v) => {
                    let p = new Point(x, y)
                    if (level.in(p) && level.tile(p) == player) {
                        ppos = p
                    }
                })
                if (ppos) {
                    mv = ppos.minus(this.pos)
                    if (mv.x > 0) {
                        mv.x = 1
                    } else if (mv.x < 0) {
                        mv.x = -1
                    }
                    if (mv.y > 0) {
                        mv.y = 1
                    } else if (mv.y < 0) {
                        mv.y = -1
                    }
                }
            }
            if (!mv) {
                let p = new Point(RNG.getUniformInt(-1, 1), RNG.getUniformInt(-1, 1))
                if (!p.equals(new Point(0, 0))) {
                    mv = p
                }
            }
            if (mv) {
                this.move(level, this.pos.plus(mv))
            }
        }
    }
    move(level: Level, pos: Point) {
        let tile = level.tile(pos)
        if (!tile.props.impassable) {
            this.pos = pos
        } else if (tile.props.open) {
            level.tiles[pos.y][pos.x] = tile.props.open
        } else if (tile instanceof Monster && this.props.weapons && tile.health) {
            let log = this.hit(tile)
            level.seen[pos.y][pos.x]
            if (level.seen[pos.y][pos.x] > 0) {
                log.forEach(m => level.game.log(m))
            }
        }
    }
    hit(mon: Monster): string[] {
        let weapon = RNG.getItem(this.props.weapons)
        let dam = weapon[0].roll()
        let res = 0
        if (mon.props.resistance && weapon[2] in mon.props.resistance) {
            res = mon.props.resistance[weapon[2]]
        }
        let adj = dam - res
        if ((dam > 0 && adj > 0) || dam < 0 && adj < 0) {
            mon.health -= dam
        }
        let msgs: string[] = []
        if (this instanceof Player) {
            msgs.push('You ' + RNG.getItem(weapon[1]) + ' the ' + mon.name +
                ' for ' + dam + ' damage')
        } else if (mon instanceof Player) {
            msgs.push('The ' + this.name + ' ' + RNG.getItem(weapon[1]) +
                ' you for ' + dam + ' damage')
        } else {
            msgs.push('The ' + this.name + ' ' + RNG.getItem(weapon[1]) + ' the ' + mon.name +
                ' for ' + dam + ' damage')
        }
        if (mon.health <= 0) {
            if (weapon[2] in deaths) {
                if (mon instanceof Player) {
                    msgs.push('You' + deaths[weapon[2]][0] + '!')
                } else {
                    msgs.push('The ' + mon.name + deaths[weapon[2]][1] + '!')
                }
            } else {
                if (mon instanceof Player) {
                    msgs.push('You die!')
                } else {
                    msgs.push('The ' + mon.name + ' dies!')
                }
            }
        }
        return msgs
    }
}
type MonSpec = [number, string, string, string, MonsterProps]

export function mkMonster(m: MonSpec): Monster {
    let [w, ...as] = m
    return new Monster(...as)
}

export let monsters: {[n: string]: MonSpec} = {
    roach: [.1, 'roach', 'r', 'brown', {
        desc: 'a monstrous roach',
        sight: 5,
        maxhealth: 5,
        weapons: [[die('1d6'), ['disgusts'], Damage.GROSS]],
    }],
    bee: [.1, 'bee', 'B', 'yellow', {
        desc: 'a friendly bee',
        sight: 5,
        friendly: true,
        maxhealth: 2,
        weapons: [[die('1d4'), ['stings'], Damage.POISON]],
        resistance: {
            [Damage.WEED]: -2
        }
    }],
    wasp: [.1, 'wasp', 'w', 'yellow', {
        desc: 'an angry wasp',
        sight: 5,
        speed: 200,
        maxhealth: 2,
        weapons: [[die('1d4'), ['stings'], Damage.POISON]],
        resistance: {
            [Damage.WEED]: -2
        }
    }],
    prof: [.2, 'professor', 'P', 'lightblue', {
        desc: 'a wandering professor',
        sight: 9,
        maxhealth: 10,
        weapons: [[die('1d8'), ['lectures', 'confuses', 'harshly grades', 'curves'], Damage.LECTURE]],
        resistance: {
            [Damage.LECTURE]: 2
        }
    }],
    mprof: [.1, 'math professor', 'P', 'red', {
        desc: 'a math professor',
        sight: 9,
        maxhealth: 10,
        weapons: [
            [die('1d8'), ['disproves', 'measures', 'calculates', 'integrates', 'divides'], Damage.MATH],
            [die('1d8'), ['recurses', 'performs induction on'], Damage.RECURSION]
        ],
        resistance: {
            [Damage.LECTURE]: 2,
            [Damage.RECURSION]: 3
        }
    }],
    preacher: [.1, 'preacher', 'P', 'yellow', {
        desc: 'a street preacher',
        sight: 12,
        maxhealth: 10,
        weapons: [[die('1d6'), ['hurls brimstone at', 'devolves', 'berates', 'damns', 'debates'], Damage.RELIGION]],
        resistance: {
            [Damage.LOGIC]: 4
        }
    }],
    student: [.2, 'student', '@', 'green', {
        desc: 'a lost student',
        friendly: true,
        sight: 10,
        maxhealth: 6,
        weapons: [[die('1d12'), ['coughs on', 'sneezes at', 'breathes on'], Damage.COVID]],
        resistance: {
            [Damage.LECTURE]: -2,
            [Damage.WEED]: 2
        }
    }]
}
let weight = 0
for (let n in monsters) {
    weight += monsters[n][0]
}

export function genMonster() {
    let pct = RNG.getUniform() * weight
    for (let n in monsters) {
        let s = monsters[n]
        pct -= s[0]
        if (pct < 0) {
            return mkMonster(s)
        }
    }
}

interface PlayerProps extends MonsterProps {
    maxmana: number
}

export class Player extends Monster {
    props: PlayerProps
    mana: number
    constructor(t: Tile, props: PlayerProps) {
        super('player', t, props)
        this.mana = this.props.maxmana
        this.effects.push([(self) => {
            if (self.health < self.props.maxhealth && RNG.getPercentage() <= 10) {
                self.health++
            }
        }, ''])
        this.effects.push([(self, l) => {
            if (RNG.getPercentage() <= 1) {
                l.game.madness++
            }
        }, ''])
    }
}
export let player = new Player(
    new Tile('@', 'goldenrod'),
    {
        desc: 'yourself',
        speed: 100,
        sight: 10,
        maxhealth: 20,
        maxmana: 10,
        weapons: [
            [die('1d6'), ['dab on', 'yeet', 'cringe at', 'own', 'post at', 'dunk on'], Damage.CRINGE]
        ]
    }
)