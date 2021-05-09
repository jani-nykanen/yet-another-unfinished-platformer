import { Canvas } from "./core/canvas.js";
import { FrameState, Scene } from "./core/core.js";
import { TransitionEffectType } from "./core/transition.js";
import { RGBA } from "./core/vector.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";


export class GameScene implements Scene {


    private objects : ObjectManager;
    private stage : Stage;

    private anyKeyPressed : boolean;


    constructor(param : any, state : FrameState) {

        state.transition.activate(false, TransitionEffectType.Fade,
            1.0/30.0, null, new RGBA(1, 1, 1));

        this.objects = new ObjectManager();
        this.stage = new Stage(this.objects, state, 1);

        this.objects.setInitialState(this.stage);

        this.anyKeyPressed = true; // false;
    }   


    public update(state : FrameState) {

        if (state.transition.isActive()) {

            this.objects.transitionUpdate(state);
            return;
        }

        if (!this.anyKeyPressed) {

            if (state.anyInputActionOccurred()) {

                this.anyKeyPressed = true;
            }
            else {
                
                return;
            }
        }

        if (this.objects.update(this.stage, state)) {

            state.transition.activate(true, TransitionEffectType.Fade,
                1.0 / 30.0, state => {

                    this.objects.resetEnemyArray();
                    this.stage.nextStage(this.objects, state);
                    this.objects.setInitialState(this.stage);

                }, new RGBA(1, 1, 1));
        }

        this.stage.update(state);
    }


    public redraw(canvas : Canvas) {

        canvas.clear();

        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();

        if (canvas.isShaking()) {

            canvas.toggleTexturing(false);
            canvas.setDrawColor();
            canvas.drawRectangle(0, 0, canvas.width, canvas.height);
            canvas.toggleTexturing();
        }

        canvas.applyShake();
        canvas.transform.use();

        if (!this.stage.hasLoaded()) {

            canvas.toggleTexturing(false);
            canvas.setDrawColor(0.67, 0.67, 0.67);
            canvas.drawRectangle(0, 0, canvas.width, canvas.height);

            canvas.drawText(canvas.getBitmap("font"),
                "Loading...", 8, 8, -26, 0, false, 0.5, 0.5);
            return;
        }

        canvas.toggleTexturing();
        canvas.setDrawColor();

        this.stage.draw(canvas);
        this.stage.applyScale(canvas);
        this.objects.draw(canvas);

        canvas.transform.loadIdentity();
        canvas.transform.use();

        this.stage.postDraw(canvas);
    }


    public dispose() : any {

        return null;
    }
}
