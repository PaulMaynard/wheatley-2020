import { Display } from "./lib/ROT/index"
import Point from "./point"
import Monster from "./monster"

export interface TileProps {
    impassable?: boolean
    opaque?: boolean
    open?: Tile
    close?: Tile
    walk?: Tile
    desc: string
}

export class Tile {
    bg: string
    props: TileProps
    constructor(ch: string, fg: string, bg: string, props?: TileProps)
    constructor(ch: string, fg: string, properties?: TileProps)
    constructor(
        public ch: string,
        public fg: string,
        bg: string | TileProps = {desc: ''},
        props: TileProps = {desc: ''}
    ) {
        if (typeof bg != 'string') {
            props = bg
            bg = ''
        }
        this.bg = bg
        this.props = props
    }
    draw(display: Display, p: Point, fg = this.fg, bg = this.bg) {
        display.draw(p.x, p.y, this.ch, fg, bg)
    }
}

export namespace Tile {
    export let wall = new Tile('#', 'white', {
        desc: 'a wall',
        impassable: true,
        opaque: true
    })
    export let floor = new Tile('.', 'white', {
        desc: 'a floor'
    })
    export let opendoor = new Tile('\'', 'brown', {
        desc: 'an opened door'
    })
    export let door = new Tile('+', 'brown', {
        desc: 'a door',
        impassable: true,
        opaque: true,
        open: opendoor
    })
    opendoor.props.close = door
}

export default Tile