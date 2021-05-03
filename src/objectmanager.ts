import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Player } from "./player.js";


export class ObjectManager {


    private player : Player;


    constructor() {

        this.player = new Player(512, 384);
    }


    public update(state : FrameState) {

        this.player.update(state);

        // Test collision
        this.player.slopeCollision(0, 768, 1024, 512, 1, state);
    }


    public draw(canvas : Canvas) {

        this.player.draw(canvas);
    }
}
