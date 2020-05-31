import Tile from './tile.js'

interface PlayerProps {
    inactive?: boolean
}

export default class Monster {
    x: number
    y: number
    constructor(
        public name: string,
        public tile: Tile,
        public props: PlayerProps = {}
    ) {}
}

export let player = new Monster("Player", new Tile('@', 'goldenrod'), {inactive: true})