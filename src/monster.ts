import Tile from './tile.js'
import Point from './point.js'
import { RNG } from './lib/ROT/index.js'

interface MonsterProps {
    speed?: number
    inactive?: boolean
    friendly?: boolean
}

export default class Monster {
    pos: Point
    constructor(
        public name: string,
        public tile: Tile,
        public props: MonsterProps = {}
    ) {}
    getSpeed(): number {
        return this.props.speed || 100
    }
}

let roachTile = new Tile('r', 'brown', {desc: "a massive roach"})
let beeTile = new Tile('B', 'yellow', {desc: "a friendly bee"})
let waspTile = new Tile('w', 'yellow', {desc: "an angry wasp"})
let profTile = new Tile('P', 'blue', {desc: "a wandering professor"})
let studTile = new Tile('@', 'green', {desc: "a lost student"})

export function genMonster() {
    let pct = RNG.getUniform()
    if (pct < .3) {
        return new Monster("roach", roachTile)
    } else if (pct < .4) {
        return new Monster("bee", beeTile, {friendly: true})
    } else if (pct < .5) {
        return new Monster("wasp", waspTile)
    } else if (pct < .7) {
        return new Monster("professor", profTile)
    } else {
        return new Monster("student", studTile, {friendly: true})
    }
}


export let player = new Monster(
    "Player",
    new Tile('@', 'goldenrod', {desc: 'yourself'}),
    {inactive: true}
)