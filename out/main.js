import { Display } from "./lib/ROT/index.js";
import WheatleyGen from "./gen.js";
import Point from "./point.js";
// Display.Rect.cache = true
let deb = new Display({
    width: 100,
    height: 45,
    fontSize: 15,
});
let w = new WheatleyGen(100, 45);
w.tiles.forEach((r, y) => {
    r.forEach((t, x) => {
        t.draw(deb, new Point(x, y));
    });
});
document.body.appendChild(deb.getContainer());
document.body.appendChild(document.createElement('br'));
// let display = new Display({
//     width: 100,
//     height: 45,
//     fontSize: 18,
// })
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