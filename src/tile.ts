import { Display } from "./lib/ROT/index"
import Point from "./point"
import Monster from "./monster"

export interface TileProps {
    impassable?: boolean
    opaque?: boolean
    open?: Tile
    close?: Tile
    flip?: Tile
    walk?: Tile
    desc: string
}

class Tile {
    constructor(
        public ch: string,
        public fg: string,
        public bg: string = '',
        public props: TileProps = {desc: ''}
    ) { }
    draw(display: Display, p: Point, fg = this.fg, bg = this.bg) {
        display.draw(p.x, p.y, this.ch, fg, bg)
    }
}

namespace Tile {
    export let wall = new Tile('#', 'white', '', {
        desc: 'a wall',
        impassable: true,
        opaque: true
    })
    export let floor = new Tile('.', 'lightgray', '', {
        desc: 'a floor'
    })
    export let opendoor = new Tile('\'', 'brown', '', {
        desc: 'an opened door'
    })
    export let door = new Tile('+', 'brown', '', {
        desc: 'a door',
        impassable: true,
        opaque: true,
        open: opendoor
    })
    opendoor.props.close = door
    export let vboard = new Tile('|', 'gray', '', {
        desc: 'a blackboard',
        impassable: true,
        opaque: false,
    })
    export let hboard = new Tile('-', 'gray', '', {
        desc: 'a blackboard',
        impassable: true,
        opaque: false,
        flip: vboard
    })
    vboard.props.flip = hboard
    export let desk = new Tile('я', 'brown', '', {
        desc: 'a desk',
        impassable: false,
    })
    export let toilet = new Tile('0', 'white', '', {
        desc: 'a desk',
        impassable: false,
    })
    export let sink = new Tile('%', 'white', '', {
        desc: 'a desk',
        impassable: false,
    })
}

export default Tile