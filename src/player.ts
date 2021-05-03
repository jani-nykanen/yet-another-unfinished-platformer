import { Canvas, Flip } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { CollisionObject, computeFriction } from "./gameobject.js";
import { Sprite } from "./core/sprite.js";
import { Stage } from "./stage.js";
import { Vector2 } from "./core/vector.js";
import { State } from "./core/types.js";

const FLY_MIN_DIST = 24;


export class Player extends CollisionObject {


    private canJump : boolean;
    private jumpTimer : number;
    private jumpMargin : number;

    private slopeFriction : number;

    private flip : Flip;


    constructor(x : number, y : number) {

        super(x, y);

        this.friction = new Vector2(0.5, 0.5);
        this.hitbox = new Vector2(80, 160);
        this.collisionBox = new Vector2(80, 160);
        this.center = new Vector2(0, 32);

        this.canJump = false;
        this.jumpTimer = 0;
        this.jumpMargin = 0;

        this.spr = new Sprite(256, 256);
    
        this.flip = Flip.None;

    }


    protected die(state : FrameState) {

        return true;
    }


    private control(state : FrameState) {

        const BASE_GRAVITY = 16.0;
        const BASE_SPEED = 4.0;
        const JUMP_TIME = 12;
        
        this.target.x = state.getStick().x * BASE_SPEED;
        this.target.y = BASE_GRAVITY;

        let jumpState = state.getAction("fire1");

        // Normal & double jump
        if ( (this.jumpMargin > 0) && jumpState == State.Pressed) {

            this.jumpTimer = JUMP_TIME;
            this.jumpMargin = 0;
        }
        else if (this.jumpTimer > 0 && (jumpState & State.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }

        this.target.x = computeFriction(this.target.x, 
            this.slopeFriction);
            
    }


    private animate(state : FrameState) {

        const EPS = 0.01;
        const JUMP_EPS = 2.0;

        if (Math.abs(this.target.x) > EPS) {

            this.flip = this.target.x <= -EPS ? Flip.Horizontal : Flip.None;
        }

        let frame : number;
        let speed : number;

        if (this.canJump) {

            if (Math.abs(this.target.x) > EPS) {

                speed = 10 - Math.abs(this.speed.x);
                this.spr.animate(1, 0, 3, speed, state.step);
            }
            else {

                this.spr.setFrame(0, 0);
            }
        }
        else {

            frame = 2;
            if (this.speed.y < -JUMP_EPS)
                frame = 1;
            else if (this.speed.y > JUMP_EPS)
                frame = 3;

            this.spr.setFrame(frame, 0);
        }
    }


    private updateTimers(state : FrameState) {

        const JUMP_SPEED = -12.0;

        if (this.jumpTimer > 0) {

            this.jumpTimer -= state.step;
            this.speed.y = JUMP_SPEED;
        }
    }


    protected updateLogic(state : FrameState) {

        this.control(state);
        this.animate(state);
        this.updateTimers(state);

        this.canJump = false;
        this.slopeFriction = 0;

    }


    public draw(canvas : Canvas) {

        let bmp = canvas.getBitmap("player");

        canvas.drawSprite(this.spr, bmp, 
            this.pos.x - this.spr.width/2,
            this.pos.y - this.spr.height/2,
            this.spr.width, this.spr.height, 
            this.flip);
    }


    protected slopeCollisionEvent(dir : number, friction : number, state : FrameState) {

        const JUMP_MARGIN = 12;
        if (dir > 0) {

            this.canJump = true;
            this.jumpTimer = 0;
            this.jumpMargin = JUMP_MARGIN;

            this.slopeFriction = friction;
        }
        else {

            this.jumpTimer = 0;
        }
    }
}
