export class Game {
    constructor(display, screens) {
        this.display = display;
        this.screens = screens;
        window.addEventListener("keydown", e => {
            this.activeScreen.handle(e.keyCode);
            this.render();
        });
    }
    get activeScreen() {
        return this.screens[this.screens.length - 1];
    }
    push(screen) {
        this.screens.push(screen);
        screen.game = this;
        screen.enter();
        this.render();
    }
    pop() {
        this.activeScreen.exit();
        this.screens.pop();
        this.render();
    }
    render() {
        this.display.clear();
        this.activeScreen.render(this.display);
    }
}
//# sourceMappingURL=game.js.map