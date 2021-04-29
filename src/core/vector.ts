

export class Vector2 {


    public x : number;
    public y : number


	constructor(x = 0.0, y = 0.0) {
		
		this.x = x;
        this.y = y;
	}

	
	public length = () : number => Math.hypot(this.x, this.y);
	
	
	public normalize(forceUnit = false) : Vector2 {
		
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
	
	
	public clone = () : Vector2 => new Vector2(this.x, this.y);


	public zeros() {

        this.x = 0;
        this.y = 0;
	}


	public scalarMultiply(s : number) {

		this.x *= s;
		this.y *= s;
	}


	static dot = (u : Vector2, v : Vector2) : number => u.x*v.x + u.y*v.y;
	

	static normalize = (v : Vector2, forceUnit = false) : Vector2 => v.clone().normalize(forceUnit);
	

	static scalarMultiply = (v : Vector2, s : number) : Vector2 => new Vector2(v.x * s, v.y * s);
	

	static distance = (a : Vector2, b : Vector2) : number => Math.hypot(a.x - b.x, a.y - b.y);


	static direction = (a : Vector2, b : Vector2) : Vector2 => (new Vector2(b.x - a.x, b.y - a.y)).normalize(true);
	

	static add = (a : Vector2, b : Vector2) : Vector2 => new Vector2(a.x + b.x, a.y + b.y);
}


export class Rect {

	public x : number;
	public y : number;
	public w : number;
	public h : number;

	constructor(x = 0, y = 0, w = 0, h = 0) {

		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}


	public clone = () : Rect => new Rect(this.x, this.y, this.w, this.h);
}


export class RGBA {

	public r : number;
	public g : number;
	public b : number;
	public a : number;


	constructor(r = 0, g = 0, b = 0, a = 1) {

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}


	public clone = () : RGBA => new RGBA(this.r, this.g, this.b, this.a);
}
