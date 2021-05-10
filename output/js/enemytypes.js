import { Flip } from "./core/canvas.js";
import { clamp } from "./core/mathext.js";
import { Vector2 } from "./core/vector.js";
import { Enemy } from "./enemy.js";
const ENEMY_TYPES = () => [
    Snake, Dog, Bird, Cat, Bear, Apple, BigBird, Rabbit
];
export const getEnemyType = (index) => ENEMY_TYPES()[clamp(index, 0, ENEMY_TYPES().length - 1) | 0];
export class Snake extends Enemy {
    constructor(x, y) {
        super(x, y, 0, 0.90);
        this.hitbox = new Vector2(80, 48);
        this.collisionBox = new Vector2(96, 64);
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
export class Cat extends Enemy {
    constructor(x, y) {
        super(x, y, 3, 0.80);
        this.hitbox = new Vector2(96, 56);
        this.collisionBox = new Vector2(96, 64);
        this.center = new Vector2(0, 48);
        this.friction.x = 0.5;
    }
    updateAI(state) {
        const BASE_GRAVITY = 12.0;
        const BASE_SPEED = 2.5;
        this.target.y = BASE_GRAVITY;
        this.target.x = this.dir * BASE_SPEED;
        this.target.y = BASE_GRAVITY;
        this.spr.animate(this.spr.getRow(), 0, 3, 6, state.step);
        this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
    }
    wallCollisionEvent(dir, state) {
        this.dir = -dir;
    }
}
export class Bear extends Enemy {
    constructor(x, y) {
        super(x, y, 4, 0.80);
        this.hitbox = new Vector2(72, 56);
        this.collisionBox = new Vector2(80, 64);
        this.center = new Vector2(0, 32);
        this.target.y = 8.0;
    }
    updateAI(state) {
        const SPEED = [6, 30];
        this.spr.animate(this.spr.getRow(), 0, 3, SPEED[this.spr.getColumn() % 2], state.step);
    }
}
export class Apple extends Enemy {
    constructor(x, y) {
        super(x, y, 5, 0.90);
        this.hitbox = new Vector2(56, 48);
        this.collisionBox = new Vector2(64, 72);
        this.center = new Vector2(0, 40);
        this.stompPhase = 0;
        this.friction.y = 0.5;
        this.waitTimer = 0;
        this.startPos = y;
        this.waveTimer = 0;
    }
    updateAI(state) {
        const GRAVITY = [16.0, -3.0];
        const FRICTION = [1.0, 0.5];
        const WAVE_SPEED = 0.05;
        const AMPLITUDE = 16.0;
        this.target.y = 0;
        if (this.stompPhase != 0) {
            this.friction.y = FRICTION[this.stompPhase - 1];
            if (this.waitTimer <= 0)
                this.target.y = GRAVITY[this.stompPhase - 1];
            else
                this.waitTimer -= state.step;
            if (this.stompPhase == 2 && this.pos.y < this.startPos) {
                this.stompPhase = 0;
                this.pos.y = this.startPos;
            }
        }
        else {
            this.waveTimer = (this.waveTimer + WAVE_SPEED * state.step) % (Math.PI * 2);
            this.pos.y = this.startPos + Math.sin(this.waveTimer) * AMPLITUDE;
        }
        if (this.stompPhase != 1 && this.waitTimer <= 0) {
            this.spr.animate(5, 0, 3, 6, state.step);
        }
        else {
            this.spr.setFrame(3, 1);
        }
    }
    playerEvent(player, state) {
        const EPS = 256;
        if (player.isDying() || !player.doesExist())
            return;
        if (this.stompPhase == 0 &&
            Math.abs(player.getPos().x - this.pos.x) < EPS) {
            this.stompPhase = 1;
        }
    }
    slopeCollisionEvent(dir, k, state) {
        const WAIT_TIME = 60;
        if (this.stompPhase == 1) {
            this.stompPhase = 2;
            this.waitTimer = WAIT_TIME;
            state.shake(16.0, WAIT_TIME);
        }
    }
}
export class BigBird extends Enemy {
    constructor(x, y) {
        super(x, y, 6, 0.80);
        this.hitbox = new Vector2(96, 48);
        this.collisionBox = new Vector2(128, 72);
        this.dir = ((x | 0) % 2) == 0 ? 1 : -1;
    }
    updateAI(state) {
        const FLY_SPEED = 3.0;
        this.spr.animate(this.spr.getRow(), 0, 3, 6, state.step);
        this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
        this.speed.x = FLY_SPEED * this.dir;
    }
    wallCollisionEvent(dir, state) {
        this.dir = -dir;
    }
}
export class Rabbit extends Enemy {
    constructor(x, y) {
        const BASE_GRAVITY = 16.0;
        super(x, y, 7, 0.80);
        this.hitbox = new Vector2(64, 64);
        this.collisionBox = new Vector2(128, 96);
        this.center = new Vector2(0, 30);
        this.target.y = BASE_GRAVITY;
        this.friction.y = 0.35;
        this.jumpTimer = Rabbit.JUMP_TIME +
            (Math.floor((x | 0) % 2)) * Rabbit.JUMP_TIME / 2;
        this.bounceFactor.x = 1;
    }
    updateAI(state) {
        const JUMP_HEIGHT = -10.0;
        const ANIM_EPS = 1.0;
        const BASE_SPEED = 3.0;
        this.target.x = 0.0;
        if (this.canJump) {
            if ((this.jumpTimer -= state.step) <= 0) {
                this.speed.y = JUMP_HEIGHT;
                this.jumpTimer += Rabbit.JUMP_TIME;
            }
        }
        else {
            this.target.x = this.dir * BASE_SPEED;
        }
        let frame = 0;
        if (this.speed.y < -ANIM_EPS)
            frame = 1;
        else if (this.speed.y > ANIM_EPS)
            frame = 2;
        this.spr.setFrame(frame, this.spr.getRow());
        this.flip = this.dir < 0 ? Flip.None : Flip.Horizontal;
    }
    wallCollisionEvent(dir, state) {
        this.dir = -dir;
    }
}
Rabbit.JUMP_TIME = 30;
