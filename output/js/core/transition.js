import { RGBA } from "./vector.js";
export var TransitionEffectType;
(function (TransitionEffectType) {
    TransitionEffectType[TransitionEffectType["None"] = 0] = "None";
    TransitionEffectType[TransitionEffectType["Fade"] = 1] = "Fade";
    TransitionEffectType[TransitionEffectType["CirleIn"] = 2] = "CirleIn";
    TransitionEffectType[TransitionEffectType["BoxVertical"] = 3] = "BoxVertical";
    TransitionEffectType[TransitionEffectType["BoxHorizontal"] = 4] = "BoxHorizontal";
})(TransitionEffectType || (TransitionEffectType = {}));
export class TransitionEffectManager {
    constructor() {
        this.isActive = () => this.active;
        this.timer = 0;
        this.fadeIn = false;
        this.effectType = TransitionEffectType.None;
        this.color = new RGBA();
        this.active = false;
        this.speed = 1;
        this.wait = false;
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
    toggleWaiting(state) {
        this.wait = state;
    }
    update(ev) {
        if (!this.active || this.wait)
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
    draw(canvas) {
        if (!this.active || this.effectType == TransitionEffectType.None)
            return;
        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();
        let t = this.timer;
        if (this.fadeIn)
            t = 1.0 - t;
        switch (this.effectType) {
            case TransitionEffectType.Fade:
                canvas.toggleTexturing(false);
                canvas.setDrawColor(this.color.r, this.color.g, this.color.b, this.color.a * t);
                canvas.drawRectangle(0, 0, canvas.width, canvas.height);
                break;
            default:
                break;
        }
    }
}
