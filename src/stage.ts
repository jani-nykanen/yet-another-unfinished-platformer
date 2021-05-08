import { Bitmap } from "./core/bitmap.js";
import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Rect, Vector2 } from "./core/vector.js";
import { CollisionObject, nextObject } from "./gameobject.js";
import { Leaf } from "./leaf.js";
import { ObjectManager } from "./objectmanager.js";



class Line {

    public A : Vector2;
    public B : Vector2;
    public dir : number;


    constructor(x1 : number, y1 : number, x2 : number, y2 : number, dir : number) {

        this.A = new Vector2(x1, y1);
        this.B = new Vector2(x2, y2);
        this.dir = dir;
    }
}


class Wall {


    public pos : Vector2;
    public height : number;
    public dir : number;


    constructor(x : number, y : number, h : number, dir : number) {

        this.pos = new Vector2(x, y);
        this.height = h;
        this.dir = dir;
    }
}



export class Stage {


    private slopes : Array<Line>;
    private ladders : Array<Rect>;
    private walls : Array<Wall>;
    private enemyWalls : Array<Wall>;

    private backgroundLoaded : boolean;
    private background : Bitmap;
    private backgroundBuffer : Bitmap;
    private scale : number;
    private startPos : Vector2;

    private stageIndex : number;

    private leaves : Array<Leaf>;
    private leafTimer : number;
    private hasLeaves : boolean;


    constructor(objects : ObjectManager, state : FrameState, levelIndex : number) {

        this.slopes = new Array<Line> ();
        this.ladders = new Array<Rect> ();
        this.walls = new Array<Wall> ();
        this.enemyWalls = new Array<Wall> ();

        this.backgroundLoaded = false;
        this.scale = 1;

        this.leaves = new Array<Leaf> ();
        this.leafTimer = 0.0;
        this.hasLeaves = false;

        this.parseJSON(state.getDocument(String(levelIndex)), objects, state);

        this.stageIndex = levelIndex;
    }


    private parseWalls(data : any, name : string, arr : Array<Wall>) {

        if (data[name] != undefined) {

            for (let s of data[name]) {

                arr.push(new Wall(
                    Number(s["x"]) / this.scale, Number(s["y"]) / this.scale, 
                    Number(s["h"]) / this.scale, Number(s["dir"])
                ));
            }
        }
    }


    private parseJSON(source : string,
        objects : ObjectManager, state : FrameState, 
        destroyOldBackground = false) {

        let data = JSON.parse(source);

        this.leaves = new Array<Leaf> ();
        this.leafTimer = 0.0;

        this.slopes = new Array<Line> ();
        this.ladders = new Array<Rect> ();
        this.walls = new Array<Wall> ();
        this.enemyWalls = new Array<Wall> ();

        state.loadBitmap(data["image"], bmp => {

            this.background = bmp;
            this.backgroundLoaded = true;

            if (destroyOldBackground) {

                this.backgroundBuffer.destroy();
                this.backgroundBuffer = null;
            }
        });

        this.scale = Number(data["scale"]);

        if (data["slopes"] != undefined) {

            for (let s of data["slopes"]) {

                this.slopes.push(new Line(
                    Number(s["x1"]) / this.scale, Number(s["y1"]) / this.scale, 
                    Number(s["x2"]) / this.scale, Number(s["y2"]) / this.scale, 
                    Number(s["dir"])
                ));
            }
        }

        if (data["ladders"] != undefined) {

            for (let s of data["ladders"]) {

                this.ladders.push(new Rect(
                    Number(s["x"]) / this.scale, Number(s["y"]) / this.scale,
                    Number(s["w"]) / this.scale, Number(s["h"]) / this.scale
                ));
            }
        }

        this.parseWalls(data, "walls", this.walls);
        this.parseWalls(data, "enemyWalls", this.enemyWalls);

        if (data["enemies"] != undefined) {

            for (let e of data["enemies"]) {

                objects.addEnemy(
                    Number(e["x"]) / this.scale, 
                    Number(e["y"]) / this.scale,
                    Number(e["id"]));
            }
        }

        this.startPos = new Vector2(
            Number(data["startPos"]["x"]) / this.scale, 
            Number(data["startPos"]["y"]) / this.scale);

        this.hasLeaves = data["hasLeaves"] != undefined && Boolean(data["hasLeaves"]);
            
        if (data["hasInitialLeaves"] != undefined && (data["hasInitialLeaves"])) {

            this.generateInitialLeaves();
        }
    }


