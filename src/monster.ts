import Tile from './tile.js'
import Point from './point.js'

interface PlayerProps {
    inactive?: boolean
}

export default class Monster {
    pos: Point
    constructor(
        public name: string,
        public tile: Tile,
        public props: PlayerProps = {}
    ) {}
}

export let player = new Monster("Player", new Tile('@', 'goldenrod'), {inactive: true})