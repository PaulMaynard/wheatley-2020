import Tile from './tile.js';
export default class Monster {
    constructor(name, tile, props = {}) {
        this.name = name;
        this.tile = tile;
        this.props = props;
    }
}
export let player = new Monster("Player", new Tile('@', 'goldenrod'), { inactive: true });
//# sourceMappingURL=monster.js.map