import { AssetManager } from "./assets.js";
import { Bitmap } from "./bitmap.js";
import { FrameState } from "./core.js";
import { Mesh } from "./mesh.js";
import { Shader } from "./shader.js";
import { FragmentSource, VertexSource } from "./shadersource.js";
import { Sprite } from "./sprite.js";
import { Transformations } from "./transformations.js";


export enum Flip {

    None = 0,
    Horizontal = 1,
    Vertical = 2,
    Both = 3,
};


export class Canvas {

    public readonly width : number;
    public readonly height : number;

    private assets : AssetManager;

    private canvas : HTMLCanvasElement;
    private glCtx : WebGLRenderingContext;

    private defaultShader : Shader;
    private untexturedShader : Shader;
    private activeShader : Shader;

    private rectangle : Mesh;
    private whiteFilter : Bitmap;

    private activeMesh : Mesh;
    private activeTexture : Bitmap;

    private contrast : number;

    private shakeTimer : number;
    private shakeAmount : number;

    public readonly transform : Transformations;


    constructor(width : number, height : number, assets : AssetManager) {

        this.width = width;
        this.height = height;    

        this.assets = assets;

        this.createHtml5Canvas(width, height);
        this.initOpenGL();

        window.addEventListener("resize", () => this.resize(
            window.innerWidth, window.innerHeight));

        this.untexturedShader = new Shader(
            this.glCtx, VertexSource.NoTexture, FragmentSource.NoTexture);
        this.defaultShader = new Shader(
            this.glCtx, VertexSource.Default, FragmentSource.Default);
        this.defaultShader.use();
        this.activeShader = this.defaultShader;
        this.activeShader.setFrameSize(this.width, this.height);

        this.rectangle = this.createRectangleMesh();
        this.rectangle.bind(this.glCtx);
        this.activeMesh = this.rectangle;

        this.transform = new Transformations(this.activeShader);

        this.activeTexture = null;

        this.whiteFilter = new Bitmap(this.glCtx, null, 
            new Uint8Array([255, 255, 255, 255]), 1, 1);
        this.setFilterTexture(this.whiteFilter);

        this.contrast = 0.0;

        this.shakeTimer = 0;
        this.shakeAmount = 0;
    }


    private createHtml5Canvas(width : number, height : number) {

        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", 
            "position: absolute; top: 0; left: 0; z-index: -1;");

        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;

        this.canvas.setAttribute(
            "style", 
            "position: absolute; top: 0; left: 0; z-index: -1;");
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        this.glCtx = this.canvas.getContext("webgl", {alpha: false, antialias: true});

