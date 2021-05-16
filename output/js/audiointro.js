import { State } from "./core/types.js";
import { GameScene } from "./game.js";
export class AudioIntro {
    constructor(params, state) {
        this.dispose = () => null;
        this.cursorPos = 0;
    }
    update(state) {
        if (state.downPress() || state.upPress()) {
            this.cursorPos = Number(!Boolean(this.cursorPos));
        }
        if (state.getAction("start") == State.Pressed) {
            state.audio.toggle(this.cursorPos == 0);
            // state.audio.playSample(state.getSample("select"), 0.50);
            state.changeScene(GameScene);
        }
    }
    redraw(canvas) {
        canvas.clear();
        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.use();
        canvas.toggleTexturing(false);
        canvas.setDrawColor();
        canvas.drawRectangle(0, 0, canvas.width, canvas.height);
        canvas.toggleTexturing();
        let bmpFont = canvas.getBitmap("font");
        canvas.drawText(bmpFont, "WOULD YOU LIKE\nTO ENABLE AUDIO?\nPRESS ENTER TO\nCONFIRM.", 192, 128, -26, -4, false);
        let str = "";
        if (this.cursorPos == 0) {
            str = "@YES\n NO";
        }
        else {
            str = " YES\n@NO";
        }
        canvas.drawText(bmpFont, str, 256, 400, -26, -4, false, 1, 1);
    }
}
