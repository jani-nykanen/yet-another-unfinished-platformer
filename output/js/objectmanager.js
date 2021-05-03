import { Player } from "./player.js";
export class ObjectManager {
    constructor() {
        this.player = new Player(512, 384);
    }
    update(stage, state) {
        this.player.update(state);
        stage.objectCollision(this.player, state);
    }
    draw(canvas) {
        this.player.draw(canvas);
    }
}
