import { Display } from "./lib/ROT/index.js";
import { MenuScreen } from "./screen.js";
import HelpScreen from "./help.js";
import { Game } from "./game.js";
import { LevelScreen, Level } from "./level.js";
import WheatleyGen from "./gen.js";
import { player } from "./player.js";
// Display.Rect.cache = true
// let deb = new Display ({
//     width: 200,
//     height: 200,
//     fontSize: 4,
//     forceSquareRatio: true
// })
// document.body.appendChild(deb.getContainer() ?? document.createTextNode("Could not create display"))
// document.body.appendChild(document.createElement('br'))
// let w = new WheatleyGen(200, 200, 7, 6)
// console.log(w)
// // w.create(deb.DEBUG)
// w.create((x, y, t) => {
//     deb.draw(x, y, ' ', '', t == Tile.wall? 'black' : t.fg);
// })
// console.log('done')
let display = new Display({
    width: 100,
    height: 45,
    fontSize: 18,
});
document.body.appendChild(display.getContainer() ?? document.createTextNode("Could not create display"));
let game = new Game(display, [
    new MenuScreen([
        String.raw `+-------------------------------------------------------------------------+`,
        String.raw `|           __          ___                _   _                          |`,
        String.raw `|           \ \        / / |              | | | |                         |`,
        String.raw `|            \ \  /\  / /| |__   ___  __ _| |_| | ___ _   _               |`,
        String.raw `|             \ \/  \/ / | '_ \ / _ \/ _B | __| |/ _ \ | | |              |`.replace(/B/g, '`'),
        String.raw `|              \  /\  /  | | | |  __/ (_| | |_| |  __/ |_| |              |`,
        String.raw `|               \/  \/   |_| |_|\___|\__,_|\__|_|\___|\__, |              |`,
        String.raw `|                                                      __/ |              |`,
        String.raw `|                                                     |___/               |`,
        String.raw `|   _____ _                 _       _               ___   ___ ___   ___   |`,
        String.raw `|  / ____(_)               | |     | |             |__ \ / _ \__ \ / _ \  |`,
        String.raw `| | (___  _ _ __ ___  _   _| | __ _| |_ ___  _ __     ) | | | | ) | | | | |`,
        String.raw `|  \___ \| | '_ B _ \| | | | |/ _B | __/ _ \| '__|   / /| | | |/ /| | | | |`.replace(/B/g, '`'),
        String.raw `|  ____) | | | | | | | |_| | | (_| | || (_) | |     / /_| |_| / /_| |_| | |`,
        String.raw `| |_____/|_|_| |_| |_|\__,_|_|\__,_|\__\___/|_|    |____|\___/____|\___/  |`,
        String.raw `+-------------------------------------------------------------------------+`,
    ], [
        ["Play!", () => {
                player.health = player.props.maxhealth || 1;
                game.push(new LevelScreen(player, new Level(game, 150, 150, 50, (w, h) => new WheatleyGen(w, h, 7, 6))));
            }],
        ["Help", () => {
                game.push(new HelpScreen());
            }]
    ])
]);
game.render();
//# sourceMappingURL=main.js.map