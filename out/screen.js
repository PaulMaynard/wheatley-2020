import { KEYS } from "./lib/ROT/index.js";
const _noop = () => { };
export default class Screen {
    enter() { }
    exit() { }
    render(display) { }
    handle(key) { }
}
export class MenuScreen extends Screen {
    constructor(title, options) {
        super();
        this.title = title;
        this.active = 0;
        this.options = options.map(o => (typeof o == 'string') ? [o, _noop] : o);
        this.title = title;
    }
    render(display) {
        var x = (display.getOptions().width >> 1);
        var y = (display.getOptions().height >> 1)
            - (this.title.length + 1);
        this.title.forEach(line => display.drawText(x - (line.replace(/%c\{.*?\}/g, '').length >> 1), y++, line));
        y++;
        this.options.forEach(([opt, _], i) => {
            if (i == this.active) {
                opt = '%c{gray}[%c{}' + opt + '%c{gray}]%c{}';
            }
            display.drawText(x - (opt.replace(/%c\{.*?\}/g, '').length >> 1), y++, opt);
        });
    }
    handle(key) {
        switch (key) {
            case KEYS.VK_UP:
                this.active = (this.active - 1 + this.options.length) % this.options.length;
                break;
            case KEYS.VK_DOWN:
                this.active = (this.active + 1) % this.options.length;
                break;
            case KEYS.VK_RETURN:
                this.options[this.active][1]();
                break;
        }
    }
}
//# sourceMappingURL=screen.js.map