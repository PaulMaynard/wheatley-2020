import { Display } from "./lib/ROT/index"
import Point from "./point"

export interface TileProps {
    impassable?: boolean
    opaque?: boolean
    open?: Tile
    close?: Tile
    walk?: Tile
}

export default class Tile {
    bg: string
    props: TileProps
    constructor(ch: string, fg: string, bg: string, props?: TileProps);
    constructor(ch: string, fg: string, properties?: TileProps);
    constructor(
        public ch: string,
        public fg: string,
        bg: string | TileProps = {},
        props: TileProps = {}
    ) {
        if (typeof bg != 'string') {
            props = bg
            bg = 'black'
        }
        this.bg = bg
        this.props = props
    }
    draw(display: Display, p: Point, fg = this.fg, bg = this.bg) {
        display.draw(p.x, p.y, this.ch, fg, bg)
    }
}

export namespace tiles {
    export let wall = new Tile('#', 'white', {impassable: true, opaque: true})
    export let floor = new Tile('.', 'white')
    export let opendoor = new Tile(',', 'brown')
    export let door = new Tile('+', 'brown', {
        impassable: true,
        opaque: true,
        open: opendoor
    })
    opendoor.props.close = door
}