import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Sprite } from "./core/sprite.js";
import { Vector2 } from "./core/vector.js";
import { GameObject } from "./gameobject.js";



export class Leaf extends GameObject {


    private speedFactor : Vector2;
    private speedAngle : number;
    private scale : number;
    private bottom : number;


    constructor() {

        super(0, 0);

        this.spr = new Sprite(64, 64);

        this.speedFactor = new Vector2();
        this.speedAngle = 0.0;

        this.friction = new Vector2(0.5, 0.5);

        this.exist = false;
    }


    public spawn(x : number, y : number, type : number, 
        speedx : number, speedy : number, 
        bottom : number, scale = 1.0) {

        this.pos = new Vector2(x, y);

        this.spr.setFrame(type % 2, (type / 2) | 0);

        this.speedFactor = new Vector2(speedx, speedy);
        this.speedAngle = Math.random() * Math.PI * 2;

        this.scale = scale;
        this.bottom = bottom;

        this.exist = true;
    }


    protected updateLogic(state : FrameState) {

        const ANGLE_SPEED = 0.05;

        if (this.pos.y > this.bottom + this.spr.height) {

            this.exist = false;
        }

        this.target.y = this.speedFactor.y;

        this.speedAngle = (this.speedAngle + ANGLE_SPEED * state.step) % (Math.PI*4);
        this.target.y = this.speedFactor.y * 0.5 * ((Math.sin(this.speedAngle) + 1.0));
        this.target.x = Math.sin(this.speedAngle * 0.5) * this.speedFactor.x;
    }


    public draw(canvas : Canvas) {

        if (!this.exist) return;

        let bmp = canvas.getBitmap("leaves");

        canvas.transform.push();
        canvas.transform.translate(this.pos.x, this.pos.y);
        canvas.transform.rotate(-this.speed.x / this.speedFactor.x * Math.PI/4);
        canvas.transform.scale(this.scale, this.scale);
        canvas.transform.use();

        canvas.drawSprite(this.spr, bmp, 
            -this.spr.width/2 * this.scale,
            -this.spr.height/2 * this.scale);
    
        canvas.transform.pop();        
    }
}
