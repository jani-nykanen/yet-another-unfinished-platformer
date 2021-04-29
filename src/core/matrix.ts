

export class Matrix3 {


    private m : Float32Array;


    constructor(data = <Float32Array>null) {

        this.m = data != null ? Float32Array.from(data) : (new Float32Array(9)).fill(0);
    }


    static identity = () : Matrix3 => new Matrix3(
        new Float32Array(
            [1, 0, 0,
            0, 1, 0,
            0, 0, 1])
        );


    static translate = (x = 0, y = 0) : Matrix3 => new Matrix3(
        new Float32Array(
            [1, 0, x,
            0, 1, y,
            0, 0, 1])
        );

    
    static scale = (sx = 0, sy = 0) : Matrix3 => new Matrix3(
        new Float32Array(
            [sx, 0, 0,
            0, sy, 0,
            0, 0, 1])
        );
        

    static rotate(angle : number) : Matrix3 {
        
        let s = Math.sin(angle);
        let c = Math.cos(angle);

        return new Matrix3(
            new Float32Array(
                [c, -s, 0,
                s, c, 0,
                0, 0, 1])
            );
    }


    static view = (left : number, right : number, 
        bottom : number, top : number) : Matrix3 => new Matrix3(
        new Float32Array(
            [2.0 / (right - left), 0, -(right + left) / (right - left),
            0, 2.0 / (top - bottom), -(top + bottom) / (top-bottom),
            0, 0, 1])
        );


    static multiply(left : Matrix3, right : Matrix3) {

        let out = new Matrix3();
    
        for (let i = 0; i < 3; ++ i) {
        
            for (let j = 0; j < 3; ++ j) {
        
                for (let k = 0; k < 3; ++ k) {
        
                    out.m[i*3 + j] += left.m[i*3 + k] * right.m[k*3 + j];
                }
            }
        }  
        return out;
    }


    static transpose(A : Matrix3) {

        let out = new Matrix3();

        for (let j = 0; j < 3; ++ j) {
                
            for (let i = 0; i < 3; ++ i) {
                    
                out.m[i*3 + j] = A.m[j*3 + i];
            }
        }
        return out;
    }


    public passToShader(gl : WebGLRenderingContext, uniform : WebGLUniformLocation) {
 
        gl.uniformMatrix3fv(uniform, false, Matrix3.transpose(this).m);        
    }
}

