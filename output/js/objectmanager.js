import { getEnemyType } from "./enemytypes.js";
import { Player } from "./player.js";
export class ObjectManager {
    constructor() {
        this.player = new Player(512, 384);
        this.enemies = new Array();
    }
    setInitialState(stage) {
        let p = stage.getStartPosition();
        this.player.setPosition(p.x, p.y);
    }
    resetEnemyArray() {
        this.enemies.length = 0;
    }
    update(stage, state) {
        if (!this.player.doesExist()) {
            this.player.respawn(state);
        }
        this.player.update(state);
        if (stage.objectCollision(this.player, state)) {
            return true;
        }
        for (let e of this.enemies) {
            e.update(state);
            e.playerCollision(this.player, state);
            stage.objectCollision(e, state, true);
        }
        return false;
    }
    transitionUpdate(state) {
        this.player.transitionUpdate(state);
    }
    draw(canvas) {
        this.player.preDraw(canvas);
        for (let e of this.enemies) {
            e.draw(canvas);
        }
        this.player.draw(canvas);
    }
    addEnemy(x, y, id) {
        this.enemies.push(new (getEnemyType(id)).prototype.constructor(x, y));
    }
}
