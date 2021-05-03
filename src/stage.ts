import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Vector2 } from "./core/vector.js";
import { CollisionObject } from "./gameobject.js";



class Line {

    public A : Vector2;
    public B : Vector2;


    constructor(x1 : number, y1 : number, x2 : number, y2 : number) {

        this.A = new Vector2(x1, y1);
        this.B = new Vector2(x2, y2);
    }
}



export class Stage {


    private slopes : Array<Line>;


    constructor(state : FrameState, levelIndex : number) {

        this.slopes = new Array<Line> ();

        this.parseJSON(state.getDocument("test"));
    }


    private parseJSON(source : string) {

        let data = JSON.parse(source);

        for (let s of data["slopes"]) {

            this.slopes.push(new Line(
                Number(s["x1"]), Number(s["y1"]), Number(s["x2"]), Number(s["y2"])
            ));
        }
    }


    public update(state : FrameState) {

        // ...
    }


    public objectCollision(o : CollisionObject, state : FrameState) {

        const LEFT_COLLISION_MARGIN = 1024;

        for (let s of this.slopes) {

            o.slopeCollision(s.A.x, s.A.y, s.B.x, s.B.y, 1, state);
        }

        o.wallCollision(0, -LEFT_COLLISION_MARGIN, 768 + LEFT_COLLISION_MARGIN*2, 
            -1, state, true);
    }


    public draw(canvas : Canvas) {

        canvas.drawBitmap(canvas.getBitmap("testScene"), 
            0, 0, canvas.width, canvas.height);
    }
}
