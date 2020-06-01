import { Display } from "./lib/ROT/index.js"
import { MenuScreen } from "./screen.js"
import { Game } from "./game.js"
import { LevelScreen, Level } from "./level.js"
import Digger from "./lib/ROT/map/digger.js"
import { player } from "./monster.js"

let o = {
	width: 80,
    height: 45,
    fontSize: 18
}
let display = new Display(o)
document.body.appendChild(display.getContainer())

let game = new Game(display, [
    new MenuScreen([
        "+-------------------------------+",
        "|Welcome to %c{red}Hell%c{} Simulator 2020!|",
        "+-------------------------------+"
    ], [
        ["Play!", () => {
            game.push(new LevelScreen(player, new Level(100, 100, Digger)))
        }]
    ])
])
game.render()