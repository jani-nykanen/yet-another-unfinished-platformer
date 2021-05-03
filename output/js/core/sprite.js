export class Sprite {
    constructor(w, h) {
        this.getRow = () => this.row;
        this.getColumn = () => this.column;
        this.getTimer = () => this.timer;
        this.width = w;
        this.height = h;
        this.row = 0;
        this.column = 0;
        this.timer = 0.0;
    }
    animate(row, start, end, speed, steps = 1.0) {
        row |= 0;
        start |= 0;
        end |= 0;
        speed |= 0;
        if (start == end) {
            this.timer = 0;
            this.column = start;
            this.row = row;
            return;
        }
        if (this.row != row) {
            this.timer = 0;
            this.column = end > start ? start : end;
            this.row = row;
        }
        if ((start < end && this.column < start) ||
            (start > end && this.column > start)) {
            this.column = start;
        }
        this.timer += steps;
        if (this.timer > speed) {
            // Loop the animation, if end reached
            if (start < end) {
                if (++this.column > end) {
                    this.column = start;
                }
            }
            else {
                if (--this.column < end) {
                    this.column = start;
                }
            }
            this.timer -= speed;
        }
    }
    setFrame(column, row, preserveTimer = false) {
        this.column = column;
        this.row = row;
        if (!preserveTimer)
            this.timer = 0;
    }
    drawFrame(canvas, bmp, column, row, dx, dy, dw = this.width, dh = this.height) {
        canvas.drawBitmapRegion(bmp, this.width * column, this.height * row, this.width, this.height, dx, dy, dw, dh);
    }
    draw(canvas, bmp, dx, dy, dw = this.width, dh = this.height) {
        this.drawFrame(canvas, bmp, this.column, this.row, dx, dy, dw, dh);
    }
}
