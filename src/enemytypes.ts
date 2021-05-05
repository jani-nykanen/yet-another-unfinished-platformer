import { Flip } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { clamp } from "./core/mathext.js";
import { Vector2 } from "./core/vector.js";
import { Enemy } from "./enemy.js";
import { Player } from "./player.js";


const ENEMY_TYPES = () : Array<Function> => [Snake, Dog];

export const getEnemyType = (index : number) : Function => ENEMY_TYPES()
    [clamp(index, 0, ENEMY_TYPES().length-1) | 0];


export class Snake extends Enemy {


    constructor(x : number, y : number) {

        super(x, y, 0, 0.90);

        this.hitbox = new Vector2(128, 64);
        this.collisionBox = new Vector2(128, 64);

        this.center = new Vector2(0, 32);

        this.friction.x = 1.0;
    }


    private animate(state : FrameState) {

        const BASE_ANIM_SPEED = 6.0;
        const WAIT_SPEED = 30.0;
		
		this.flip = this.dir > 0 ? Flip.Horizontal : Flip.None;
		
		if (this.canJump) {
			
            this.spr.animate(this.spr.getRow(), 0, 3, 
                this.spr.getColumn() % 2 == 0 ? WAIT_SPEED : BASE_ANIM_SPEED, 
                state.step);
        }
        else {

            this.spr.setFrame(0, this.spr.getRow());
        }
    }


    protected updateAI(state : FrameState) {

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

    
    protected wallCollisionEvent(dir : number, state : FrameState) {

        this.dir = -dir;
    }
}


export class Dog extends Enemy {


    static JUMP_TIME = 60;


    private jumpTimer : number;


    constructor(x : number, y : number) {

        const BASE_GRAVITY = 16.0;

        super(x, y, 1, 0.90);

        this.hitbox = new Vector2(128, 64);
        this.collisionBox = new Vector2(128, 128);

        this.center = new Vector2(0, 24);

        this.target.y = BASE_GRAVITY;
        this.friction.y = 0.35;

        this.jumpTimer = Dog.JUMP_TIME + 
            (Math.floor((x | 0) % 2)) * Dog.JUMP_TIME/2;
    }


    protected updateAI(state : FrameState) {

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


    protected playerEvent(player : Player, state : FrameState) {

        this.flip = player.getPos().x < this.pos.x ? Flip.None : Flip.Horizontal;
    }
}