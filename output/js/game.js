export class GameScene {
    constructor(param, state) {
        // ...
    }
    update(state) {
        // ...
    }
    redraw(canvas) {
        canvas.clear(0.67, 0.67, 0.67);
        canvas.transform.loadIdentity();
        canvas.transform.setView(canvas.width, canvas.height);
        canvas.transform.useTransform();
        canvas.drawText(canvas.getBitmap("font"), "HELLO WORLD!", 16, 16, -26, 0);
    }
    dispose() {
        return null;
    }
}
