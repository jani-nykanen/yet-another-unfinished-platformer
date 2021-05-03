import { Bitmap } from "./bitmap.js";
import { Canvas, Flip } from "./canvas.js";


export class Sprite {


    private row : number;
    private column : number;
    private timer : number;

    public readonly width : number;
    public readonly height : number;


    constructor(w : number, h : number) {

        this.width = w;
        this.height = h;

        this.row = 0;
        this.column = 0;
        this.timer = 0.0;
    }


    public animate(row : number, start : number, end : number, 
        speed : number, steps = 1.0) {

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
        if(this.timer > speed) {
        
            // Loop the animation, if end reached
            if(start < end) {
            
                if (++ this.column > end) {
                    
                    this.column = start;
                }
            }
            else {
            
                if (-- this.column < end) {
                
                    this.column = start;
                }
            }
    
            this.timer -= speed;
        }
    }


    public setFrame(column : number, row : number, preserveTimer = false) {

        this.column = column;
        this.row = row;
        
        if (!preserveTimer)
            this.timer = 0;
    }


    public drawFrame(canvas : Canvas, bmp : Bitmap, 
        column : number, row : number, 
        dx : number, dy : number, dw = this.width, dh = this.height) {
            
        canvas.drawBitmapRegion(bmp, 
            this.width * column, this.height * row, 
            this.width, this.height, 
            dx, dy, dw, dh);
        
    }


    public draw(canvas : Canvas, bmp : Bitmap, 
        dx : number, dy : number, dw = this.width, dh = this.height) {

        this.drawFrame(canvas, bmp, 
            this.column, this.row,
            dx, dy, dw, dh);
    }


    public getRow = () => this.row;
    public getColumn = () => this.column;
    public getTimer = () => this.timer;
}
