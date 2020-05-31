import { Display } from "./lib/ROT/index.js"
import { MenuScreen, Screen } from "./screen.js"

let o = {
	width: 80,
    height: 25,
    fontSize: 15
}
let display = new Display(o)
document.body.appendChild(display.getContainer())

let screens: Screen[] = [
    new MenuScreen([
        "+-------------------------------+",
        "|Welcome to %c{red}Hell%c{} Simulator 2020!|",
        "+-------------------------------+"
    ], [
        ["Play!", () => {alert("foo")}],
    ])
]
function activeScreen() {
    return screens[screens.length - 1]
}
function render() {
    display.clear()
    activeScreen().render(display)
}

window.addEventListener("keydown", function(e) {
    activeScreen().handle(e.keyCode)
    render()
})
render()