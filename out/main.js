import { Display } from "./lib/ROT/index.js";
import WheatleyGen from "./gen.js";
// Display.Rect.cache = true
let deb = new Display({
    width: 200,
    height: 200,
    fontSize: 4,
    forceSquareRatio: true
});
document.body.appendChild(deb.getContainer());
document.body.appendChild(document.createElement('br'));
let w = new WheatleyGen(200, 200, 7, 6);
let colors = ['white', 'gray', 'red'];
console.log(w);
// w.create(deb.DEBUG)
w.create((x, y, i) => {
    deb.draw(x, y, ' ', '', colors[i]);
});
console.log('done');
let display = new Display({
    width: 100,
    height: 45,
    fontSize: 18,
});
// document.body.appendChild(display.getContainer())
// let game = new Game(display, [
//     new MenuScreen([
//         "+-----------------------------------+",
//         "|Welcome to %c{red}Wheatley%c{} Simulator 2020!|",
//         "+-----------------------------------+"
//     ], [
//         ["Play!", () => {
//             player.health = player.props.maxhealth
//             game.push(new LevelScreen(player, new Level(game, 200, 200, 50,
//                 (w, h) => new Digger(w, h)
//             )))
//         }],
//         ["Help", () => {
//             game.push(new HelpScreen())
//         }]
//     ])
// ])
// game.render()
//# sourceMappingURL=main.js.map