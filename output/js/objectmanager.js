import { Player } from "./player.js";
export class ObjectManager {
    constructor() {
        this.player = new Player(512, 384);
    }
    setInitialState(stage) {
        let p = stage.getStartPosition();
        this.player.setPosition(p.x, p.y);
    }
    update(stage, state) {
        this.player.update(state);
        if (stage.objectCollision(this.player, state)) {
            return true;
        }
        return false;
    }
    transitionUpdate(state) {
        this.player.transitionUpdate(state);
    }
    draw(canvas) {
        this.player.draw(canvas);
    }
}
