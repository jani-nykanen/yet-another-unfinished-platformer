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

        this.objects.update(this.stage, state);
        this.stage.update(state);
    }


    public redraw(canvas : Canvas) {

        canvas.clear();

        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();

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
