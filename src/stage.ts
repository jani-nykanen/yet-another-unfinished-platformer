import { Bitmap } from "./core/bitmap.js";
import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Rect, Vector2 } from "./core/vector.js";
import { CollisionObject } from "./gameobject.js";



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

    private backgroundLoaded : boolean;
    private background : Bitmap;
    private backgroundBuffer : Bitmap;
    private scale : number;
    private startPos : Vector2;

    private stageIndex : number;


    constructor(state : FrameState, levelIndex : number) {

        this.slopes = new Array<Line> ();
        this.ladders = new Array<Rect> ();
        this.walls = new Array<Wall> ();

        this.backgroundLoaded = false;
        this.scale = 1;

        this.parseJSON(state.getDocument(String(levelIndex)), state);

        this.stageIndex = levelIndex;
    }


    private parseJSON(source : string, state : FrameState, 
        destroyOldBackground = false) {

        let data = JSON.parse(source);

        this.slopes = new Array<Line> ();
        this.ladders = new Array<Rect> ();
        this.walls = new Array<Wall> ();

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

        if (data["walls"] != undefined) {

            for (let s of data["walls"]) {

                this.walls.push(new Wall(
                    Number(s["x"]) / this.scale, Number(s["y"]) / this.scale, 
                    Number(s["h"]) / this.scale, Number(s["dir"])
                ));
            }
        }

        this.startPos = new Vector2(
            Number(data["startPos"]["x"]) / this.scale, 
            Number(data["startPos"]["y"]) / this.scale);
    }


    public nextStage(state : FrameState) {

        this.backgroundBuffer = this.background;

        this.backgroundLoaded = false;
        this.parseJSON(state.getDocument(String(this.stageIndex + 1)), state);
    }


    public update(state : FrameState) {

        // ...
    }


    public objectCollision(o : CollisionObject, state : FrameState) : boolean {

        const SIDE_COLLISION_MARGIN = 1024;
        const LADDER_TOP_MARGIN = 16;

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


    public applyScale(canvas : Canvas) {

        canvas.transform.scale(this.scale, this.scale);
        canvas.transform.use();
    }


    public hasLoaded = () : boolean => this.backgroundLoaded;

    public getStartPosition = () : Vector2 => this.startPos.clone();
}
