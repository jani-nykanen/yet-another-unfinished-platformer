import { Vector2 } from "./core/vector.js";
class Line {
    constructor(x1, y1, x2, y2) {
        this.A = new Vector2(x1, y1);
        this.B = new Vector2(x2, y2);
    }
}
export class Stage {
    constructor(state, levelIndex) {
        this.hasLoaded = () => this.backgroundLoaded;
        this.slopes = new Array();
        this.backgroundLoaded = false;
        this.scale = 1;
        this.parseJSON(state.getDocument(String(levelIndex)), state);
    }
    parseJSON(source, state) {
        let data = JSON.parse(source);
        state.loadBitmap(data["image"], bmp => {
            this.background = bmp;
            this.backgroundLoaded = true;
        });
        this.scale = Number(data["scale"]);
        for (let s of data["slopes"]) {
            this.slopes.push(new Line(Number(s["x1"]), Number(s["y1"]), Number(s["x2"]), Number(s["y2"])));
        }
    }
    update(state) {
        // ...
    }
    objectCollision(o, state) {
        const LEFT_COLLISION_MARGIN = 1024;
        for (let s of this.slopes) {
            o.slopeCollision(s.A.x, s.A.y, s.B.x, s.B.y, 1, state);
        }
        o.wallCollision(0, -LEFT_COLLISION_MARGIN, 768 + LEFT_COLLISION_MARGIN * 2, -1, state, true);
    }
    draw(canvas) {
        if (!this.backgroundLoaded)
            return;
        canvas.drawBitmap(this.background, 0, 0, canvas.width, canvas.height);
    }
}
