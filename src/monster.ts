import Tile, { TileProps } from './tile.js'
import Point from './point.js'
import { RNG, Util } from './lib/ROT/index.js'
import FOV from './lib/ROT/fov/fov.js'
import RecursiveShadowcasting from './lib/ROT/fov/recursive-shadowcasting.js'
import { Level } from './level.js'
import { Die, die } from './dice.js'
import { Game } from './game.js'

enum Damage {
    PHYSICAL = 'physical',
    POISON = 'poison',
    WEED = 'weed',
    GROSS = 'gross',
    SPOOKY = 'spooky',
    LECTURE = 'lecture',
    MATH = 'math',
    RECURSION = 'recursion',
    LITERATURE = 'literature',
    BIGOTRY = 'bigotry',
    CRINGE = 'cringe',
    COVID = 'coronavirus'
}
let deaths = {
    [Damage.LECTURE]: ['are bored to death', 'is bored to death'],
    [Damage.MATH]: ['are left as an exercise for the reader', 'is left as an exercise for the reader'],
    [Damage.RECURSION]: ['are sent into an infinite loop', 'is sent into an infinite loop'],
    [Damage.CRINGE]: ['have been owned', 'has been owned'],
    [Damage.COVID]: ['dies of Coronavirus', 'dies of Coronavirus'],
}

interface MonsterProps extends TileProps {
    speed?: number
    inactive?: boolean
    player?: boolean
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
    constructor(name: string, tile: Tile, props?: MonsterProps)
    constructor(name: string, ch: string, fg: string, bg: string, props?: MonsterProps)
    constructor(name: string, ch: string, fg: string, props?: MonsterProps)
    constructor(
        name: string,
        ch: string | Tile, fg?: string | MonsterProps, bg?: string | MonsterProps,
        props?: MonsterProps
    ) {
        if (typeof fg != 'string') {
            props = fg
            fg = ''
        }
        if (typeof bg != 'string') {
            props = bg
            bg = ''
        }
        if (typeof ch != 'string') {
            let tile = ch
            ch = tile.ch
            fg = tile.fg
            bg = tile.bg
        }
        if (!props) {
            props = {desc: ''}
        }
        if (props.impassable == null) props.impassable = true
        super(ch, fg, bg, props)
        this.name = name
        this.health = props.maxhealth = null ? 1 : props.maxhealth
    }
    getSpeed(): number {
        return this.props.speed || 100
    }
    act(level: Level) {
        if (!(this.props.inactive || this.props.player)) {
            let p = new Point(RNG.getUniformInt(-1, 1), RNG.getUniformInt(-1, 1))
            if (!p.equals(new Point(0, 0))) {
                this.move(level, this.pos.plus(p))
            }
            // level.fov.compute(this.pos.x, this.pos.y, this.props.sight, (x, y, v) => {
            //     if
            // })
        }
    }
    move(level: Level, pos: Point) {
        let tile = level.tile(pos)
        if (!tile.props.impassable) {
            this.pos = pos
        }
        if (tile.props.open) {
            level.tiles[pos.y][pos.x] = tile.props.open
        }
        if (tile instanceof Monster && this.props.weapons && tile.health) {
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
        if (this.props.player) {
            msgs.push('You ' + RNG.getItem(weapon[1]) + ' the ' + mon.name +
                ' for ' + dam + ' damage')
        } else if (mon.props.player) {
            msgs.push('The ' + this.name + ' ' + RNG.getItem(weapon[1]) +
                ' you for ' + dam + ' damage')
        } else {
            msgs.push('The ' + this.name + ' ' + RNG.getItem(weapon[1]) + ' the ' + mon.name +
                ' for ' + dam + ' damage')
        }
        if (mon.health <= 0) {
            if (weapon[2] in deaths) {
                if (mon.props.player) {
                    msgs.push('You ' + deaths[weapon[2]][0] + '!')
                } else {
                    msgs.push('The ' + mon.name + ' ' + deaths[weapon[2]][1] + '!')
                }
            } else {
                if (mon.props.player) {
                    msgs.push('You die!')
                } else {
                    msgs.push('The ' + mon.name + ' dies!')
                }
            }
        }
        return msgs
    }
}

let mons: [number, [string, string, string, MonsterProps]][] = [
    [.3, ['roach', 'r', 'brown', {
        desc: 'a monstrous roach',
        sight: 5,
        maxhealth: 5,
        weapons: [[die('1d6'), ['disgusts'], Damage.GROSS]],
    }]],
    [.1, ['bee', 'B', 'yellow', {
        desc: 'a friendly bee',
        sight: 5,
        friendly: true,
        maxhealth: 2,
        weapons: [[die('1d6'), ['stings'], Damage.POISON]],
        resistance: {
            [Damage.WEED]: -2
        }
    }]],
    [.1, ['wasp', 'w', 'yellow', {
        desc: 'an angry wasp',
        sight: 5,
        maxhealth: 2,
        weapons: [[die('1d6'), ['stings'], Damage.POISON]],
        resistance: {
            [Damage.WEED]: -2
        }
    }]],
    [.2, ['professor', 'P', 'lightblue', {
        desc: 'a wandering professor',
        sight: 9,
        maxhealth: 10,
        weapons: [[die('1d8'), ['lectures', 'confuses', 'harshly grades', 'curves'], Damage.LECTURE]],
        resistance: {
            [Damage.LECTURE]: 2
        }
    }]],
    [.1, ['math professor', 'P', 'red', {
        desc: 'a math professor',
        sight: 9,
        maxhealth: 10,
        weapons: [[die('1d8'), ['disproves', 'measures', 'calculates', 'integrates', 'divides'], Damage.MATH]],
        resistance: {
            [Damage.LECTURE]: 2
        }
    }]],
    [.2, ['student', '@', 'green', {
        desc: 'a lost student',
        sight: 10,
        maxhealth: 6,
        weapons: [[die('1d6'), ['coughs on', 'sneezes at', 'breathes on'], Damage.COVID]],
        resistance: {
            [Damage.LECTURE]: -2,
            [Damage.WEED]: 2
        }
    }]]
]
let weight = mons.map(m => m[0]).reduce((a, b) => a + b, 0)

export function genMonster() {
    let pct = RNG.getUniform() * weight
    for (let [w, m] of mons) {
        pct -= w
        if (pct < 0) {
            return new Monster(...m)
        }
    }
}


export let player = new Monster(
    "Player",
    '@', 'goldenrod',
    {
        player: true,
        desc: 'yourself',
        sight: 10,
        maxhealth: 20,
        weapons: [
            [die('1d6'), ['hit', 'whack', 'whallop', 'slap', 'punch'], Damage.PHYSICAL],
            [die('1d6'), ['dab on', 'yeet', 'cringe at', 'own', 'post at', 'dunk on'], Damage.CRINGE]
        ]
    }
)