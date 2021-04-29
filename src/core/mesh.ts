

export class Mesh {


    private readonly elementCount : number;


    private vertexBuffer : WebGLBuffer;
    private uvBuffer : WebGLBuffer;
    private indexBuffer : WebGLBuffer;


    constructor(gl : WebGLRenderingContext, 
            vertices : Float32Array, 
            textureCoordinates : Float32Array, 
            indices : Uint16Array) {

        this.elementCount = indices.length;

        this.vertexBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 
            vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 
            textureCoordinates, gl.STATIC_DRAW);
                
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
            indices, gl.STATIC_DRAW);
    }


    public bind(gl : WebGLRenderingContext) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }


    public draw(gl : WebGLRenderingContext) {
        
        gl.drawElements(gl.TRIANGLES,
            this.elementCount, 
            gl.UNSIGNED_SHORT, 0);
    }
}
