import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
export const updateSpeedAxis = (speed, target, step) => {
    if (speed < target) {
        return Math.min(target, speed + step);
    }
    return Math.max(target, speed - step);
};
// No better place for these
export const boxOverlay = (pos, center, hitbox, x, y, w, h) => {
    let px = pos.x + center.x - hitbox.x / 2;
    let py = pos.y + center.y - hitbox.y / 2;
    return px + hitbox.x >= x && px < x + w &&
        py + hitbox.y >= y && py < y + h;
};
export const boxOverlayRect = (rect, x, y, w, h) => {
    return boxOverlay(new Vector2(rect.x, rect.y), new Vector2(), new Vector2(rect.w, rect.h), x, y, w, h);
};
export const computeFriction = (target, k) => {
    const EPS = 0.01;
    if (Math.abs(k) > EPS) {
        if (k > 0) {
            if (target > 0)
                k *= -0.5;
            target *= 1.0 - 0.5 * k;
        }
        else {
            if (target < 0)
                k *= -0.5;
            target *= 1.0 + 0.5 * k;
        }
    }
    return target;
};
export class ExistingObject {
    constructor() {
        this.doesExist = () => this.exist;
        this.exist = false;
    }
}
export function nextObject(arr, type) {
    let o;
    o = null;
    for (let a of arr) {
        if (!a.doesExist()) {
            o = a;
            break;
        }
    }
    if (o == null) {
        o = new type.prototype.constructor();
        arr.push(o);
    }
    return o;
}
export class WeakGameObject extends ExistingObject {
    constructor(x, y) {
        super();
        this.getPos = () => this.pos.clone();
        this.getHitbox = () => this.hitbox.clone();
        this.isDying = () => this.dying;
        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.center = new Vector2();
        this.hitbox = new Vector2();
        this.spr = new Sprite(0, 0);
        this.dying = false;
        this.exist = true;
    }
    die(state) {
        return true;
    }
    update(state) {
        if (!this.exist)
            return;
        if (this.dying) {
            if (this.die(state)) {
                this.exist = false;
                this.dying = false;
            }
            return;
        }
        this.oldPos = this.pos.clone();
        this.updateLogic(state);
        this.extendedLogic(state);
    }
    overlayObject(o) {
        return boxOverlay(this.pos, this.center, this.hitbox, o.pos.x + o.center.x - o.hitbox.x / 2, o.pos.y + o.center.y - o.hitbox.y / 2, o.hitbox.x, o.hitbox.y);
    }
    forceKill() {
        this.exist = false;
        this.dying = false;
    }
    updateLogic(state) { }
    ;
    outsideCamerastateent() { }
    extendedLogic(state) { }
    draw(c) { }
    postDraw(c) { }
}
export class GameObject extends WeakGameObject {
    constructor(x, y) {
        super(x, y);
        this.getSpeed = () => this.speed.clone();
        this.getTarget = () => this.target.clone();
        this.getFacingDirection = () => this.facingDir;
        this.speed = new Vector2();
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);
    }
    die(state) {
        return true;
    }
    postUpdate(state) { }
    updateMovement(state) {
        this.speed.x = updateSpeedAxis(this.speed.x, this.target.x, this.friction.x * state.step);
        this.speed.y = updateSpeedAxis(this.speed.y, this.target.y, this.friction.y * state.step);
        this.pos.x += this.speed.x * state.step;
        this.pos.y += this.speed.y * state.step;
    }
    extendedLogic(state) {
        this.updateMovement(state);
        this.postUpdate(state);
    }
    stopMovement() {
        this.speed.zeros();
        this.target.zeros();
    }
}
export class CollisionObject extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.getCollisionBox = () => this.collisionBox.clone();
        this.doesCollideIfDying = () => this.collideIfDying;
        this.collisionBox = new Vector2();
        this.bounceFactor = 0;
        this.collideIfDying = false;
        this.disableCollisions = false;
    }
    wallCollisionstateent(dir, state) { }
    slopeCollisionEvent(dir, friction, state) { }
    wallCollision(x, y, h, dir, state, force = false) {
        const EPS = 0.001;
        const V_MARGIN = 1;
        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 4;
        if ((!force && this.disableCollisions) ||
            !this.exist || this.dying ||
            this.speed.x * dir < EPS)
            return false;
        let top = this.pos.y + this.center.y - this.collisionBox.y / 2;
        let bottom = top + this.collisionBox.y;
        if (bottom <= y + V_MARGIN || top >= y + h - V_MARGIN)
            return false;
        let xoff = this.center.x + this.collisionBox.x / 2 * dir;
        let nearOld = this.oldPos.x + xoff;
        let nearNew = this.pos.x + xoff;
        if ((dir > 0 && nearNew >= x - NEAR_MARGIN * state.step &&
            nearOld <= x + (FAR_MARGIN + this.speed.x) * state.step) ||
            (dir < 0 && nearNew <= x + NEAR_MARGIN * state.step &&
                nearOld >= x - (FAR_MARGIN - this.speed.x) * state.step)) {
            this.pos.x = x - xoff;
            this.speed.x *= -this.bounceFactor;
            this.wallCollisionstateent(dir, state);
            return true;
        }
        return false;
    }
    slopeCollision(x1, y1, x2, y2, dir, state, force = false) {
        const EPS = 0.001;
        const NEAR_MARGIN = 8;
        const FAR_MARGIN = 32;
        if ((!force && this.disableCollisions) ||
            !this.exist || this.dying ||
            this.speed.y * dir < EPS ||
            Math.abs(x1 - x2) < EPS)
            return false;
        if (this.pos.x < x1 || this.pos.x >= x2)
            return false;
        let k = (y2 - y1) / (x2 - x1);
        let y0 = y1 + k * (this.pos.x - x1);
        let py = this.pos.y + this.center.y + dir * this.collisionBox.y / 2;
        if ((dir > 0 && py > y0 - NEAR_MARGIN * state.step &&
            py <= y0 + (this.speed.y + FAR_MARGIN) * state.step) ||
            (dir < 0 && py < y0 + NEAR_MARGIN * state.step &&
                py >= y0 + (this.speed.y - FAR_MARGIN) * state.step)) {
            this.pos.y = y0 - this.center.y - dir * this.collisionBox.y / 2;
            this.speed.y *= -this.bounceFactor;
            this.slopeCollisionEvent(dir, k, state);
            return true;
        }
        return false;
    }
    constantSlopeCollision(x, y, w, dir, leftMargin, rightMargin, state) {
        if (leftMargin) {
            x -= this.collisionBox.x / 2;
            w += this.collisionBox.x / 2;
        }
        if (rightMargin) {
            w += this.collisionBox.x / 2;
        }
        return this.slopeCollision(x, y, x + w, y, dir, state);
    }
    hurtCollision(x, y, w, h, dmg, knockback, state) {
        return false;
    }
    breakCollision(x, y, w, h, strong, state) {
        return false;
    }
    ladderCollision(x, y, w, h, ladderTop, state) {
        return false;
    }
}
