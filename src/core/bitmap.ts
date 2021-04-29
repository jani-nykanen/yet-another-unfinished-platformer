

export class Bitmap {

    private texture : WebGLTexture;

    public readonly width : number;
    public readonly height : number;


    constructor(gl : WebGLRenderingContext, image : HTMLImageElement) {

        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
        gl.texImage2D(gl.TEXTURE_2D, 
            0, gl.RGBA, gl.RGBA, 
            gl.UNSIGNED_BYTE, image);

        this.width = image.width;
        this.height = image.height;
    }


    public bind(gl : WebGLRenderingContext) {

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
}
