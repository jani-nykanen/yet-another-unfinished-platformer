import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Enemy } from "./enemy.js";
import { getEnemyType } from "./enemytypes.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";


export class ObjectManager {


    private player : Player;
    private enemies : Array<Enemy>;


    constructor() {

        this.player = new Player(512, 384);
        this.enemies = new Array<Enemy> ();
    }


    public setInitialState(stage : Stage) {

        let p = stage.getStartPosition();
        this.player.setPosition(p.x, p.y);
    }


    public resetEnemyArray() {

        this.enemies.length = 0;
    }


    public update(stage : Stage, state : FrameState) : boolean {

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


    public transitionUpdate(state : FrameState) {

        this.player.transitionUpdate(state);
    }


    public draw(canvas : Canvas) {

        this.player.preDraw(canvas);

        for (let e of this.enemies) {

            e.draw(canvas);
        }

        this.player.draw(canvas);
    }


    public addEnemy(x : number, y : number, id : number) {

        this.enemies.push(new (getEnemyType(id)).prototype.constructor(x, y));
    }
    
}
