export class Matrix3 {
    constructor(data = null) {
        this.m = data != null ? Float32Array.from(data) : (new Float32Array(9)).fill(0);
    }
    static rotate(angle) {
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        return new Matrix3(new Float32Array([c, -s, 0,
            s, c, 0,
            0, 0, 1]));
    }
    static multiply(left, right) {
        let out = new Matrix3();
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                for (let k = 0; k < 3; ++k) {
                    out.m[i * 3 + j] += left.m[i * 3 + k] * right.m[k * 3 + j];
                }
            }
        }
        return out;
    }
    static transpose(A) {
        let out = new Matrix3();
        for (let j = 0; j < 3; ++j) {
            for (let i = 0; i < 3; ++i) {
                out.m[i * 3 + j] = A.m[j * 3 + i];
            }
        }
        return out;
    }
    passToShader(gl, uniform) {
        gl.uniformMatrix3fv(uniform, false, Matrix3.transpose(this).m);
    }
}
Matrix3.identity = () => new Matrix3(new Float32Array([1, 0, 0,
    0, 1, 0,
    0, 0, 1]));
Matrix3.translate = (x = 0, y = 0) => new Matrix3(new Float32Array([1, 0, x,
    0, 1, y,
    0, 0, 1]));
Matrix3.scale = (sx = 0, sy = 0) => new Matrix3(new Float32Array([sx, 0, 0,
    0, sy, 0,
    0, 0, 1]));
Matrix3.view = (left, right, bottom, top) => new Matrix3(new Float32Array([2.0 / (right - left), 0, -(right + left) / (right - left),
    0, 2.0 / (top - bottom), -(top + bottom) / (top - bottom),
    0, 0, 1]));
