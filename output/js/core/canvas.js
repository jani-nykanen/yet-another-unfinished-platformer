import { Bitmap } from "./bitmap.js";
import { Mesh } from "./mesh.js";
import { Shader } from "./shader.js";
import { FragmentSource, VertexSource } from "./shadersource.js";
export var Flip;
(function (Flip) {
    Flip[Flip["None"] = 0] = "None";
    Flip[Flip["Horizontal"] = 1] = "Horizontal";
    Flip[Flip["Vertical"] = 2] = "Vertical";
    Flip[Flip["Both"] = 3] = "Both";
})(Flip || (Flip = {}));
;
export class Canvas {
    constructor(width, height, assets) {
        this.width = width;
        this.height = height;
        this.assets = assets;
        this.createHtml5Canvas(width, height);
        this.initOpenGL();
        window.addEventListener("resize", () => this.resize(window.innerWidth, window.innerHeight));
        this.defaultShader = new Shader(this.glCtx, VertexSource.Default, FragmentSource.Default);
        this.defaultShader.use();
        this.activeShader = this.defaultShader;
        this.rectangle = this.createRectangleMesh();
        this.rectangle.bind(this.glCtx);
        this.activeMesh = this.rectangle;
    }
    createHtml5Canvas(width, height) {
        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);
        this.glCtx = this.canvas.getContext("webgl", { alpha: false, antialias: true });
        this.resize(window.innerWidth, window.innerHeight);
    }
    resize(width, height) {
        let c = this.canvas;
        let mul = Math.min(width / c.width, height / c.height);
        let totalWidth = c.width * mul;
        let totalHeight = c.height * mul;
        let x = width / 2 - totalWidth / 2;
        let y = height / 2 - totalHeight / 2;
        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";
        c.style.width = String(totalWidth | 0) + "px";
        c.style.height = String(totalHeight | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    }
    createRectangleMesh() {
        return new Mesh(this.glCtx, new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]), new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ]), new Uint16Array([
            0, 1, 2,
            2, 3, 0
        ]));
    }
    initOpenGL() {
        let gl = this.glCtx;
        gl.activeTexture(gl.TEXTURE0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.viewport(0, 0, this.width, this.height);
    }
    clear(r = 1, g = 1, b = 1) {
        let gl = this.glCtx;
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearColor(r, g, b, 1.0);
    }
    bindMesh(mesh) {
        if (this.activeMesh == mesh)
            return;
        mesh.bind(this.glCtx);
        this.activeMesh = mesh;
    }
    drawRectangle(x, y, w, h) {
        this.activeShader.setVertexTransform(x, y, w, h);
        this.bindMesh(this.rectangle);
        this.activeMesh.draw(this.glCtx);
    }
    createBitmap(image) {
        return new Bitmap(this.glCtx, image);
    }
}
