import { Canvas } from "./core/canvas.js";
import { FrameState, Scene } from "./core/core.js";
import { Sprite } from "./core/sprite.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";


export class GameScene implements Scene {


    private objects : ObjectManager;
    private stage : Stage;


    constructor(param : any, state : FrameState) {

        this.objects = new ObjectManager();
        this.stage = new Stage(state, 1);
    }   


    public update(state : FrameState) {

        this.objects.update(state);
        this.stage.update(state);
    }


    public redraw(canvas : Canvas) {

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
        this.objects.draw(canvas);

        canvas.drawText(canvas.getBitmap("font"),
            "HELLO WORLD!", 16, 16, -26, 0);
    }


    public dispose() : any {

        return null;
    }
}
