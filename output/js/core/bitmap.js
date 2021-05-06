export class Bitmap {
    constructor(gl, image, data = null, width = 0, height = 0) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (image != null) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            this.width = image.width;
            this.height = image.height;
        }
        else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
            this.width = width;
            this.height = height;
        }
        // Needed for destroying the texture...
        this.gl = gl;
    }
    bind(gl) {
        // We could have used the own reference to gl as well
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
    destroy() {
        this.gl.deleteTexture(this.texture);
    }
}
// For loading non-global bitmaps only, otherwise use AssetPack
export const loadBitmap = (canvas, path, callback) => {
    let image = new Image();
    image.onload = () => {
        callback(canvas.createBitmap(image));
    };
    image.src = path;
};
