import Tile, { TileProps } from './tile.js'
import Point from './point.js'
import { RNG, Util } from './lib/ROT/index.js'
import { Level } from './level.js'
import { Die, die } from './dice.js'

export enum Damage {
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
let deaths: {[d in Damage]?: [string, string][]} = {
    [Damage.LECTURE]: [[' have failed', ' has failed']],
    [Damage.MATH]: [[' are left as an exercise for the reader', ' is left as an exercise for the reader']],
    [Damage.RECURSION]: [['r stack has overflowed', "'s stack has overflowed"]],
    [Damage.CS]: [[' have been garbage collected', ' has been garbage collected'],
                  [' have been prematurely optimized', ' has been prematurely optimized'],
                  ['r runtime has been decreased to O(1)!', '\'s runtime has been decreased to O(1)!'],
                  [' encountered a sanity check error.', ' encountered a sanity check error.']],
    [Damage.RELIGION]: [[' are condemned to hell', ' is condemned to hell']],
    [Damage.ANIME]: [[' are sent to the shadow realm!!', ' is sent to the shadow realm!!']],
    [Damage.CRINGE]: [[' loose subscriber', ' looses subscriber']],
    [Damage.COVID]: [[' die of Coronavirus', ' dies of Coronavirus']],
    [Damage.LOGIC]: [[' are destroyed by facts and logic', ' is destroyed by facts and logic']],
}

export type Attack = [Die, (string | [string, string])[], Damage]

export interface MonsterProps extends TileProps {
    speed?: number
    inactive?: boolean
    friendly?: boolean
    maxhealth?: number
    maxmana?: number
    defsight?: number
    attacks?: Attack[]
    resistance?: {[d in Damage]?: number}
    lines?: string[]
}

class Monster extends Tile {
    name: string
    pos: Point
    props: MonsterProps
    health: number
    sight: number
    active: boolean
    effects: [((m: Monster, l: Level) => void), string][]
    constructor(name: string, ch: string, fg: string, bg: string, props: MonsterProps) {
        super(ch, fg, bg, props)
        this.props = props
        this.name = name
        this.active = false
        this.effects = []
        this.health = props.maxhealth ?? 1

        props.impassable = props.impassable ?? true
        this.sight = props.defsight || 1
        this.pos = Point.origin
    }
    getSpeed(): number {
        return this.props.speed || 100
    }
    act(level: Level) {
        for (let [eff, _] of this.effects) {
            eff(this, level)
        }
        if (level.seen[this.pos.y][this.pos.x] > 0 && this.props.lines && RNG.getUniformInt(0, 1)) {
            level.game.log('The ' + this.name + ' says "' +
                RNG.getItem(this.props.lines) + '"')
        }
        if (!this.props.inactive && !this.isPlayer) {
            let mv: Point | undefined = undefined
            if (!this.props.friendly) {
                let ppos: Point | null = null
                if (1 < 0) ppos = Point.origin // type hackery because TS cant see inside the callback
                level.fov.compute(this.pos.x, this.pos.y, this.sight, (x, y, v) => {
                    let p = new Point(x, y)
                    if (level.in(p) && level.tile(p).isPlayer) {
                        ppos = p
                    }
                })
                mv = ppos?.minus(this.pos)
                if (mv) {
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
                mv = new Point(RNG.getUniformInt(-1, 1), RNG.getUniformInt(-1, 1))
            }
            if (!mv.equals(Point.origin)) {
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
        } else if (tile instanceof Monster && this.props.attacks && tile.health) {
            let log = this.hit(tile)
            level.seen[pos.y][pos.x]
            if (level.seen[pos.y][pos.x] > 0) {
                log.forEach(m => level.game.log(m))
            }
        }
    }
    getAttack(): Attack {
        if (this.props.attacks && this.props.attacks.length > 0) {
            return RNG.getItem(this.props.attacks)
        }
        throw new Error('no attacks!')
    }
    hit(mon: Monster): string[] {
        let weapon = this.getAttack()
        let dam = weapon[0].roll()
        let res = 0
        if (mon.props.resistance && mon.props.resistance[weapon[2]]) {
            res = mon.props.resistance[weapon[2]] as number // goddamn TS cant see the assertion....
        }
        let adj = dam - res
        if ((dam > 0 && adj > 0) || dam < 0 && adj < 0) {
            mon.health -= dam
        }
        let msgs: string[] = []
        let weap = RNG.getItem(weapon[1])
        if (typeof weap == 'string') {
            weap = [weap, '']
        }
        if (this.isPlayer) {
            msgs.push('You ' + weap[0] + ' the ' + mon.name + weap[1])
        } else if (mon.isPlayer) {
            msgs.push('The ' + this.name + ' ' + weap[0] + ' you' + weap[1])
        } else {
            msgs.push('The ' + this.name + ' ' + weap[0] + ' the ' + mon.name + weap[1])
        }
        if (mon.health <= 0) {
            let death = RNG.getItem(deaths[weapon[2]] ?? [[' die', ' dies']])
            if (mon.isPlayer) {
                msgs.push('You' + death[0] + '!')
            } else {
                msgs.push('The ' + mon.name + death[1] + '!')
            }
        }

        return msgs
    }
}
export default Monster
export type MonSpec = [number, string, string, string, string, MonsterProps]

export function mkMonster(m: MonSpec): Monster {
    let [w, ...as] = m
    return new Monster(...as)
}

export var monsters: MonSpec[] = []
namespace Monster {
    /* Monster format: [weight, name, tile, color, background, options] */
    /* Weapon format: [damage, verbs (pre target or pre and post), type] */
    export let roach: MonSpec = [.1, 'roach', 'r', 'brown', '', {
        desc: 'a monstrous roach',
        defsight: 5,
        maxhealth: 5,
        attacks: [[die('1d6'), [
            'disgusts',
            ['grosses', ' out']
        ], Damage.GROSS]],
    }]
    monsters.push(roach)
    export let python: MonSpec = [.1, 'python', 'S', 'green', '', {
        desc: 'a python (the language)',
        defsight: 5,
        maxhealth: 8,
        attacks: [[die('1d8'), [
            ['mismatches', 'r version'],
            ['invades', 'r personal space'],
            ['rejects', 'r PEP'],
            ['inserts a tab in', 'r code'],
            ['inserts a space in', 'r code'],
            ['unindents', 'r function'],
            ['deletes', 'r colon'],
            'indents',
            'hashes'
        ], Damage.CS]],
        resistance: {
            [Damage.RECURSION]: -1,
            [Damage.MATH]: 2
        }
    }]
    monsters.push(python)
    export let bee: MonSpec = [.1, 'bee', 'B', 'yellow', '', {
        desc: 'a friendly bee',
        defsight: 5,
        friendly: true,
        maxhealth: 2,
        attacks: [[die('1d4'), [
            'stings',
        ], Damage.POISON]],
        resistance: {
            [Damage.WEED]: -2
        },
        lines: ['BZZZZZZZ']
    }]
    monsters.push(bee)
    export let wasp: MonSpec = [.1, 'wasp', 'w', 'yellow', '',{
        desc: 'an angry wasp',
        defsight: 5,
        speed: 200,
        maxhealth: 2,
        attacks: [[die('1d4'), ['stings'], Damage.POISON]],
        resistance: {
            [Damage.WEED]: -2
        }
    }]
    monsters.push(wasp)
    export let prof: MonSpec = [.2, 'professor', 'P', 'lightblue', '',{
        desc: 'a wandering professor',
        defsight: 9,
        maxhealth: 10,
        attacks: [[die('1d8'), [
            'lectures', 'confuses', 'harshly grades',
            ['refuses to give', ' an extension']
        ], Damage.LECTURE]],
        resistance: {
            [Damage.LECTURE]: 2
        }
    }]
    monsters.push(prof)
    export let mprof: MonSpec = [.1, 'math professor', 'P', 'red', '',{
        desc: 'a math professor',
        defsight: 9,
        maxhealth: 10,
        attacks: [
            [die('1d8'), [
                'disproves', 'measures', 'calculates', 'integrates',
                ['divides', ' by zero']
            ], Damage.MATH],
            [die('1d8'), [
                'performs induction on',
                ['reduces', ' to a base case']
            ], Damage.RECURSION]
        ],
        resistance: {
            [Damage.LECTURE]: 2,
            [Damage.RECURSION]: 3
        },
        lines: [
            'The proof is trivial!',
            'Let ε > 0, then...'
        ]
    }]
    monsters.push(mprof)
    export let preacher: MonSpec = [.1, 'preacher', 'P', 'yellow', '',{
        desc: 'a street preacher',
        defsight: 12,
        maxhealth: 10,
        attacks: [[die('1d6'), [
            'hurls brimstone at', 'devolves', 'berates', 'damns', 'debates',
        ], Damage.RELIGION]],
        resistance: {
            [Damage.LOGIC]: 4
        },
        lines: [
            "Do you belive?",
            "Evolution is a lie!",
            "Your 'science' can't explain clouds!",
            "God hates you!",
            "God loves you!",
        ]
    }]
    monsters.push(preacher)
    export let student: MonSpec = [.2, 'student', '@', 'green', '',{
        desc: 'a lost student',
        friendly: true,
        defsight: 10,
        maxhealth: 6,
        attacks: [[die('1d12'), ['coughs on', 'sneezes at', 'breathes on'], Damage.COVID]],
        resistance: {
            [Damage.LECTURE]: -2,
            [Damage.WEED]: 2
        }
    }]
    monsters.push(student)
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
    throw Error('impossible')
}
