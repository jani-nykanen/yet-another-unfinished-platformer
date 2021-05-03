import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Sprite } from "./core/sprite.js";
import { Rect, Vector2 } from "./core/vector.js";


export const updateSpeedAxis = (speed : number, target : number, step : number) : number => {
		
    if (speed < target) {
        
        return Math.min(target, speed+step);
    }
    return Math.max(target, speed-step);
}


// No better place for these

export const boxOverlay = (pos : Vector2, center : Vector2, hitbox : Vector2, 
    x : number, y : number, w : number, h : number) : boolean => {

    let px = pos.x + center.x - hitbox.x/2;
    let py = pos.y + center.y - hitbox.y/2;

    return px + hitbox.x >= x && px < x+w &&
           py + hitbox.y >= y && py < y+h;
}


export const boxOverlayRect = (rect : Rect, 
    x : number, y : number, w : number, h : number) : boolean => {

    return boxOverlay(
        new Vector2(rect.x, rect.y), 
        new Vector2(), 
        new Vector2(rect.w, rect.h), 
        x, y, w, h);
}


export const computeFriction = (target : number, k : number) : number => {

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
}


export abstract class ExistingObject {


    protected exist : boolean;


    constructor() {

        this.exist = false;
    }
    

    public doesExist = () : boolean => this.exist;
}


export function nextObject<T extends ExistingObject> (arr : Array<T>, type : Function) {

    let o : T;

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


export abstract class WeakGameObject extends ExistingObject {


    protected pos : Vector2;
    protected oldPos : Vector2;
    protected center : Vector2;

    protected hitbox : Vector2;

    protected dying : boolean;

    protected spr : Sprite;


    constructor(x : number, y : number) {

        super();

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.center = new Vector2();

        this.hitbox = new Vector2();

        this.spr = new Sprite(0, 0);

        this.dying = false;

        this.exist = true;
    }


    protected die (state : FrameState) : boolean {

        return true;
    }


    public update(state : FrameState) {

        if (!this.exist) return;

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


    public overlayObject(o : WeakGameObject) : boolean {

        return boxOverlay(this.pos, this.center, this.hitbox,
            o.pos.x + o.center.x - o.hitbox.x/2,
            o.pos.y + o.center.y - o.hitbox.y/2,
            o.hitbox.x, o.hitbox.y);
    }


    public forceKill() {

        this.exist = false;
        this.dying = false;
    }


    protected updateLogic(state : FrameState) {};
    protected outsideCamerastateent() {}
    protected extendedLogic(state : FrameState) {}

    public draw(c : Canvas) {}
    public postDraw(c : Canvas) {}

    public getPos = () => this.pos.clone();
    public getHitbox = () : Vector2 => this.hitbox.clone();

    public isDying = () => this.dying;
    
}


export abstract class GameObject extends WeakGameObject {
    

    protected oldPos : Vector2;
    protected speed : Vector2;
    protected target : Vector2;
    protected friction : Vector2;
    protected facingDir : number;


    constructor(x : number, y : number) {

        super(x, y);

        this.speed = new Vector2();
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);
    }


    protected die (state : FrameState) : boolean {

        return true;
    }


    protected postUpdate(state : FrameState) {}


    protected updateMovement(state : FrameState) {

        this.speed.x = updateSpeedAxis(this.speed.x,
            this.target.x, this.friction.x*state.step);
        this.speed.y = updateSpeedAxis(this.speed.y,
            this.target.y, this.friction.y*state.step);

        this.pos.x += this.speed.x * state.step;
        this.pos.y += this.speed.y * state.step;
    }


    public extendedLogic(state : FrameState) {

        this.updateMovement(state);
        this.postUpdate(state);
    }


    public stopMovement() {

        this.speed.zeros();
        this.target.zeros();
    }


    public getSpeed = () : Vector2 => this.speed.clone();
    public getTarget = () : Vector2 => this.target.clone();
    public getFacingDirection = () : number => this.facingDir;
}


export abstract class CollisionObject extends GameObject {


    protected collisionBox : Vector2;
    protected bounceFactor : number;
    protected disableCollisions : boolean;
    protected collideIfDying : boolean;


    constructor(x : number, y : number) {

        super(x, y);

        this.collisionBox = new Vector2();
        this.bounceFactor = 0;

        this.collideIfDying = false;
        this.disableCollisions = false;
    }


    protected wallCollisionstateent(dir : number, state : FrameState) {}
    protected slopeCollisionEvent(dir : number, friction : number, state : FrameState) {}


    public wallCollision(
        x : number, y : number, h : number, 
        dir : number, state : FrameState, force = false) {

        const EPS = 0.001;
        const V_MARGIN = 1;
        const NEAR_MARGIN = 1;
        const FAR_MARGIN = 4;
        
        if ((!force && this.disableCollisions) ||
            !this.exist || this.dying || 
            this.speed.x * dir < EPS) 
            return false;

        let top = this.pos.y + this.center.y - this.collisionBox.y/2;
        let bottom = top + this.collisionBox.y;

        if (bottom <= y + V_MARGIN || top >= y + h - V_MARGIN)
            return false;

        let xoff = this.center.x + this.collisionBox.x/2 * dir;
        let nearOld = this.oldPos.x + xoff
        let nearNew = this.pos.x + xoff;

        if ((dir > 0 && nearNew >= x - NEAR_MARGIN*state.step &&
             nearOld <= x + (FAR_MARGIN + this.speed.x)*state.step) || 
             (dir < 0 && nearNew <= x + NEAR_MARGIN*state.step &&
             nearOld >= x - (FAR_MARGIN - this.speed.x)*state.step)) {

            this.pos.x = x - xoff;
            this.speed.x *= -this.bounceFactor;

            this.wallCollisionstateent(dir, state);

            return true;
        }

        return false;
    }     


    public slopeCollision(x1 : number, y1: number, x2 : number, y2 : number, 
        dir : number, state : FrameState, force = false) : boolean {

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

        let py = this.pos.y + this.center.y + dir * this.collisionBox.y/2;

        if ((dir > 0 && py > y0 - NEAR_MARGIN * state.step && 
            py <= y0 + (this.speed.y + FAR_MARGIN) * state.step) || 
            (dir < 0 && py < y0 + NEAR_MARGIN * state.step && 
            py >= y0 + (this.speed.y - FAR_MARGIN) * state.step) ) {

            this.pos.y = y0 - this.center.y - dir*this.collisionBox.y/2;
            this.speed.y *= -this.bounceFactor;

            this.slopeCollisionEvent(dir, k, state);

            return true;
        }
    
        return false;
    }


    public constantSlopeCollision(x : number, y : number, w : number, dir : number,
        leftMargin : boolean, rightMargin : boolean, state : FrameState) : boolean {

        if (leftMargin) {
            
            x -= this.collisionBox.x/2;
            w += this.collisionBox.x/2;
        }

        if (rightMargin) {
            
            w += this.collisionBox.x/2;
        }

        return this.slopeCollision(x, y, x+w, y, dir, state);
    }


    public hurtCollision(x : number, y : number, w : number, h : number, 
        dmg : number, knockback : number, state : FrameState) : boolean {

        return false;
    }


    public breakCollision(x : number, y : number, w : number, h : number, 
        strong : boolean, state : FrameState) : boolean {

        return false;
    }


    public ladderCollision(x : number, y : number, w : number, h : number, 
        ladderTop : boolean, state : FrameState) : boolean {

        return false;
    }


    public getCollisionBox = () : Vector2 => this.collisionBox.clone();
    public doesCollideIfDying = () : boolean => this.collideIfDying;
}
