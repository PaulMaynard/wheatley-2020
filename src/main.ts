import { Display } from "./lib/ROT/index.js"
import Digger from "./lib/ROT/map/digger.js"
import { MenuScreen } from "./screen.js"
import HelpScreen from "./help.js"
import { Game } from "./game.js"
import { LevelScreen, Level } from "./level.js"
import { player } from "./monster.js"

// Display.Rect.cache = true

let o = {
	width: 100,
    height: 45,
    fontSize: 18
}
let display = new Display(o)
document.body.appendChild(display.getContainer())

let game = new Game(display, [
    new MenuScreen([
        "+-----------------------------------+",
        "|Welcome to %c{red}Wheatley%c{} Simulator 2020!|",
        "+-----------------------------------+"
    ], [
        ["Play!", () => {
            game.push(new LevelScreen(player, new Level(game, 200, 200, 40, Digger)))
        }],
        ["Help", () => {
            game.push(new HelpScreen())
        }]
    ])
])
game.render()
