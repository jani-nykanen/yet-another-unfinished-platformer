import { Canvas, Flip } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { boxOverlay, CollisionObject, computeFriction, nextObject } from "./gameobject.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { State } from "./core/types.js";
import { Dust } from "./dust.js";
import { clamp } from "./core/mathext.js";


export class Player extends CollisionObject {


    private canJump : boolean;
    private jumpTimer : number;
    private jumpMargin : number;
    private crouching : boolean;

    private slopeFriction : number;

    private flappingArms : boolean;
    private running : boolean;
    private climbing : boolean;
    private touchLadder : boolean;
    private isLadderTop : boolean;
    private climbX : number;

    private flip : Flip;

    private dust : Array<Dust>;
    private dustTimer : number;

    private startPos : Vector2;
    private respawning : boolean;
    private respawnType : number;


    constructor(x : number, y : number) {

        super(x, y);

        this.startPos = this.pos.clone();
        this.respawning = true;
        this.respawnType = 1;

        this.friction = new Vector2(0.40, 0.75);
        this.hitbox = new Vector2(80, 144);
        this.collisionBox = new Vector2(80, 160);
        this.center = new Vector2(0, 16);

        this.canJump = false;
        this.jumpTimer = 0;
        this.jumpMargin = 0;

        this.spr = new Sprite(256, 256);
    
        this.flappingArms = false;
        this.running = false;
        this.climbing = false;
        this.touchLadder = false;
        this.isLadderTop = false;
        this.climbX = 0.0;
        this.crouching = false;

        this.dustTimer = 0;
        this.dust = new Array<Dust> ();

        this.flip = Flip.None;
    }


    protected die(state : FrameState) {

        this.spr.animate(0, 0, 4, 5, state.step);

        this.updateDust(state);

        this.flip = Flip.None;

        return this.spr.getColumn() == 4;
    }


    private startClimbing(state : FrameState) {

        let canGoDown = this.isLadderTop && this.canJump;

        if (!this.climbing &&
            this.touchLadder && 
            (!this.isLadderTop && state.upPress() || 
            (canGoDown && state.downPress()))) {

            this.flappingArms = false;

            this.climbing = true;
            this.pos.x = this.climbX;

            if (canGoDown) {

                this.pos.y += 48;
            }
            this.stopMovement();
            this.jumpTimer = 0;
        }
    }


    private climb(state : FrameState) {

        const EPS = 0.1;
        const CLIMB_SPEED = 4.0;
        const CLIB_JUMP_TIME = 12;

        let jumpButtonState = state.getAction("fire1");

        if (!this.touchLadder) {

            this.climbing = false;
        }
        else {

            this.target.y = CLIMB_SPEED * state.getStick().y;
            if (jumpButtonState == State.Pressed) {

                this.climbing = false;
                if (state.getStick().y < EPS) {

                    this.jumpTimer =  CLIB_JUMP_TIME;
                }
            }
        }
    }


