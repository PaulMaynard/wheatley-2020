import { Display, KEYS } from "./lib/ROT/index.js";

const _noop = () => {}

export abstract class Screen {
    enter(): void {}
    exit(): void {}
    render(display: Display): void {}
    handle(key: number): void {}
}

export class MenuScreen extends Screen {
    public active: number = 0
    public options: [string, () => void][]
    constructor(
        public title: string[],
        options: (string | [string, () => void])[]
    ) {
        super()
        this.options = options.map(o =>
            (typeof o == 'string') ? [o, _noop] : o
        )
        this.title = title
    }
    render(display: Display) {
        var x = (display.getOptions().width >> 1)
        var y = (display.getOptions().height >> 1)
                - (this.title.length + 1)

        this.title.forEach(line =>
            display.drawText(x - (line.replace(/%c\{.*?\}/g, '').length >> 1), y++, line)
        )
        y++
        this.options.forEach( ([opt, _], i) => {
            if (i == this.active) opt = '%c{gray}[%c{}' + opt + '%c{gray}]%c{}'
            else opt = opt
            display.drawText(x - (opt.replace(/%c\{.*?\}/g, '').length >> 1), y++, opt)
        })
    }
    handle(key: number) {
        switch (key) {
            case KEYS.VK_UP:
                this.active = (this.active - 1 + this.options.length) % this.options.length
            break;
            case KEYS.VK_DOWN:
                this.active = (this.active + 1) % this.options.length
            break;
            case KEYS.VK_RETURN:
                this.options[this.active][1]()
            break;
        }
    }
}