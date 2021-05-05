import { ExistingObject } from "./gameobject.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
export class Dust extends ExistingObject {
    constructor() {
        super();
        this.exist = false;
    }
    spawn(x, y, speed, id = 0) {
        this.pos = new Vector2(x, y);
        this.spr = new Sprite(64, 64);
        this.speed = speed;
        this.id = id;
        this.exist = true;
    }
    update(state) {
        if (!this.exist)
            return;
        this.spr.animate(this.id, 0, 4, this.speed, state.step);
        if (this.spr.getColumn() == 4) {
            this.exist = false;
        }
    }
    draw(canvas) {
        if (!this.exist)
            return;
        let bmp = canvas.getBitmap("dust");
        let px = Math.round(this.pos.x) - this.spr.width / 2;
        let py = Math.round(this.pos.y) - this.spr.height / 2;
        canvas.drawSprite(this.spr, bmp, px, py);
    }
}
