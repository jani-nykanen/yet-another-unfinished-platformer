import { Canvas } from "./canvas.js";
import { FrameState } from "./core.js";
import { RGBA, Vector2 } from "./vector.js";


export enum TransitionEffectType {

    None = 0,
    Fade = 1,
    CirleIn = 2,
    BoxVertical = 3,
    BoxHorizontal = 4,
    // SomethingAmazing = 256,
}


export class TransitionEffectManager {


    private timer : number;
    private fadeIn : boolean;
    private effectType : TransitionEffectType;
    private color : RGBA;
    private active : boolean;
    private center : Vector2;
    private speed : number;
    
    private callback : ((ev : FrameState) => void);


    constructor() {

        this.timer = 0;
        this.fadeIn = false;
        this.effectType = TransitionEffectType.None;
        this.color = new RGBA();
        this.active = false;
        this.center = new Vector2(80, 72);
        this.speed = 1;

        this.callback = ev => {};
    }


    public activate(fadeIn : boolean, type : TransitionEffectType, speed : number, 
        callback : (ev : FrameState) => any, color = new RGBA()) : TransitionEffectManager {

        this.fadeIn = fadeIn;
        this.speed = speed;
        this.timer = 1.0;
        this.callback = callback;
        this.effectType = type;
        this.color = color.clone();

        this.active = true;

        return this;
    }


    public setCenter(pos : Vector2) : TransitionEffectManager {

        this.center = pos.clone();
        return this;
    }


    public update(ev : FrameState) {

        if (!this.active) return;

        if ((this.timer -= this.speed * ev.step) <= 0) {

            this.fadeIn = !this.fadeIn;
            if (!this.fadeIn) {

                this.timer += 1.0;
                this.callback(ev);
            }
            else {

                this.active = false;
                this.timer = 0;
            }
        }
    }


    public draw(c : Canvas) {

        if (!this.active || this.effectType == TransitionEffectType.None)
            return;
/*
        c.moveTo();

        let t = this.timer;
        if (this.fadeIn)
            t = 1.0 - t;

        let maxRadius : number;
        let radius : number;

        switch (this.effectType) {

        case TransitionEffectType.Fade:

            c.setFillColor(this.color.r, this.color.g, this.color.b, this.color.a);

            c.setGlobalAlpha(t);
            c.fillRect(0, 0, c.width, c.height);
            c.setGlobalAlpha();

            break;

        case TransitionEffectType.CirleIn:

            maxRadius = Math.max(
                Math.hypot(this.center.x, this.center.y),
                Math.hypot(c.width - this.center.x, this.center.y),
                Math.hypot(c.width - this.center.x, c.height - this.center.y),
                Math.hypot(this.center.x, c.height - this.center.y)
            );

            radius = (1 - t) * maxRadius;

            c.setFillColor(this.color.r, this.color.g, this.color.b, this.color.a);
            c.fillCircleOutside(radius, this.center.x, this.center.y);

            break;

        default:
            break;
        }
    */
    }


    public isActive = () : boolean => this.active;
}
