import { Canvas } from "./core/canvas.js";
import { FrameState } from "./core/core.js";
import { Scene } from "./core/core.js";
import { TransitionEffectType } from "./core/transition.js";
import { State } from "./core/types.js";
import { RGBA } from "./core/vector.js";
import { GameScene } from "./game.js";



export class AudioIntro implements Scene {


    private cursorPos : number;


    constructor(params : any, state : FrameState) {

        this.cursorPos = 0;
    }


    public update(state : FrameState) { 

        if (state.downPress() || state.upPress()) {

            this.cursorPos = Number(!Boolean(this.cursorPos));
        }

        if (state.getAction("start") == State.Pressed) {

            state.audio.toggle(this.cursorPos == 0);
            // state.audio.playSample(state.getSample("select"), 0.50);

            state.changeScene(GameScene);
            state.transition.activate(false, TransitionEffectType.Fade,
                1.0/30.0, null, new RGBA(128, 128, 128));
        }
    }


    public redraw(canvas : Canvas) {
        
        canvas.clear();

        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();

        canvas.toggleTexturing(false);
        canvas.setDrawColor();
        canvas.drawRectangle(0, 0, canvas.width, canvas.height);
        canvas.toggleTexturing();

        let bmpFont = canvas.getBitmap("font");

        canvas.drawText(bmpFont,
            "WOULD YOU LIKE\nTO ENABLE AUDIO?\nPRESS ENTER TO\nCONFIRM.",
            192, 128, -26, -4, false);

        let str = "";
        if (this.cursorPos == 0) {
            
            str = "@YES\n NO";
        }
        else {

            str = " YES\n@NO";
        }

        canvas.drawText(bmpFont,
            str, 256, 400, -26, -4, false, 1, 1);
    }


    public dispose = () : any => null;
}