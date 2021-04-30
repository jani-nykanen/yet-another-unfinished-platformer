import { Matrix3 } from "./matrix.js";
export class Transformations {
    constructor(activeShader) {
        this.model = Matrix3.identity();
        this.modelStack = new Array();
        this.view = Matrix3.identity();
        this.product = Matrix3.identity();
        this.productComputed = true;
        this.activeShader = activeShader;
    }
    computeProduct() {
        if (this.productComputed)
            return;
        this.product = Matrix3.multiply(this.view, this.model);
        this.productComputed = true;
    }
    loadIdentity() {
        this.model = Matrix3.identity();
        this.productComputed = false;
    }
    translate(x = 0, y = 0) {
        this.model = Matrix3.multiply(this.model, Matrix3.translate(x, y));
        this.productComputed = false;
    }
    scale(sx = 0, sy = 0) {
        this.model = Matrix3.multiply(this.model, Matrix3.scale(sx, sy));
        this.productComputed = false;
    }
    rotate(angle = 0) {
        this.model = Matrix3.multiply(this.model, Matrix3.rotate(angle));
        this.productComputed = false;
    }
    setView(width, height) {
        this.view = Matrix3.view(0, width, height, 0);
        this.productComputed = false;
    }
    push() {
        this.modelStack.push(this.model.clone());
    }
    pop() {
        this.model = this.modelStack.pop();
        this.productComputed = false;
    }
    useTransform() {
        this.computeProduct();
        this.activeShader.setTransformMatrix(this.product);
    }
}
