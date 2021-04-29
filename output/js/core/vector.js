export class Vector2 {
    constructor(x = 0.0, y = 0.0) {
        this.length = () => Math.hypot(this.x, this.y);
        this.clone = () => new Vector2(this.x, this.y);
        this.x = x;
        this.y = y;
    }
    normalize(forceUnit = false) {
        const EPS = 0.0001;
        let l = this.length();
        if (l < EPS) {
            this.x = forceUnit ? 1 : 0;
            this.y = 0;
            return this.clone();
        }
        this.x /= l;
        this.y /= l;
        return this.clone();
    }
    zeros() {
        this.x = 0;
        this.y = 0;
    }
    scalarMultiply(s) {
        this.x *= s;
        this.y *= s;
    }
}
Vector2.dot = (u, v) => u.x * v.x + u.y * v.y;
Vector2.normalize = (v, forceUnit = false) => v.clone().normalize(forceUnit);
Vector2.scalarMultiply = (v, s) => new Vector2(v.x * s, v.y * s);
Vector2.distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
Vector2.direction = (a, b) => (new Vector2(b.x - a.x, b.y - a.y)).normalize(true);
Vector2.add = (a, b) => new Vector2(a.x + b.x, a.y + b.y);
export class Rect {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        this.clone = () => new Rect(this.x, this.y, this.w, this.h);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
export class RGBA {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.clone = () => new RGBA(this.r, this.g, this.b, this.a);
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
