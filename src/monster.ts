import Tile, { TileProps } from './tile.js'
import Point from './point.js'
import { RNG } from './lib/ROT/index.js'
import { Level } from './level.js'

interface MonsterProps extends TileProps {
    speed?: number
    inactive?: boolean
    friendly?: boolean
}

export default class Monster extends Tile {
    name: string
    pos: Point
    props: MonsterProps
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
        super(ch, fg, bg, props)
        this.name = name
    }
    getSpeed(): number {
        return this.props.speed || 100
    }
    act(level: Level) {

    }
    move(level: Level, pos: Point) {
        let tile = level.tile(pos)
        if (!tile.props.impassable) {
            this.pos = pos
        }
        if (tile.props.open) {
            level.tiles[pos.y][pos.x] = tile.props.open
        }
    }
}

let mons: [number, [string, string, string, MonsterProps]][] = [
    [.3, ['roach', 'r', 'brown', {desc: 'a massive roach'}]],
    [.1, ['bee', 'B', 'yellow', {desc: 'a friendly bee'}]],
    [.1, ['wasp', 'w', 'yellow', {desc: 'an angry wasp'}]],
    [.2, ['professor', 'P', 'lightblue', {desc: 'a wandering professor'}]],
    [.3, ['student', '@', 'green', {desc: 'a lost student'}]]
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
    {inactive: true, desc: 'you'}
)