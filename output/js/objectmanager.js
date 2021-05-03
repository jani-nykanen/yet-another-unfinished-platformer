import { Player } from "./player.js";
export class ObjectManager {
    constructor() {
        this.player = new Player(512, 384);
    }
    update(state) {
        this.player.update(state);
        // Test collision
        this.player.slopeCollision(0, 768, 1024, 512, 1, state);
    }
    draw(canvas) {
        this.player.draw(canvas);
    }
}
