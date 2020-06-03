import Screen from "./screen.js";
import { KEYS } from "./lib/ROT/index.js";
export default class HelpScreen extends Screen {
    render(display) {
        display.drawText(1, 1, [
            '? - show this help screen',
            '',
            'arrow keys - move',
            '|   or use vi keys:',
            '|   y k u',
            '|    \\|/',
            '|   h-@-l',
            '|    /|\\',
            '|   b j n',
            '',
            'x - look around',
            'esc - go back'
        ].join('\n'));
    }
    handle(key) {
        if (key == KEYS.VK_ESCAPE) {
            this.game?.pop();
        }
    }
}
//# sourceMappingURL=help.js.map