        this.resize(window.innerWidth, window.innerHeight);
        
    }


    private resize(width : number, height : number) {

        let c = this.canvas;

        let mul = Math.min(
            width / c.width, 
            height / c.height);

        let totalWidth = c.width * mul;
        let totalHeight = c.height * mul;
        let x = width/2 - totalWidth/2;
        let y = height/2 - totalHeight/2;

        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";

        c.style.width = String(totalWidth | 0) + "px";
        c.style.height = String(totalHeight | 0) + "px";
        
        c.style.top = top;
        c.style.left = left;
    }


    private createRectangleMesh() : Mesh {

        return new Mesh(
            this.glCtx,
            new Float32Array([
                0, 0,
                1, 0, 
                1, 1,
                0, 1,
            ]),
            new Float32Array([
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ]),
            new Uint16Array([
                0, 1, 2, 
                2, 3, 0
            ]),
        );
    }


    private initOpenGL() {

        let gl = this.glCtx;

        gl.activeTexture(gl.TEXTURE0);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, 
            gl.ONE_MINUS_SRC_ALPHA, gl.ONE, 
            gl.ONE_MINUS_SRC_ALPHA);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);

        gl.viewport(0, 0, this.width, this.height);
    }


    public clear(r = 1, g = 1, b = 1) {

        let gl = this.glCtx;

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearColor(r, g, b, 1.0);
    }


    public bindMesh(mesh : Mesh) {

        if (this.activeMesh == mesh) return;

        mesh.bind(this.glCtx);
        this.activeMesh = mesh;
    }


    public bindTexture(bmp : Bitmap) {

        if (this.activeTexture == bmp) return;

        bmp.bind(this.glCtx);
        this.activeTexture = bmp;
    }


    public resetVertexAndFragmentTransforms() {

        this.activeShader.setVertexTransform(0, 0, 1, 1);
        this.activeShader.setFragTransform(0, 0, 1, 1);
    }


    public toggleTexturing(state = true) {

        let newShader = state ? this.defaultShader : this.untexturedShader;

        if (newShader == this.activeShader) return;

        this.activeShader = newShader;
        this.activeShader.use();

        this.transform.setActiveShader(this.activeShader);
        this.transform.use();

        this.activeShader.setFrameSize(this.width, this.height);
        this.activeShader.setContrast(this.contrast);
    }


    public setDrawColor(r = 1, g = 1, b = 1, a = 1) {

        this.activeShader.setColor(r, g, b, a);
    }


    public drawRectangle(x : number, y : number, w : number, h : number) {

        this.activeShader.setVertexTransform(x, y, w, h);

        this.bindMesh(this.rectangle);
        this.activeMesh.draw(this.glCtx);
    }



    public drawBitmap(bmp : Bitmap, 
        dx : number, dy : number, dw = bmp.width, dh = bmp.height) {

        this.drawBitmapRegion(bmp, 0, 0, bmp.width, bmp.height,
            dx, dy, dw, dh);
    }


    public drawBitmapRegion(bmp : Bitmap, 
        sx : number, sy : number, sw : number, sh : number,
        dx : number, dy : number, dw = sw, dh = sh) {

        this.activeShader.setVertexTransform(dx, dy, dw, dh);
        this.activeShader.setFragTransform(
            sx / bmp.width, sy / bmp.height, 
            sw / bmp.width, sh / bmp.height);

        this.bindMesh(this.rectangle);
        this.bindTexture(bmp);

        this.activeMesh.draw(this.glCtx);
    }


    public drawText(font : Bitmap, str : string, 
        dx : number, dy : number, 
        xoff = 0.0, yoff = 0.0, center = false, scalex = 1, scaley = 1,
        wave = 0.0, amplitude = 0.0, period = 0.0) {

        let cw = (font.width / 16) | 0;
        let ch = cw;

        let x = dx;
        let y = dy;
        let chr : number;

        let yoffset : number;

        if (center) {

            dx -= ((str.length+1) * (cw + xoff) * scalex)/ 2.0 ;
            x = dx;
        }

        for (let i = 0; i < str.length; ++ i) {

            chr = str.charCodeAt(i);
            if (chr == '\n'.charCodeAt(0)) {

                x = dx;
                y += (ch + yoff) * scaley;
                continue;
            }

            yoffset = Math.sin(wave + i * period) * amplitude;

            this.drawBitmapRegion(
                font, 
                (chr % 16) * cw, ((chr/16)|0) * ch,
                cw, ch, 
                x, y + yoffset, 
                cw * scalex, ch * scaley);

            x += (cw + xoff) * scalex;
        }
    }


    public drawSpriteFrame(spr : Sprite, bmp : Bitmap, 
        column : number, row : number,
        dx : number, dy : number, 
        dw = spr.width, dh = spr.height, flip = Flip.None) {

        if (flip == Flip.Horizontal) {

            dx += dw;
            dw *= -1;
        }
        if (flip == Flip.Vertical) {

            dy += dh;
            dh *= -1;
        }

        spr.drawFrame(this, bmp, column, row, dx, dy, dw, dh);
    }


    public drawSprite(spr : Sprite, bmp : Bitmap, dx : number, dy : number, 
        dw = spr.width, dh = spr.height, flip = Flip.None) {

        if (flip == Flip.Horizontal) {
            
            dx += dw;
            dw *= -1;
        }
        if (flip == Flip.Vertical) {

            dy += dh;
            dh *= -1;
        }

        spr.draw(this, bmp, dx, dy, dw, dh);
    }


    public createBitmap(image : HTMLImageElement) : Bitmap {

        return new Bitmap(this.glCtx, image);
    }
    

    public getBitmap(name : string) :Bitmap {

        return this.assets.getBitmap(name);
    }


    public setFilterTexture(bmp : Bitmap) {

        let gl = this.glCtx;

        if (bmp == null)
            bmp = this.whiteFilter;

        gl.activeTexture(gl.TEXTURE1);
        bmp.bind(gl);
        gl.activeTexture(gl.TEXTURE0);
    }


    public setContrast(constrast : number) {

        this.activeShader.setContrast(constrast);
        this.contrast = constrast;
    }


    public update(state : FrameState) {

        if (this.shakeTimer > 0) {

            this.shakeTimer -= state.step;
        }
    }


    public shake(shakeAmount : number, shakeTime : number) {

        this.shakeAmount = shakeAmount;
        this.shakeTimer = shakeTime;
    }


    public applyShake() {

        if (this.shakeTimer <= 0) return;

        this.transform.translate(
            -this.shakeAmount + Math.random() * this.shakeAmount * 2, 
            -this.shakeAmount + Math.random() * this.shakeAmount * 2);
    }


    public isShaking = () : boolean => this.shakeTimer > 0;
}
