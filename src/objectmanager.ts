import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";


export class ObjectManager {


    private player : Player;


    constructor() {

        this.player = new Player(512, 384);
    }


    public setInitialState(stage : Stage) {

        let p = stage.getStartPosition();
        this.player.setPosition(p.x, p.y);
    }


    public update(stage : Stage, state : FrameState) : boolean {

        this.player.update(state);
        if (stage.objectCollision(this.player, state)) {

            return true;
        }

        return false;
    }


    public transitionUpdate(state : FrameState) {

        this.player.transitionUpdate(state);
    }


    public draw(canvas : Canvas) {

        this.player.draw(canvas);
    }
}
