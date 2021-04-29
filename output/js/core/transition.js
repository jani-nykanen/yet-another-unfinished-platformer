import { RGBA, Vector2 } from "./vector.js";
export var TransitionEffectType;
(function (TransitionEffectType) {
    TransitionEffectType[TransitionEffectType["None"] = 0] = "None";
    TransitionEffectType[TransitionEffectType["Fade"] = 1] = "Fade";
    TransitionEffectType[TransitionEffectType["CirleIn"] = 2] = "CirleIn";
    TransitionEffectType[TransitionEffectType["BoxVertical"] = 3] = "BoxVertical";
    TransitionEffectType[TransitionEffectType["BoxHorizontal"] = 4] = "BoxHorizontal";
    // SomethingAmazing = 256,
})(TransitionEffectType || (TransitionEffectType = {}));
export class TransitionEffectManager {
    constructor() {
        this.isActive = () => this.active;
        this.timer = 0;
        this.fadeIn = false;
        this.effectType = TransitionEffectType.None;
        this.color = new RGBA();
        this.active = false;
        this.center = new Vector2(80, 72);
        this.speed = 1;
        this.callback = ev => { };
    }
    activate(fadeIn, type, speed, callback, color = new RGBA()) {
        this.fadeIn = fadeIn;
        this.speed = speed;
        this.timer = 1.0;
        this.callback = callback;
        this.effectType = type;
        this.color = color.clone();
        this.active = true;
        return this;
    }
    setCenter(pos) {
        this.center = pos.clone();
        return this;
    }
    update(ev) {
        if (!this.active)
            return;
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
    draw(c) {
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
}
