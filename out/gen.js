import { RNG } from "./lib/ROT/index.js";
import Tile from "./tile.js";
import Point from "./point.js";
class Gen {
    constructor(width, height, def = Tile.wall) {
        this.width = width;
        this.height = height;
        this.tiles = new Array(height);
        for (let y = 0; y < height; y++) {
            this.tiles[y] = new Array(width);
            for (let x = 0; x < width; x++) {
                this.tiles[y][x] = def;
            }
        }
    }
}
export default class WheatleyGen extends Gen {
    constructor(width, height) {
        super(width, height);
        this.hall(5, [height >> 1, height], new Point(RNG.getUniformInt(10, width - 16), 0), new Point(0, 1));
    }
    hall(width, lens, root, dir) {
        let len = RNG.getUniformInt(...lens);
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < width; j++) {
                let p = root.plus(dir.times(i)).plus(dir.right().times(j));
                this.tiles[p.y][p.x] = Tile.floor;
            }
        }
    }
}
//# sourceMappingURL=gen.js.map