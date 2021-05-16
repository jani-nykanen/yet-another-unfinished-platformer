import { Rect, Vector2 } from "./core/vector.js";
import { nextObject } from "./gameobject.js";
import { Leaf } from "./leaf.js";
const HINTS = [
    "USE LEFT AND RIGHT ARROW KEYS TO MOVE",
    "PRESS LEFT SHIFT TO RUN AND SPACE TO JUMP",
    "USE UP AND DOWN ARROW KEYS TO CLIMB",
    "PRESS THE JUMP BUTTON TWICE TO FLAP ARMS"
];
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
        this.rainPos = (new Array(2)).fill(0);
        this.slopes = new Array();
        this.ladders = new Array();
        this.walls = new Array();
        this.enemyWalls = new Array();
        this.backgroundLoaded = false;
        this.scale = 1;
        this.leaves = new Array();
        this.leafTimer = 0.0;
        this.hasLeaves = false;
        this.isRaining = false;
        this.hintAlphaFactor = 1.0;
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
        this.leaves = new Array();
        this.leafTimer = 0.0;
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
            state.transition.toggleWaiting(false);
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
        this.hasLeaves = data["hasLeaves"] != undefined && Boolean(data["hasLeaves"]);
        this.isRaining = data["rain"] != undefined && Boolean(data["rain"]);
        if (data["hasInitialLeaves"] != undefined && (data["hasInitialLeaves"])) {
            this.generateInitialLeaves();
        }
    }
    nextStage(objects, state) {
        this.backgroundBuffer = this.background;
        this.backgroundLoaded = false;
        this.parseJSON(state.getDocument(String(this.stageIndex + 1)), objects, state);
        ++this.stageIndex;
    }
    generateInitialLeaves() {
        const MIN_COUNT = 4;
        const MAX_COUNT = 8;
        let count = MIN_COUNT + ((Math.random() * (MAX_COUNT - MIN_COUNT)) | 0);
        for (let i = 0; i < count; ++i) {
            this.generateLeaf(Math.random() * 768);
        }
    }
    generateLeaf(dy = -64) {
        const MIN_SPEED_X = 3;
        const MAX_SPEED_X = 6;
        const MIN_SPEED_Y = 3;
        const MAX_SPEED_Y = 8;
        let speedY = MIN_SPEED_Y + Math.random() * (MAX_SPEED_Y - MIN_SPEED_Y);
        let speedX = MIN_SPEED_X + Math.random() * (MAX_SPEED_X - MIN_SPEED_X);
        let x = 64 + Math.random() * (1024 - 128);
        let y = dy;
        nextObject(this.leaves, Leaf)
            .spawn(x, y, (Math.random() * 4) | 0, speedX * this.scale, speedY * this.scale, 768 / this.scale, this.scale / 0.75);
    }
    updateLeaves(state) {
        const LEAF_TIME = 30;
        if ((this.leafTimer -= state.step) <= 0) {
            this.generateLeaf();
            this.leafTimer += LEAF_TIME;
        }
        for (let l of this.leaves) {
            l.update(state);
        }
    }
    update(state) {
        const RAIN_SPEED = [12, 12 * 2.0 / 3.0];
        const MODULO = [256, 512];
        const HINT_FACTOR_SPEED = 0.05;
        if (this.hasLeaves) {
            this.updateLeaves(state);
        }
        if (this.isRaining) {
            for (let i = 0; i < this.rainPos.length; ++i) {
                this.rainPos[i] = (this.rainPos[i] + RAIN_SPEED[i] * state.step) % MODULO[i];
            }
        }
        this.hintAlphaFactor = (this.hintAlphaFactor +
            HINT_FACTOR_SPEED * state.step) % (Math.PI * 2);
    }
    objectCollision(o, state, isEnemy = false) {
        const SIDE_COLLISION_MARGIN = 1024;
        const LADDER_TOP_MARGIN = 16;
        if (o.isDying() || !o.doesExist())
            return;
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
        else {
            if (o.getPos().y - o.getHitbox().y > 768 / this.scale) {
                o.forceKill();
            }
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
    drawRain(canvas) {
        let bmp = canvas.getBitmap("rain");
        canvas.setDrawColor(1, 1, 1, 0.33);
        for (let y = -1; y < Math.floor(canvas.height / 256); ++y) {
            for (let x = 0; x < Math.floor(canvas.width / 256) + 1; ++x) {
                canvas.drawBitmapRegion(bmp, 0, 0, 256, 256, x * 256 - this.rainPos[0], y * 256 + this.rainPos[0]);
            }
        }
        for (let y = -2; y < Math.floor(canvas.height / 256); ++y) {
            for (let x = 0; x < Math.floor(canvas.width / 256) + 1; ++x) {
                canvas.drawBitmapRegion(bmp, 256, 0, 256, 256, x * 256 - this.rainPos[1] / 2, y * 256 + this.rainPos[1]);
            }
        }
        canvas.setDrawColor();
    }
    drawHints(canvas) {
        let bmp = canvas.getBitmap("font");
        let alpha = 0.75 + 0.25 * Math.sin(this.hintAlphaFactor);
        let scale = 0.657 + 0.001 * Math.sin(this.hintAlphaFactor);
        canvas.setDrawColor(1, 1, 1, alpha);
        canvas.drawText(bmp, HINTS[this.stageIndex - 1], canvas.width / 2, canvas.height - 48, -28, 0, true, scale, scale);
        canvas.setDrawColor();
    }
    postDraw(canvas) {
        if (this.hasLeaves) {
            for (let l of this.leaves) {
                l.draw(canvas);
            }
        }
        if (this.isRaining) {
            this.drawRain(canvas);
        }
        if (this.stageIndex <= HINTS.length) {
            this.drawHints(canvas);
        }
    }
    applyScale(canvas) {
        canvas.transform.scale(this.scale, this.scale);
        canvas.transform.use();
    }
}