    public nextStage(objects : ObjectManager, state : FrameState) {

        this.backgroundBuffer = this.background;

        this.backgroundLoaded = false;
        this.parseJSON(state.getDocument(String(this.stageIndex + 1)), objects, state);

        ++ this.stageIndex;
    }


    private generateInitialLeaves() {

        const MIN_COUNT = 4;
        const MAX_COUNT = 8;

        let count = MIN_COUNT + ((Math.random() * (MAX_COUNT - MIN_COUNT)) | 0);
        for (let i = 0; i < count; ++ i) {

            this.generateLeaf(Math.random() * 768);
        }
    }


    private generateLeaf(dy = -64) {

        const MIN_SPEED_X = 2;
        const MAX_SPEED_X = 4;
        const MIN_SPEED_Y = 2;
        const MAX_SPEED_Y = 6;

        let speedY = MIN_SPEED_Y + Math.random() * (MAX_SPEED_Y - MIN_SPEED_Y);
        let speedX = MIN_SPEED_X + Math.random() * (MAX_SPEED_X - MIN_SPEED_X);

        let x = 64 + Math.random() * (1024 - 128);
        let y = dy;

        nextObject(this.leaves, Leaf)
            .spawn(x, y, (Math.random() * 4) | 0,
            speedX, speedY);    
    }


    private updateLeaves(state : FrameState) {

        const LEAF_TIME = 60;

        if ((this.leafTimer -= state.step) <= 0) {

            this.generateLeaf();
            this.leafTimer += LEAF_TIME;
        }

        for (let l of this.leaves) {

            l.update(state);
        }
    }



    public update(state : FrameState) {

        if (this.hasLeaves) {
            
            this.updateLeaves(state);
        }
    }


    public objectCollision(o : CollisionObject, state : FrameState, isEnemy = false) : boolean {

        const SIDE_COLLISION_MARGIN = 1024;
        const LADDER_TOP_MARGIN = 16;

        if (o.isDying() || !o.doesExist()) return;

        for (let s of this.slopes) {

            o.slopeCollision(s.A.x, s.A.y, s.B.x, s.B.y, s.dir, state);
        }

        for (let l of this.ladders) {

            o.ladderCollision(l.x, l.y, l.w, l.h, false, state);
            o.ladderCollision(l.x, l.y, l.w, LADDER_TOP_MARGIN, true, state);
        }

        for (let w of this.walls) {

            o.wallCollision(w.pos.x, w.pos.y, w.height, w.dir, state);
        }

        if (isEnemy) {

            for (let w of this.enemyWalls) {

                o.wallCollision(w.pos.x, w.pos.y, w.height, w.dir, state);
            }

            o.constantSlopeCollision(0, 768 / this.scale, 2048, 1, false, false, state);
            o.constantSlopeCollision(0, 0, 2048, -1, false, false, state);
        }
        else {

            if (o.getPos().y - o.getHitbox().y > 768 / this.scale) {

                o.forceKill();
            }
        }

        o.wallCollision(0, -SIDE_COLLISION_MARGIN, 
            768 + SIDE_COLLISION_MARGIN*2, 
            -1, state, true);

        if (o.wallCollision(1024 / this.scale, -SIDE_COLLISION_MARGIN, 
            768 + SIDE_COLLISION_MARGIN*2, 
            1, state, true)) {

            return true;
        }

        return false;
    }


    public draw(canvas : Canvas) {

        if (!this.backgroundLoaded) return;

        canvas.drawBitmap(this.background, 
            0, 0, canvas.width, canvas.height);
    }


    public postDraw(canvas : Canvas) {

        for (let l of this.leaves) {

            l.draw(canvas);
        }
    }


    public applyScale(canvas : Canvas) {

        canvas.transform.scale(this.scale, this.scale);
        canvas.transform.use();
    }


    public hasLoaded = () : boolean => this.backgroundLoaded;

    public getStartPosition = () : Vector2 => this.startPos.clone();
}
