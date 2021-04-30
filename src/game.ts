import { Canvas } from "./core/canvas.js";
import { FrameState, Scene } from "./core/core.js";


export class GameScene implements Scene {


    constructor(param : any, state : FrameState) {

        // ...
    }   


    public update(state : FrameState) {

        // ...
    }


    public redraw(canvas : Canvas) {

        canvas.clear(0.67, 0.67, 0.67);

        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.useTransform();

        canvas.drawText(canvas.getBitmap("font"),
            "HELLO WORLD!", 16, 16, -26, 0);
    }


    public dispose() : any {

        return null;
    }
}
