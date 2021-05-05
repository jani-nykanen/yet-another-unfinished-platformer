import { Flip } from "./core/canvas.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { CollisionObject } from "./gameobject.js";
export class Enemy extends CollisionObject {
    constructor(x, y, id, scale = 1.0) {
        super(x, y);
        this.id = id;
        this.spr = new Sprite(256, 256);
        this.spr.setFrame(0, this.id);
        this.scale = scale;
        this.hitbox = new Vector2(128 * scale, 128 * scale);
        this.collisionBox = this.hitbox.clone();
        this.flip = Flip.None;
        this.friction = new Vector2(0.5, 0.5);
        this.dir = ((this.pos.x | 0) % 2) == 0 ? -1 : 1;
        this.canJump = false;
    }
    updateAI(state) { }
    updateLogic(state) {
        this.updateAI(state);
        this.canJump = false;
    }
    draw(canvas) {
        let bmp = canvas.getBitmap("enemies");
        canvas.drawSprite(this.spr, bmp, this.pos.x - this.spr.width / 2 * this.scale, this.pos.y - this.spr.height / 2 * this.scale, this.spr.width * this.scale, this.spr.height * this.scale, this.flip);
    }
    slopeCollisionEvent(dir, friction, state) {
        this.canJump = true;
    }
    playerEvent(player, state) { }
    playerCollision(player, state) {
        if (player.isDying() || !player.doesExist())
            return false;
        this.playerEvent(player, state);
        if (this.overlayObject(player)) {
            player.kill(state);
            return true;
        }
        return false;
    }
}
