import { Sprite } from "./core/sprite.js";
import { Stage } from "./stage.js";
export class GameScene {
    constructor(param, state) {
        this.testSprite = new Sprite(256, 256);
        this.stage = new Stage(state, 1);
    }
    update(state) {
        this.testSprite.animate(0, 0, 3, 6, state.step);
    }
    redraw(canvas) {
        canvas.clear();
        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();
        canvas.toggleTexturing(false);
        canvas.setDrawColor(0.33, 0.67, 1.0);
        canvas.drawRectangle(0, 0, canvas.width, canvas.height);
        canvas.toggleTexturing();
        canvas.setDrawColor();
        this.stage.draw(canvas);
        this.testSprite.draw(canvas, canvas.getBitmap("test"), canvas.width / 2 - 128, canvas.height / 2 - 128);
        canvas.drawText(canvas.getBitmap("font"), "HELLO WORLD!", 16, 16, -26, 0);
    }
    dispose() {
        return null;
    }
}
