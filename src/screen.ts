import { Display, KEYS, RNG } from "./lib/ROT/index.js";
import { Game } from "./game.js";

const _noop = () => {}

export default abstract class Screen {
    enter(): void {}
    exit(): void {}
    render(display: Display): void {}
    handle(key: number): void {}
    game?: Game
    animate?: number[]
}

export class MenuScreen extends Screen {
    active: number = 0
    options: [string, () => void][]
    animate = [200, 200, 100]
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

        this.title.forEach(line => {
            let offs = RNG.getPercentage() < 10 ? RNG.getUniformInt(-3, 3) : 0
            display.drawText(x + offs - (line.replace(/%c\{.*?\}/g, '').length >> 1), y++, line)
        })
        y++
        this.options.forEach( ([opt, _], i) => {
            if (i == this.active){
                opt = '%c{gray}[%c{}' + opt + '%c{gray}]%c{}'
            }
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
