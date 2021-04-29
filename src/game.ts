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

       canvas.drawRectangle(0, 0, 1, 1);
    }


    public dispose() : any {

        return null;
    }
}
