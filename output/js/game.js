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
        if (!this.stage.hasLoaded()) {
            canvas.toggleTexturing(false);
            canvas.setDrawColor(0.67, 0.67, 0.67);
            canvas.drawRectangle(0, 0, canvas.width, canvas.height);
            canvas.drawText(canvas.getBitmap("font"), "Loading...", 8, 8, -26, 0, false, 0.5, 0.5);
            return;
        }
        canvas.toggleTexturing();
        canvas.setDrawColor();
        this.stage.draw(canvas);
        this.objects.draw(canvas);
    }
    dispose() {
        return null;
    }
}
