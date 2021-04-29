export class GameScene {
    constructor(param, state) {
        // ...
    }
    update(state) {
        // ...
    }
    redraw(canvas) {
        canvas.clear(0.67, 0.67, 0.67);
        canvas.drawRectangle(0, 0, 1, 1);
    }
    dispose() {
        return null;
    }
}
