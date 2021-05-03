import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";


export class ObjectManager {


    private player : Player;


    constructor() {

        this.player = new Player(512, 384);
    }


    public update(stage : Stage, state : FrameState) {

        this.player.update(state);
        stage.objectCollision(this.player, state);
    }


    public draw(canvas : Canvas) {

        this.player.draw(canvas);
    }
}
