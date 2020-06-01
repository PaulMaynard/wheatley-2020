import { Display } from "./lib/ROT/index.js"
import Screen from "./screen.js"


export class Game {
    constructor(private display: Display, private screens: Screen[]) {
        window.addEventListener("keydown", e => {
            this.activeScreen.handle(e.keyCode)
            this.render()
        })
    }
    get activeScreen() {
        return this.screens[this.screens.length - 1]
    }
    push(screen: Screen) {
        this.screens.push(screen)
        screen.game = this
        screen.enter()
        this.render()
    }
    pop() {
        this.activeScreen.exit()
        this.screens.pop()
        this.render()
    }
    render() {
        this.display.clear()
        this.activeScreen.render(this.display)
    }
}
