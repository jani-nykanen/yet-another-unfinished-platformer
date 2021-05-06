import { Flip } from "./core/canvas.js";
import { clamp } from "./core/mathext.js";
import { Vector2 } from "./core/vector.js";
import { Enemy } from "./enemy.js";
const ENEMY_TYPES = () => [Snake, Dog, Bird];
export const getEnemyType = (index) => ENEMY_TYPES()[clamp(index, 0, ENEMY_TYPES().length - 1) | 0];
export class Snake extends Enemy {
    constructor(x, y) {
        super(x, y, 0, 0.90);
        this.hitbox = new Vector2(128, 48);
        this.collisionBox = new Vector2(128, 64);
        this.center = new Vector2(0, 32);
        this.friction.x = 1.0;
    }
    animate(state) {
        const BASE_ANIM_SPEED = 6.0;
        const WAIT_SPEED = 30.0;
        this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
        if (this.canJump) {
            this.spr.animate(this.spr.getRow(), 0, 3, this.spr.getColumn() % 2 == 0 ? WAIT_SPEED : BASE_ANIM_SPEED, state.step);
        }
        else {
            this.spr.setFrame(0, this.spr.getRow());
        }
    }
    updateAI(state) {
        const BASE_GRAVITY = 12.0;
        const BASE_SPEED = 8.0;
        this.target.y = BASE_GRAVITY;
        this.target.x = 0.0;
        this.target.y = BASE_GRAVITY;
        if (this.spr.getColumn() % 2 != 0) {
            this.target.x = this.dir * BASE_SPEED;
        }
        this.animate(state);
    }
    wallCollisionEvent(dir, state) {
        this.dir = -dir;
    }
}
export class Dog extends Enemy {
    constructor(x, y) {
        const BASE_GRAVITY = 16.0;
        super(x, y, 1, 0.80);
        this.hitbox = new Vector2(64, 64);
        this.collisionBox = new Vector2(128, 128);
        this.center = new Vector2(0, 0);
        this.target.y = BASE_GRAVITY;
        this.friction.y = 0.35;
        this.jumpTimer = Dog.JUMP_TIME +
            (Math.floor((x | 0) % 2)) * Dog.JUMP_TIME / 2;
    }
    updateAI(state) {
        const JUMP_HEIGHT = -12.0;
        const ANIM_EPS = 1.5;
        if (this.canJump) {
            if ((this.jumpTimer -= state.step) <= 0) {
                this.speed.y = JUMP_HEIGHT;
                this.jumpTimer += Dog.JUMP_TIME;
            }
        }
        let frame = 0;
        if (this.speed.y < -ANIM_EPS)
            frame = 1;
        else if (this.speed.y > ANIM_EPS)
            frame = 2;
        this.spr.setFrame(frame, this.spr.getRow());
    }
    playerEvent(player, state) {
        this.flip = player.getPos().x < this.pos.x ? Flip.None : Flip.Horizontal;
    }
}
Dog.JUMP_TIME = 60;
export class Bird extends Enemy {
    constructor(x, y) {
        super(x, y, 2, 0.90);
        this.hitbox = new Vector2(80, 80);
        this.collisionBox = new Vector2(128, 128);
        this.dir = ((y | 0) % 2) == 0 ? 1 : -1;
    }
    updateAI(state) {
        const FLY_SPEED = 2.0;
        this.spr.animate(this.spr.getRow(), 0, 3, 6, state.step);
        this.speed.y = FLY_SPEED * this.dir;
    }
    slopeCollisionEvent(dir, friction, state) {
        this.dir = -dir;
    }
}
