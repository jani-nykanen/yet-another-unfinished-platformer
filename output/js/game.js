import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";
export class GameScene {
    constructor(param, state) {
        this.objects = new ObjectManager();
        this.stage = new Stage(state, 1);
    }
    update(state) {
        this.objects.update(this.stage, state);
        this.stage.update(state);
    }
    redraw(canvas) {
        canvas.clear();
        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();
        canvas.toggleTexturing();
        canvas.setDrawColor();
        this.stage.draw(canvas);
        this.objects.draw(canvas);
        canvas.drawText(canvas.getBitmap("font"), "HELLO WORLD!", 16, 16, -26, 0);
    }
    dispose() {
        return null;
    }
}
