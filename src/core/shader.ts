import { Matrix3 } from "./matrix.js";



export class Shader {


    private shaderProgram : WebGLShader;
    private readonly gl : WebGLRenderingContext;

    private uniformTransform : WebGLUniformLocation;
    private uniformVertexTranslation : WebGLUniformLocation;
    private uniformVertexScale : WebGLUniformLocation;
    private uniformFragmentTranslation : WebGLUniformLocation;
    private uniformFragmentScale : WebGLUniformLocation;
    private uniformFragmentColor : WebGLUniformLocation;
    private uniformTextureSampler : WebGLUniformLocation;
    private uniformFilterSampler : WebGLUniformLocation;
    private uniformFrameSize : WebGLUniformLocation;
    private uniformContrast : WebGLUniformLocation;


    constructor(gl : WebGLRenderingContext, vertexSource : string, fragmentSource : string) {

        this.gl = gl;

        this.shaderProgram = this.buildShader(vertexSource, fragmentSource);
        this.getUniformLocations();
    }   


    private createShader(src : string, type : number) {

        let gl = this.gl
    
        let shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
    
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    
            throw "Shader error:\n" + 
                gl.getShaderInfoLog(shader);
                
        }
    
        return shader;
    }


    private buildShader(vertexSource : string, fragmentSource : string) : WebGLShader {

        let gl = this.gl;
    
        let vertex = this.createShader(vertexSource, 
                gl.VERTEX_SHADER);
        let frag = this.createShader(fragmentSource, 
                gl.FRAGMENT_SHADER);
    
        let program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, frag);
    
        this.bindLocations(program);

        gl.linkProgram(program);
    
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    
            throw "Shader error: " + gl.getProgramInfoLog(program);
        }
        
        return program;
    }

    
    private bindLocations(program : WebGLShader) {

        let gl = this.gl;

        gl.bindAttribLocation(program, 0, "vertexPos");
        gl.bindAttribLocation(program, 1, "vertexUV");
    }


    private getUniformLocations() {

        let gl = this.gl;

        this.uniformTransform = gl.getUniformLocation(this.shaderProgram, "transform");
        this.uniformVertexTranslation = gl.getUniformLocation(this.shaderProgram, "pos");
        this.uniformVertexScale = gl.getUniformLocation(this.shaderProgram, "size");
        this.uniformFragmentTranslation = gl.getUniformLocation(this.shaderProgram, "texPos");
        this.uniformFragmentScale = gl.getUniformLocation(this.shaderProgram, "texSize");
        this.uniformFragmentColor = gl.getUniformLocation(this.shaderProgram, "color");
        this.uniformTextureSampler = gl.getUniformLocation(this.shaderProgram, "texSampler");
        this.uniformFilterSampler = gl.getUniformLocation(this.shaderProgram, "filterSampler");
        this.uniformFrameSize = gl.getUniformLocation(this.shaderProgram, "frameSize");
        this.uniformContrast = gl.getUniformLocation(this.shaderProgram, "contrast");
    }


    public use() {

        let gl = this.gl;
    
        gl.useProgram(this.shaderProgram);
        this.getUniformLocations();

        gl.uniform1i(this.uniformTextureSampler, 0);
        gl.uniform1i(this.uniformFilterSampler, 1);

        this.setVertexTransform(0, 0, 1, 1);
        this.setFragTransform(0, 0, 1, 1);
        this.setTransformMatrix(Matrix3.identity());
        this.setColor(1, 1, 1, 1);
        this.setFrameSize(1, 1);
        this.setContrast(0.0);
    }


    public setVertexTransform(x : number, y : number, w : number, h : number) {

        let gl = this.gl;

        gl.uniform2f(this.uniformVertexTranslation, x, y);
        gl.uniform2f(this.uniformVertexScale, w, h);
    }


    public setFragTransform(x : number, y : number, w : number, h : number) {

        let gl = this.gl;

        gl.uniform2f(this.uniformFragmentTranslation, x, y);
        gl.uniform2f(this.uniformFragmentScale, w, h);
    }


    public setColor(r = 1, g = 1, b = 1, a = 1) {

        let gl = this.gl;
        gl.uniform4f(this.uniformFragmentColor, r, g, b, a);
    }


    public setTransformMatrix(matrix : Matrix3) {

        matrix.passToShader(this.gl, this.uniformTransform);
    }


    public setFrameSize(width : number, height : number) {

        this.gl.uniform2f(this.uniformFrameSize, width, height);
    }


    public setContrast(contrast : number) {

        this.gl.uniform1f(this.uniformContrast, contrast);
    }
}
