import { Display } from "./lib/ROT/index.js"
import { MenuScreen } from "./screen.js"
import { Game } from "./game.js"

let o = {
	width: 80,
    height: 25,
    fontSize: 15
}
let display = new Display(o)
document.body.appendChild(display.getContainer())

let g = new Game(display, [
    new MenuScreen([
        "+-------------------------------+",
        "|Welcome to %c{red}Hell%c{} Simulator 2020!|",
        "+-------------------------------+"
    ], [
        ["Play!", () => {alert(1)}]
    ])
])
g.render()