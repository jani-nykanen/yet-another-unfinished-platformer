import { Canvas } from "./core/canvas.js";
import { FrameState, Scene } from "./core/core.js";
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

        if (!this.stage.hasLoaded()) {

            canvas.toggleTexturing(false);
            canvas.setDrawColor(0.67, 0.67, 0.67);
            canvas.drawRectangle(0, 0, canvas.width, canvas.height);

            canvas.drawText(canvas.getBitmap("font"),
                "Loading...", 8, 8, -26, 0, false, 0.5, 0.5);
            return;
        }

        canvas.toggleTexturing();
        canvas.setDrawColor();

        this.stage.draw(canvas);
        this.objects.draw(canvas);

        
    }


    public dispose() : any {

        return null;
    }
}
