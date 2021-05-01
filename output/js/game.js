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
        canvas.transform.use();
        canvas.toggleTexturing(false);
        canvas.setDrawColor(0.67, 0.67, 0.67);
        canvas.drawRectangle(0, 0, canvas.width, canvas.height);
        canvas.setDrawColor(1, 0, 0, 1);
        canvas.drawRectangle(128, 128, 256, 256);
        canvas.toggleTexturing();
        canvas.setDrawColor();
        canvas.drawText(canvas.getBitmap("font"), "HELLO WORLD!", 16, 16, -26, 0);
    }
    dispose() {
        return null;
    }
}
