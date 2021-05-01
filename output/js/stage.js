class WallTileData {
    constructor() {
        this.srcx = new Array(4);
        this.srcy = new Array(4);
    }
}
export class Stage {
    constructor(state, levelIndex) {
        this.baseMap = state.getTilemap("map" + String(levelIndex));
        this.layout = this.baseMap.cloneLayer(0);
        this.width = this.baseMap.width;
        this.height = this.baseMap.height;
        this.wallMap = new Array(this.width * this.height);
        this.generateWallData();
    }
    getTile(x, y, defaultValue = 0) {
        if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1)
            return defaultValue;
        return this.layout[y * this.width + x];
    }
    generateWallTileData(dx, dy) {
        let out = new WallTileData();
        let neighbourhood = (new Array(8)).fill(false);
        for (let i = 0; i < 4; ++i) {
            out.srcx[i] = (i % 2) | 0;
            out.srcy[i] = (i / 2) | 0;
        }
        for (let x = 0; x < 3; ++x) {
            for (let y = 0; y < 3; ++y) {
                neighbourhood[y * 3 + x] = this.getTile(dx + x - 1, dy + y - 1, 1) == 1;
            }
        }
        // Bottom
        if (!neighbourhood[7]) {
            if (neighbourhood[3])
                out.srcx[2] = 2;
            if (neighbourhood[5])
                out.srcx[3] = 2;
        }
        // Top
        if (!neighbourhood[1]) {
            if (neighbourhood[3])
                out.srcx[0] = 2;
            if (neighbourhood[5])
                out.srcx[1] = 2;
        }
        // Right
        if (!neighbourhood[5]) {
            out.srcy[1] = 1;
            out.srcy[3] = 1;
            out.srcx[1] = 3;
            out.srcx[3] = 3;
            if (!neighbourhood[1]) {
                out.srcy[1] = 0;
                out.srcx[1] = 1;
            }
            if (!neighbourhood[7]) {
                out.srcy[3] = 1;
                out.srcx[3] = 1;
            }
        }
        // Left
        if (!neighbourhood[3]) {
            out.srcy[0] = 0;
            out.srcy[2] = 0;
            out.srcx[0] = 3;
            out.srcx[2] = 3;
            if (!neighbourhood[1]) {
                out.srcy[0] = 0;
                out.srcx[0] = 0;
            }
            if (!neighbourhood[7]) {
                out.srcy[2] = 1;
                out.srcx[2] = 0;
            }
        }
        // "Empty" corners
        if (neighbourhood[1] && neighbourhood[3]) {
            out.srcx[0] = 4 + 2 * Number(neighbourhood[0]);
        }
        if (neighbourhood[1] && neighbourhood[5]) {
            out.srcx[1] = 5 + 2 * Number(neighbourhood[2]);
        }
        if (neighbourhood[7] && neighbourhood[3]) {
            out.srcx[2] = 4 + 2 * Number(neighbourhood[6]);
        }
        if (neighbourhood[7] && neighbourhood[5]) {
            out.srcx[3] = 5 + 2 * Number(neighbourhood[8]);
        }
        return out;
    }
    generateWallData() {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                if (this.layout[y * this.width + x] != 1) {
                    this.wallMap[y * this.width + x] = null;
                    continue;
                }
                this.wallMap[y * this.width + x] = this.generateWallTileData(x, y);
            }
        }
    }
    drawWallTile(canvas, bmp, tile, dx, dy, dw, dh) {
        let i;
        for (let y = 0; y < 2; ++y) {
            for (let x = 0; x < 2; ++x) {
                i = y * 2 + x;
                canvas.drawBitmapRegion(bmp, tile.srcx[i] * 64, tile.srcy[i] * 64, 64, 64, dx * dw + x * (dw / 2), dy * dh + y * (dh / 2), dw / 2, dh / 2);
            }
        }
    }
    drawWalls(canvas) {
        let bmp = canvas.getBitmap("tileset");
        let tile;
        let scale = Math.max(canvas.width / this.width, canvas.height / this.height);
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                tile = this.wallMap[y * this.width + x];
                if (tile == null)
                    continue;
                this.drawWallTile(canvas, bmp, tile, x, y, scale, scale);
            }
        }
    }
    draw(canvas) {
        this.drawWalls(canvas);
    }
}
