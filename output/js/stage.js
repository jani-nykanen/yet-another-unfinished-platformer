import { Rect, Vector2 } from "./core/vector.js";
class Line {
    constructor(x1, y1, x2, y2, dir) {
        this.A = new Vector2(x1, y1);
        this.B = new Vector2(x2, y2);
        this.dir = dir;
    }
}
class Wall {
    constructor(x, y, h, dir) {
        this.pos = new Vector2(x, y);
        this.height = h;
        this.dir = dir;
    }
}
export class Stage {
    constructor(objects, state, levelIndex) {
        this.hasLoaded = () => this.backgroundLoaded;
        this.getStartPosition = () => this.startPos.clone();
        this.slopes = new Array();
        this.ladders = new Array();
        this.walls = new Array();
        this.enemyWalls = new Array();
        this.backgroundLoaded = false;
        this.scale = 1;
        this.parseJSON(state.getDocument(String(levelIndex)), objects, state);
        this.stageIndex = levelIndex;
    }
    parseWalls(data, name, arr) {
        if (data[name] != undefined) {
            for (let s of data[name]) {
                arr.push(new Wall(Number(s["x"]) / this.scale, Number(s["y"]) / this.scale, Number(s["h"]) / this.scale, Number(s["dir"])));
            }
        }
    }
    parseJSON(source, objects, state, destroyOldBackground = false) {
        let data = JSON.parse(source);
        this.slopes = new Array();
        this.ladders = new Array();
        this.walls = new Array();
        this.enemyWalls = new Array();
        state.loadBitmap(data["image"], bmp => {
            this.background = bmp;
            this.backgroundLoaded = true;
            if (destroyOldBackground) {
                this.backgroundBuffer.destroy();
                this.backgroundBuffer = null;
            }
        });
        this.scale = Number(data["scale"]);
        if (data["slopes"] != undefined) {
            for (let s of data["slopes"]) {
                this.slopes.push(new Line(Number(s["x1"]) / this.scale, Number(s["y1"]) / this.scale, Number(s["x2"]) / this.scale, Number(s["y2"]) / this.scale, Number(s["dir"])));
            }
        }
        if (data["ladders"] != undefined) {
            for (let s of data["ladders"]) {
                this.ladders.push(new Rect(Number(s["x"]) / this.scale, Number(s["y"]) / this.scale, Number(s["w"]) / this.scale, Number(s["h"]) / this.scale));
            }
        }
        this.parseWalls(data, "walls", this.walls);
        this.parseWalls(data, "enemyWalls", this.enemyWalls);
        if (data["enemies"] != undefined) {
            for (let e of data["enemies"]) {
                objects.addEnemy(Number(e["x"]) / this.scale, Number(e["y"]) / this.scale, Number(e["id"]));
            }
        }
        this.startPos = new Vector2(Number(data["startPos"]["x"]) / this.scale, Number(data["startPos"]["y"]) / this.scale);
    }
    nextStage(objects, state) {
        this.backgroundBuffer = this.background;
        this.backgroundLoaded = false;
        this.parseJSON(state.getDocument(String(this.stageIndex + 1)), objects, state);
        ++this.stageIndex;
    }
    update(state) {
        // ...
    }
    objectCollision(o, state, isEnemy = false) {
        const SIDE_COLLISION_MARGIN = 1024;
        const LADDER_TOP_MARGIN = 16;
        for (let s of this.slopes) {
            o.slopeCollision(s.A.x, s.A.y, s.B.x, s.B.y, s.dir, state);
        }
        for (let l of this.ladders) {
            o.ladderCollision(l.x, l.y, l.w, l.h, false, state);
            o.ladderCollision(l.x, l.y, l.w, LADDER_TOP_MARGIN, true, state);
        }
        for (let w of this.walls) {
            o.wallCollision(w.pos.x, w.pos.y, w.height, w.dir, state);
        }
        if (isEnemy) {
            for (let w of this.enemyWalls) {
                o.wallCollision(w.pos.x, w.pos.y, w.height, w.dir, state);
            }
            o.constantSlopeCollision(0, 768 / this.scale, 2048, 1, false, false, state);
            o.constantSlopeCollision(0, 0, 2048, -1, false, false, state);
        }
        o.wallCollision(0, -SIDE_COLLISION_MARGIN, 768 + SIDE_COLLISION_MARGIN * 2, -1, state, true);
        if (o.wallCollision(1024 / this.scale, -SIDE_COLLISION_MARGIN, 768 + SIDE_COLLISION_MARGIN * 2, 1, state, true)) {
            return true;
        }
        return false;
    }
    draw(canvas) {
        if (!this.backgroundLoaded)
            return;
        canvas.drawBitmap(this.background, 0, 0, canvas.width, canvas.height);
    }
    applyScale(canvas) {
        canvas.transform.scale(this.scale, this.scale);
        canvas.transform.use();
    }
}
