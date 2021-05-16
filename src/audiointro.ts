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

        if (state.getAction("start") == State.Pressed ||
            state.getAction("fire1") == State.Pressed) {

            state.audio.toggle(this.cursorPos == 0);
            // state.audio.playSample(state.getSample("select"), 0.50);

            state.changeScene(GameScene);
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

        canvas.drawText(bmpFont,
            "V. 0.5.0C", 2, 768-32, -26, -4, false, 0.5, 0.5);
    }


    public dispose = () : any => null;
}