    private jump(state : FrameState) {

        const JUMP_TIME = 12;
        const FLAP_TIME = 60;
        const SPEED_BONUS = 2.0;
        const MAX_FLAP_INITIAL_SPEED = 6.0;

        let jumpState = state.getAction("fire1");

        let canFlapArms = this.jumpMargin <= 0 && !this.flappingArms;

        if ( (this.jumpMargin > 0 || canFlapArms) && 
            jumpState == State.Pressed) {

            if (canFlapArms) {

                this.speed.y = clamp(this.speed.y, 0, MAX_FLAP_INITIAL_SPEED);
                this.flappingArms = true;
            }

            this.jumpTimer = this.flappingArms ? FLAP_TIME : JUMP_TIME;
            this.jumpMargin = 0;

            if (!this.flappingArms) {

                this.jumpTimer += Math.abs(this.speed.x) / SPEED_BONUS;
            }
        }
        else if (this.jumpTimer > 0 && (jumpState & State.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }
    }


    private control(state : FrameState) {

        const EPS = 0.5;
        const BASE_GRAVITY = 16.0;
        const BASE_SPEED = 5.0;
        const RUN_SPEED = 8.0;

        this.target.zeros();

        this.startClimbing(state);
        if (this.climbing) {

            this.climb(state);
            return;
        }
        
        this.running = (state.getAction("fire2") & State.DownOrPressed) == 1;

        this.target.x = state.getStick().x * (this.running ? RUN_SPEED : BASE_SPEED);
        this.target.y = BASE_GRAVITY;

        this.jump(state);

        this.target.x = computeFriction(this.target.x, 
            this.slopeFriction);
            
        if (this.canJump && state.getStick().y > EPS) {

            this.crouching = true;
            this.target.x = 0;
        }
    }


    private updateDust(state : FrameState) {

        const DUST_TIME = 12;
        const DUST_SPEED = 6;
        const EPS = 0.1;

        for (let d of this.dust) {

            d.update(state);
        }

        if (this.dying || !this.canJump || Math.abs(this.speed.x) <= EPS) {

            this.dustTimer = 0;
            return;
        }            

        if ((this.dustTimer += Math.abs(this.speed.x / 4.0) * state.step) >= DUST_TIME) {

            nextObject<Dust>(this.dust, Dust)   
                .spawn(this.pos.x - Math.sign(this.speed.x) * 48, 
                    this.pos.y + 80, DUST_SPEED);

            this.dustTimer -= DUST_TIME;
        }
    }


    private animate(state : FrameState) {

        const EPS = 0.01;
        const JUMP_EPS = 3.0;

        if (Math.abs(this.target.x) > EPS) {

            this.flip = this.target.x <= -EPS ? Flip.Horizontal : Flip.None;
        }

        let frame : number;
        let speed : number;

        if (this.climbing) {

            if (Math.abs(this.target.y) > EPS) {

                this.spr.animate(2, 0, 3, 6, state.step);
            }
            return;
        }

        if (this.flappingArms && this.jumpTimer > 0) {

            this.spr.animate(3, 0, 1, 4, state.step);
            return;
        }

        if (this.canJump) {

            if (this.crouching) {

                this.spr.setFrame(3, 3);
            }
            else if (Math.abs(this.target.x) > EPS) {

                speed = 12 - Math.abs(this.speed.x);
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

        const JUMP_SPEED = -13.0;
        const FLAP_SPEED = -1.0;
        const FLAP_MIN_SPEED = -4.0;

        if (this.jumpMargin > 0) {

            this.jumpMargin -= state.step;
        }

        if (this.jumpTimer > 0) {

            this.jumpTimer -= state.step;

            if (this.flappingArms) {
                
                this.speed.y = Math.max(FLAP_MIN_SPEED, 
                    this.speed.y + FLAP_SPEED * state.step);
            }
            else {

                this.speed.y = JUMP_SPEED;
            }
        }
    }


    private updateRespawning(state : FrameState) {

        this.spr.animate(4 + this.respawnType, 0, 4, 6, state.step);
        if (this.spr.getColumn() == 4) {

            this.spr.setFrame(0, 0);

            this.respawning = false;
            this.respawnType = 0;
        }

        this.flip = Flip.None;
    }


    protected updateLogic(state : FrameState) {

        const HITBOX_Y_BASE = 160;
        const HITBOX_Y_CROUCH = 64;

        if (this.respawning) {

            this.updateRespawning(state);
            return;
        }

        this.control(state);
        this.animate(state);
        this.updateTimers(state);
        this.updateDust(state);

        this.hitbox.y = this.crouching ? HITBOX_Y_CROUCH : HITBOX_Y_BASE;

        this.canJump = false;
        this.touchLadder = false;
        this.isLadderTop = false;
        this.crouching = false;

        this.slopeFriction = 0;
    }


    public transitionUpdate(state : FrameState) {

        const MOVE_SPEED = 2.5;

        if (this.respawning) return;

        if (!this.canJump) {

            this.flappingArms = true;
            this.jumpTimer = 1;
        }

        this.updateDust(state);
        this.animate(state);

        this.target.x = MOVE_SPEED;
        this.speed.x = MOVE_SPEED;
        this.pos.x += this.speed.x * state.step;

        this.startPos.x = this.pos.x;
    }


    public preDraw(canvas : Canvas) {

        for (let d of this.dust) {

            d.draw(canvas);
        }
    }


    public draw(canvas : Canvas) {

        if (!this.exist) return;

        let bmp = canvas.getBitmap(this.dying ? "poof" : "player");

        canvas.drawSprite(this.spr, bmp, 
            this.pos.x - this.spr.width/2,
            this.pos.y - this.spr.height/2,
            this.spr.width, this.spr.height, 
            this.flip);
    }


    protected slopeCollisionEvent(dir : number, friction : number, state : FrameState) {

        const JUMP_MARGIN = 15;
        if (dir > 0) {

            this.canJump = true;
            this.jumpTimer = 0;
            this.jumpMargin = JUMP_MARGIN;

            this.slopeFriction = friction;

            this.flappingArms = false;

            this.climbing = false;
        }
        else {

            this.jumpTimer = 0;
        }
    }


    public ladderCollision(x : number, y : number, w : number, h : number, 
        ladderTop : boolean, state : FrameState) : boolean {

        const COLLISION_REDUCTION_X = 0.5;

        let ladderBox = this.collisionBox.clone();
        ladderBox.x *= COLLISION_REDUCTION_X;

        if (boxOverlay(this.pos, this.center, ladderBox, x, y, w, h)) {

            this.climbX = x + w/2;
            this.touchLadder = true;
            this.isLadderTop = this.isLadderTop || ladderTop;

            return true;
        }
        return false;
    }


    private resetProperties() {

        this.flappingArms = false;
        this.running = false;
        this.climbing = false;
        this.touchLadder = false;
        this.isLadderTop = false;
        this.canJump = true;
        this.jumpTimer = 0;
        this.jumpMargin = 0;
        this.dustTimer = 0;
        this.crouching = false;

        if (this.respawning) {

            this.spr.setFrame(0, 5);
        }
        else {

            this.spr.setFrame(0, 0);
        }
    }


    public setPosition(x : number, y : number) {

        this.stopMovement();
        this.pos = new Vector2(x, y);

        this.resetProperties();

        for (let d of this.dust) {

            d.forceKill();
        }

        this.startPos = this.pos.clone();
    }


    public respawn(state : FrameState) {

        this.pos = this.startPos.clone();

        this.stopMovement();
        this.resetProperties();

        this.dying = false;
        this.exist = true;

        this.respawning = true;
    }


    public kill(state : FrameState) {

        if (this.dying || !this.exist) return;

        this.spr.setFrame(0, 0);
        this.dying = true;
    }
}
