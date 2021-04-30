import { Matrix3 } from "./matrix.js";
import { Shader } from "./shader.js";



export class Transformations {
    

    private model : Matrix3;
    private modelStack : Array<Matrix3>;
    private view : Matrix3;
    private product : Matrix3;
    private productComputed : boolean;

    private activeShader : Shader;


    constructor(activeShader : Shader) {

        this.model = Matrix3.identity();
        this.modelStack = new Array<Matrix3> ();
        this.view = Matrix3.identity();
        this.product = Matrix3.identity();
    
        this.productComputed = true;

        this.activeShader = activeShader;
    }


    private computeProduct() {

        if (this.productComputed) return;

        this.product = Matrix3.multiply(this.view, this.model);
        this.productComputed = true;
    }


    public setActiveShader(shader : Shader) {

        this.activeShader = shader;
    }


    public loadIdentity() {

        this.model = Matrix3.identity();
        this.productComputed = false;
    }


    public translate(x = 0, y = 0) {

        this.model = Matrix3.multiply(
            this.model,
            Matrix3.translate(x, y));
        this.productComputed = false;
    }


    public scale(sx = 0, sy = 0) {

        this.model = Matrix3.multiply(
            this.model,
            Matrix3.scale(sx, sy));
        this.productComputed = false;
    }


    public rotate(angle = 0) {

        this.model = Matrix3.multiply(
            this.model,
            Matrix3.rotate(angle));
        this.productComputed = false;
    }


    public setView(width : number, height : number) {

        this.view = Matrix3.view(0, width, height, 0);
        this.productComputed = false;
    }


    public push() {

        this.modelStack.push(this.model.clone());
    }


    public pop() {

        this.model = this.modelStack.pop();
        this.productComputed = false;
    }


    public use() {

        this.computeProduct();
        this.activeShader.setTransformMatrix(this.product);
    }
}
