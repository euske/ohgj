/// <reference path="utils.ts" />


//  Vec2
//
class Vec2 {

    x: number;
    y: number;

    constructor(x=0, y=0) {
	this.x = x;
	this.y = y;
    }

    toString() {
	return '('+this.x+', '+this.y+')';
    }

    copy() {
	return new Vec2(this.x, this.y);
    }
    
    equals(p: Vec2) {
	return (this.x == p.x && this.y == p.y);
    }
    
    isZero() {
	return (this.x == 0 && this.y == 0);
    }
    
    len2() {
	return (this.x*this.x + this.y*this.y);
    }
    
    len() {
	return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    
    sign() {
	return new Vec2(sign(this.x), sign(this.y));
    }
    
    add(v: Vec2) {
	return new Vec2(this.x+v.x, this.y+v.y);
    }
    
    sub(v: Vec2) {
	return new Vec2(this.x-v.x, this.y-v.y);
    }
    
    scale(n: number) {
	return new Vec2(this.x*n, this.y*n);
    }
    
    distance(v: Vec2) {
	return this.sub(v).len();
    }

    clamp(bounds: Vec2) {
	return new Vec2(
	    clamp(-bounds.x, this.x, +bounds.x),
	    clamp(-bounds.y, this.y, +bounds.y));
    }
    
    move(dx: number, dy: number) {
	return new Vec2(this.x+dx, this.y+dy);
    }

    interpolate(v: Vec2, t: number) {
	return new Vec2((1.0-t)*this.x+t*v.x, (1.0-t)*this.y+t*v.y);
    }
    
    // rotate: rotates a vector clockwise by d radian.
    rotate(d: number) {
	let s = Math.sin(d);
	let c = Math.cos(d);
	return new Vec2(this.x*c-this.y*s, this.x*s+this.y*c);
    }
    
    rot90(d: number) {
	d = d % 4;
	d = (0 <= d)? d : d+4;
	switch (d) {
	case 1:
	    return new Vec2(-this.y, this.x);
	case 2:
	    return new Vec2(-this.x, -this.y);
	case 3:
	    return new Vec2(this.y, -this.x);
	default:
	    return this.copy();
	}
    }
    
    expand(dw: number, dh: number, vx=0, vy=0) {
	return new Rect(this.x, this.y).expand(dw, dh, vx, vy);
    }
    
}


//  Vec3
//
class Vec3 {

    x: number;
    y: number;
    z: number;

    constructor(x=0, y=0, z=0) {
	this.x = x;
	this.y = y;
	this.z = z;
    }
    
    toString() {
	return '('+this.x+', '+this.y+', '+this.z+')';
    }
    
    copy() {
	return new Vec3(this.x, this.y, this.z);
    }
    
    equals(p: Vec3) {
	return (this.x == p.x && this.y == p.y && this.z == p.z);
    }
    
    isZero() {
	return (this.x == 0 && this.y == 0 && this.z == 0);
    }
    
    len2() {
	return (this.x*this.x + this.y*this.y + this.z*this.z);
    }
    
    len() {
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }
    
    sign() {
	return new Vec3(sign(this.x), sign(this.y), sign(this.z));
    }
    
    add(v: Vec3) {
	return new Vec3(this.x+v.x, this.y+v.y, this.z+v.z);
    }
    
    sub(v: Vec3) {
	return new Vec3(this.x-v.x, this.y-v.y, this.z-v.z);
    }
    
    scale(v: number) {
	return new Vec3(this.x*v, this.y*v, this.z*v);
    }
    
    distance(v: Vec3) {
	return this.sub(v).len();
    }
    
    clamp(bounds: Vec3) {
	return new Vec3(
	    clamp(-bounds.x, this.x, +bounds.x),
	    clamp(-bounds.y, this.y, +bounds.y),
	    clamp(-bounds.z, this.z, +bounds.z));
    }
    
    move(dx: number, dy: number, dz: number) {
	return new Vec3(this.x+dx, this.y+dy, this.z+dz);
    }

    interpolate(v: Vec3, t: number) {
	return new Vec3(
	    (1.0-t)*this.x+t*v.x,
	    (1.0-t)*this.y+t*v.y,
	    (1.0-t)*this.z+t*v.z);
    }
    
}


//  Collider
//
interface Collider {
    contact(v: Vec2, shape: Shape): Vec2;
}    


//  AALine
//  Axis-aligned line
//
class AALine implements Collider {

    x0: number;
    y0: number;
    x1: number;
    y1: number;

    constructor(x0: number, y0: number, x1: number, y1: number) {
	this.x0 = x0;	
	this.y0 = y0;	
	this.x1 = x1;	
	this.y1 = y1;	
    }
    
    center() {
	return new Vec2((this.x0+this.x1)/2, (this.y0+this.y1)/2);
    }
    
    contact(v: Vec2, shape: Shape): Vec2 {
	if (shape instanceof Rect) {
	    return this.contactRect(v, shape);
	} else if (shape instanceof Circle) {
	    return this.contactCircle(v, shape);
	} else {
	    return null;
	}
    }

    contactRect(v: Vec2, rect: Rect) {
	if (this.y0 == this.y1) {
	    return this.contactRectH(v, rect, this.y0);
	} else if (this.x0 == this.x1) {
	    return this.contactRectV(v, rect, this.x0);
	} else {
	    return null;
	}
    }
	
    contactRectH(v: Vec2, rect: Rect, y: number) {
	let y0 = rect.y;
	let y1 = y0+rect.height;
	let dy: number;
	if (y <= y0 && y0+v.y < y) {
	    dy = y-y0;
	} else if (y1 <= y && y < y1+v.y) {
	    dy = y-y1;
	} else {
	    return v;
	}
	let dx = v.x*dy / v.y;
	let x0 = rect.x + dx;
	let x1 = x0+rect.width;
	if (x1 < this.x0 || this.x1 < x0 ||
	    (x1 == this.x0 && v.x <= 0) ||
	    (x0 == this.x1 && 0 <= v.x)) {
	    return v;
	}
	return new Vec2(dx, dy);
    }
    
    contactRectV(v: Vec2, rect: Rect, x: number) {
	let x0 = rect.x;
	let x1 = x0+rect.width;
	let dx: number;
	if (x <= x0 && x0+v.x < x) {
	    dx = x-x0;
	} else if (x1 <= x && x < x1+v.x) {
	    dx = x-x1;
	} else {
	    return v;
	}
	let dy = v.y*dx / v.x;
	let y0 = rect.y + dy;
	let y1 = y0+rect.height;
	if (y1 < this.y0 || this.y1 < y0 ||
	    (y1 == this.y0 && v.y <= 0) ||
	    (y0 == this.y1 && 0 <= v.y)) {
	    return v;
	}
	return new Vec2(dx, dy);
    }

    contactCircle(v: Vec2, circle: Circle) {
	if (this.y0 == this.y1) {
	    return this.contactCircleH(v, circle, this.y0);
	} else if (this.x0 == this.x1) {
	    return this.contactCircleV(v, circle, this.x0);
	} else {
	    return null;
	}
    }
	
    contactCircleV(v: Vec2, circle: Circle, x: number) {
	let y = circle.center.y + v.y;
	if (this.y0 < y && y < this.y1) {
	    x += (v.x < 0)? circle.radius : -circle.radius;
	    let dx = x - circle.center.x;
	    let dt = dx / v.x;
	    if (0 <= dt && dt <= 1) {
		return new Vec2(dx, v.y*dt);
	    }
	}
	return v;
    }
    
    contactCircleH(v: Vec2, circle: Circle, y: number) {
	let x = circle.center.x + v.x;
	if (this.x0 < x && x < this.x1) {
	    y += (v.y < 0)? circle.radius : -circle.radius;
	    let dy = y - circle.center.y;
	    let dt = dy / v.y;
	    if (0 <= dt && dt <= 1) {
		return new Vec2(v.x*dt, dy);
	    }
	}
	return v;
    }
}


//  Shape
//
interface Shape extends Collider {
    copy<T extends Shape>(): T;
    move<T extends Shape>(dx: number, dy: number): T;
    add<T extends Shape>(v: Vec2): T;
    sub<T extends Shape>(v: Vec2): T;
    isZero(): boolean;
    equals<T extends Shape>(shape: T): boolean;
    overlaps(shape: Shape): boolean;
    containsPt(p: Vec2): boolean;
    rndpt(): Vec2;
    getAABB(): Rect;
}


//  Rect
//
class Rect implements Shape {

    x: number;
    y: number;
    width: number;
    height: number;
    
    constructor(x=0, y=0, width=0, height=0) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
    }
    
    toString() {
	return '('+this.x+', '+this.y+', '+this.width+', '+this.height+')';
    }
    
    copy() {
	return new Rect(this.x, this.y, this.width, this.height);
    }
    
    equals(rect: Rect) {
	return (this.x == rect.x && this.y == rect.y &&
		this.width == rect.width && this.height == rect.height);
    }
    
    isZero() {
	return (this.width == 0 && this.height == 0);
    }
    
    right() {
	return this.x+this.width;
    }
    bottom() {
	return this.y+this.height;
    }
    centerx() {
	return this.x+this.width/2;
    }
    centery() {
	return this.y+this.height/2;
    }
    center() {
	return new Vec2(this.x+this.width/2, this.y+this.height/2);
    }

    edge(vx: number, vy: number) {
	if (vx < 0) {
	    return new AALine(this.x, this.y, this.x, this.y+this.height);
	} else if (0 < vx) {
	    return new AALine(this.x+this.width, this.y, this.x+this.width, this.y+this.height);
	} else if (vy < 0) {
	    return new AALine(this.x, this.y, this.x+this.width, this.y);
	} else if (0 < vy) {
	    return new AALine(this.x, this.y+this.height, this.x+this.width, this.y+this.height);
	} else {
	    return null;
	}
    }
    
    move(dx: number, dy: number) {
	return new Rect(this.x+dx, this.y+dy, this.width, this.height);  
    }
    
    add(v: Vec2) {
	return new Rect(this.x+v.x, this.y+v.y, this.width, this.height);  
    }
    
    sub(v: Vec2) {
	return new Rect(this.x-v.x, this.y-v.y, this.width, this.height);  
    }
    
    inflate(dw: number, dh: number) {
	return new Rect(this.x-dw, this.y-dh, this.width+dw*2, this.height+dh*2);
    }
    
    anchor(vx=0, vy=0) {
	let x: number, y: number;
	if (vx < 0) {
	    x = this.x;
	} else if (0 < vx) {
	    x = this.x+this.width;
	} else {
	    x = this.x+this.width/2;
	}
	if (vy < 0) {
	    y = this.y;
	} else if (0 < vy) {
	    y = this.y+this.height;
	} else {
	    y = this.y+this.height/2;
	}
	return new Vec2(x, y);
    }
    
    expand(dw: number, dh: number, vx=0, vy=0) {
	let x: number, y: number;
	if (0 < vx) {
	    x = this.x;
	} else if (vx < 0) {
	    x = this.x-dw;
	} else {
	    x = this.x-dw/2;
	}
	if (0 < vy) {
	    y = this.y;
	} else if (vy < 0) {
	    y = this.y-dh;
	} else {
	    y = this.y-dh/2;
	}
	return new Rect(x, y, this.width+dw, this.height+dh);
    }
    
    resize(w: number, h: number, vx=0, vy=0) {
	let x: number, y: number;
	if (0 < vx) {
	    x = this.x;
	} else if (vx < 0) {
	    x = this.x+this.width-w;
	} else {
	    x = this.x+(this.width-w)/2;
	}
	if (0 < vy) {
	    y = this.y;
	} else if (vy < 0) {
	    y = this.y+this.height-h;
	} else {
	    y = this.y+(this.height-h)/2;
	}
	return new Rect(x, y, w, h);
    }
    
    xdistance(rect: Rect) {
	return Math.max(rect.x-(this.x+this.width),
			this.x-(rect.x+rect.width));
    }
    ydistance(rect: Rect) {
	return Math.max(rect.y-(this.y+this.height),
			this.y-(rect.y+rect.height));
    }
    
    containsPt(p: Vec2) {
	return (this.x <= p.x && this.y <= p.y &&
		p.x < this.x+this.width && p.y < this.y+this.height);
    }
    
    containsRect(rect: Rect) {
	return (this.x <= rect.x &&
		this.y <= rect.y &&
		rect.x+rect.width <= this.x+this.width &&
		rect.y+rect.height <= this.y+this.height);
    }
    
    overlapsRect(rect: Rect) {
	return (this.xdistance(rect) < 0 &&
		this.ydistance(rect) < 0);
    }

    overlapsCircle(circle: Circle) {
	let x0 = this.x;
	let x1 = this.right();
	let y0 = this.y;
	let y1 = this.bottom();
	let cx = circle.center.x;
	let cy = circle.center.y;
	let r = circle.radius;
	return (circle.containsPt(new Vec2(x0, y0)) ||
		circle.containsPt(new Vec2(x1, y0)) ||
		circle.containsPt(new Vec2(x0, y1)) ||
		circle.containsPt(new Vec2(x1, y1)) ||
		((x0 < cx && cx < x1) &&
		 (Math.abs(y0-cy) < r ||
		  Math.abs(y1-cy) < r)) ||
		((y0 < cy && cy < y1) &&
		 (Math.abs(x0-cx) < r ||
		  Math.abs(x1-cx) < r))
	       );
    }

    union(rect: Rect) {
	let x0 = Math.min(this.x, rect.x);
	let y0 = Math.min(this.y, rect.y);
	let x1 = Math.max(this.x+this.width, rect.x+rect.width);
	let y1 = Math.max(this.y+this.height, rect.y+rect.height);
	return new Rect(x0, y0, x1-x0, y1-y0);
    }
    
    intersection(rect: Rect) {
	let x0 = Math.max(this.x, rect.x);
	let y0 = Math.max(this.y, rect.y);
	let x1 = Math.min(this.x+this.width, rect.x+rect.width);
	let y1 = Math.min(this.y+this.height, rect.y+rect.height);
	return new Rect(x0, y0, x1-x0, y1-y0);
    }
    
    clamp(bounds: Rect) {
	let x = ((bounds.width < this.width)? bounds.centerx() :
		 clamp(bounds.x, this.x, bounds.x+bounds.width-this.width));
	let y = ((bounds.height < this.height)? bounds.centery() :
		 clamp(bounds.y, this.y, bounds.y+bounds.height-this.height));
	return new Rect(x, y, this.width, this.height);
    }
    
    rndpt() {
	return new Vec2(this.x+frnd(this.width),
			this.y+frnd(this.height));
    }

    rndptEdge() {
	let v = frnd(this.width*2 + this.height*2);
	if (v < this.width) {
	    return new Vec2(v, this.y);
	}
	v -= this.width;
	if (v < this.width) {
	    return new Vec2(v, this.y+this.height);
	}
	v -= this.width;
	if (v < this.height) {
	    return new Vec2(this.x, v);
	}
	// assert(v <= this.height);
	return new Vec2(this.x+this.width, v);
    }
    
    modpt(p: Vec2) {
	return new Vec2(this.x+fmod(p.x-this.x, this.width),
			this.y+fmod(p.y-this.y, this.height));
    }
    
    contactRect(v: Vec2, rect: Rect) {
	if (this.overlapsRect(rect)) {
	    return new Vec2();
	}
	if (0 < v.x) {
	    v = this.edge(-1, 0).contactRect(v, rect);
	} else if (v.x < 0) {
	    v = this.edge(+1, 0).contactRect(v, rect);
	}
	if (0 < v.y) {
	    v = this.edge(0, -1).contactRect(v, rect);
	} else if (v.y < 0) {
	    v = this.edge(0, +1).contactRect(v, rect);
	}
	return v;
    }

    contactCircle(v: Vec2, circle: Circle) {
	if (this.overlapsCircle(circle)) {
	    return new Vec2();
	}

	if (0 < v.x) {
	    v = this.edge(-1, 0).contactCircle(v, circle);
	} else if (v.x < 0) {
	    v = this.edge(+1, 0).contactCircle(v, circle);
	}
	if (0 < v.y) {
	    v = this.edge(0, -1).contactCircle(v, circle);
	} else if (v.y < 0) {
	    v = this.edge(0, +1).contactCircle(v, circle);
	}

	if (circle.center.x < this.x || circle.center.y < this.y) {
	    v = circle.contactCircle(v, new Circle(new Vec2(this.x, this.y)));
	}
	if (this.right() < circle.center.x || circle.center.y < this.y) {
	    v = circle.contactCircle(v, new Circle(new Vec2(this.right(), this.y)));
	}
	if (circle.center.x < this.x || this.bottom() < circle.center.y) {
	    v = circle.contactCircle(v, new Circle(new Vec2(this.x, this.bottom())));
	}
	if (this.right() < circle.center.x || this.bottom() < circle.center.y) {
	    v = circle.contactCircle(v, new Circle(new Vec2(this.right(), this.bottom())));
	}
	return v;
    }

    boundRect(v: Vec2, rect: Rect) {
	if (!this.overlapsRect(rect)) {
	    return new Vec2();
	}
	let x = (v.x < 0)? this.x : this.x+this.width;
	v = new AALine(x, -Infinity, x, +Infinity).contactRect(v, rect);
	let y = (v.y < 0)? this.y : this.y+this.height;
	v = new AALine(-Infinity, y, +Infinity, y).contactRect(v, rect);
	return v;
    }

    overlaps(shape: Shape): boolean {
	if (shape instanceof Rect) {
	    return this.overlapsRect(shape);
	} else if (shape instanceof Circle) {
	    return this.overlapsCircle(shape);
	} else {
	    return false;
	}
    }

    contact(v: Vec2, shape: Shape): Vec2 {
	if (shape instanceof Rect) {
	    return this.contactRect(v, shape);
	} else if (shape instanceof Circle) {
	    return this.contactCircle(v, shape);
	} else {
	    return null;
	}
    }

    getAABB() {
	return this;
    }
}


//  Circle
//
const EPSILON = 0.0001;
class Circle implements Shape {

    center: Vec2;
    radius: number;

    constructor(center: Vec2, radius=0) {
	this.center = center;
	this.radius = radius;
    }

    toString() {
	return 'Circle(center='+this.center+', radius='+this.radius+')';
    }
    
    copy() {
	return new Circle(this.center.copy(), this.radius);
    }
    
    equals(circle: Circle) {
	return (this.center.equals(circle.center) &&
		this.radius == circle.radius);
    }
    
    isZero() {
	return this.radius == 0;
    }
    
    move(dx: number, dy: number) {
	return new Circle(this.center.move(dx, dy), this.radius);  
    }
    
    add(v: Vec2) {
	return new Circle(this.center.add(v), this.radius);
    }
    
    sub(v: Vec2) {
	return new Circle(this.center.sub(v), this.radius);
    }
    
    inflate(dr: number) {
	return new Circle(this.center, this.radius+dr);
    }
    
    resize(radius: number) {
	return new Circle(this.center, radius);
    }

    distance(p: Vec2) {
	return this.center.sub(p).len();
    }

    containsPt(p: Vec2) {
	return this.distance(p) < this.radius;
    }

    containsCircle(circle: Circle) {
	let d = this.distance(circle.center);
	return d+circle.radius < this.radius;
    }

    overlapsCircle(circle: Circle) {
	let d = this.distance(circle.center);
	return d < this.radius+circle.radius;
    }
    
    overlapsRect(rect: Rect) {
	return rect.overlapsCircle(this);
    }

    clamp(bounds: Rect) {
	let x = ((bounds.width < this.radius)? bounds.centerx() :
		 clamp(bounds.x, this.center.x, bounds.x+bounds.width-this.radius));
	let y = ((bounds.height < this.radius)? bounds.centery() :
		 clamp(bounds.y, this.center.y, bounds.y+bounds.height-this.radius));
	return new Circle(new Vec2(x, y), this.radius);
    }
    
    rndpt() {
	let r = frnd(this.radius);
	let t = frnd(Math.PI*2);
	return new Vec2(this.center.x+r*Math.cos(t),
			this.center.y+r*Math.sin(t));
    }
    
    contactCircle(v: Vec2, circle: Circle) {
	if (this.overlapsCircle(circle)) {
	    return new Vec2();
	}
	
	let d = circle.center.sub(this.center);
	let dv = d.x*v.x + d.y*v.y;
	let v2 = v.len2();
	let d2 = d.len2();
	let R = (this.radius + circle.radius);
	// |d - t*v|^2 = (r1+r2)^2
	// t = { (d*v) + sqrt((d*v)^2 - v^2(d^2-R^2)) } / v^2
	let s = dv*dv - v2*(d2-R*R);
	if (0 < s) {
	    let t = (dv - Math.sqrt(s)) / v2;
	    if (t < -EPSILON) {
		;
	    } else if (t < EPSILON) {
		v = new Vec2();
	    } else if (t < 1+EPSILON) {
		v = v.scale(t/(1+EPSILON));
	    }
	}
	return v;
    }

    overlaps(shape: Shape): boolean {
	if (shape instanceof Circle) {
	    return this.overlapsCircle(shape);
	} else if (shape instanceof Rect) {
	    return this.overlapsRect(shape);
	} else {
	    return false;
	}
    }    

    contact(v: Vec2, shape: Shape): Vec2 {
	if (shape instanceof Circle) {
	    return this.contactCircle(v, shape);
	} else if (shape instanceof Rect) {
	    return shape.contactCircle(v.scale(-1), this).scale(-1);
	} else {
	    return null;
	}
    }    

    getAABB() {
	return new Rect(
	    this.center.x-this.radius,
	    this.center.y-this.radius,
	    this.radius*2, this.radius*2);
    }
}


//  AAPlane
//  Axis-aligned plane
//
class AAPlane {

    p0: Vec3;
    p1: Vec3;
    
    constructor(p0: Vec3, p1: Vec3) {
	this.p0 = p0;
	this.p1 = p1;
    }

    contactBox(v: Vec3, box: Box) {
	if (this.p0.x == this.p1.x) {
	    return this.contactBoxYZ(v, box, this.p0.x);
	} else if (this.p0.y == this.p1.y) {
	    return this.contactBoxZX(v, box, this.p0.y);
	} else if (this.p0.z == this.p1.z) {
	    return this.contactBoxXY(v, box, this.p0.z);
	} else {
	    return null;
	}
    }
    
    contactBoxYZ(v: Vec3, box: Box, x: number) {
	let x0 = box.origin.x;
	let x1 = x0+box.size.x;
	let dx: number;
	if (x <= x0 && x0+v.x < x) {
	    dx = x-x0;
	} else if (x1 <= x && x < x1+v.x) {
	    dx = x-x1;
	} else {
	    return v;
	}
	let dy = v.y*dx / v.x;
	let dz = v.z*dx / v.x;
	let y0 = box.origin.y + dy;
	let y1 = y0+box.size.y;
	let z0 = box.origin.z + dz;
	let z1 = z0+box.size.z;
	if (y1 < this.p0.y || this.p1.y < y0 ||
	    z1 < this.p0.z || this.p1.z < z0 ||
	    (y1 == this.p0.y && v.y <= 0) || (this.p1.y == y0 && 0 <= v.y) ||
	    (z1 == this.p0.z && v.z <= 0) || (this.p1.z == z0 && 0 <= v.z)) {
	    return v;
	}
	return new Vec3(dx, dy, dz);
    }
    
    contactBoxZX(v: Vec3, box: Box, y: number) {
	let y0 = box.origin.y;
	let y1 = y0+box.size.y;
	let dy: number;
	if (y <= y0 && y0+v.y < y) {
	    dy = y-y0;
	} else if (y1 <= y && y < y1+v.y) {
	    dy = y-y1;
	} else {
	    return v;
	}
	let dz = v.z*dy / v.y;
	let dx = v.x*dy / v.y;
	let z0 = box.origin.z + dx;
	let z1 = z0+box.size.z;
	let x0 = box.origin.x + dy;
	let x1 = x0+box.size.x;
	if (z1 < this.p0.z || this.p1.z < z0 ||
	    x1 < this.p0.x || this.p1.x < x0 ||
	    (z1 == this.p0.z && v.z <= 0) || (z0 == this.p1.z && 0 <= v.z) ||
	    (x1 == this.p0.x && v.x <= 0) || (x0 == this.p1.x && 0 <= v.x)) {
	    return v;
	}
	return new Vec3(dx, dy, dz);
    }
    
    contactBoxXY(v: Vec3, box: Box, z: number) {
	let z0 = box.origin.z;
	let z1 = z0+box.size.z;
	let dz: number;
	if (z <= z0 && z0+v.z < z) {
	    dz = z-z0;
	} else if (z1 <= z && z < z1+v.z) {
	    dz = z-z1;
	} else {
	    return v;
	}
	let dx = v.x*dz / v.z;
	let dy = v.y*dz / v.z;
	let x0 = box.origin.x + dx;
	let x1 = x0+box.size.x;
	let y0 = box.origin.y + dy;
	let y1 = y0+box.size.y;
	if (x1 < this.p0.x || this.p1.x < x0 ||
	    y1 < this.p0.y || this.p1.y < y0 ||
	    (x1 == this.p0.x && v.x <= 0) || (x0 == this.p1.x && 0 <= v.x) ||
	    (y1 == this.p0.y && v.y <= 0) || (y0 == this.p1.y && 0 <= v.y)) {
	    return v;
	}
	return new Vec3(dx, dy, dz);
    }
}


//  Box
//
class Box {

    origin: Vec3;
    size: Vec3;
    
    constructor(origin: Vec3, size: Vec3=null) {
	this.origin = origin;
	this.size = (size !== null)? size : new Vec3();
    }
    
    toString() {
	return '('+this.origin+', '+this.size+')';
    }
    
    copy() {
	return new Box(this.origin.copy(), this.size.copy());
    }
    
    equals(box: Box) {
	return (this.origin.equals(box.origin) &&
		this.size.equals(box.size));
    }
    
    isZero() {
	return this.size.isZero();
    }
    
    center() {
	return new Vec3(this.origin.x+this.size.x/2,
			this.origin.y+this.size.y/2,
			this.origin.z+this.size.z/2);
    }
    
    surface(vx: number, vy: number, vz: number) {
	if (vx < 0) {
	    return new AAPlane(
		this.origin,
		this.origin.move(0, this.size.y, this.size.z));
	} else if (0 < vx) {
	    return new AAPlane(
		this.origin.move(this.size.x, 0, 0),
		this.origin.add(this.size));
	} else if (vy < 0) {
	    return new AAPlane(
		this.origin,
		this.origin.move(this.size.x, 0, this.size.z));
	} else if (0 < vy) {
	    return new AAPlane(
		this.origin.move(0, this.size.y, 0),
		this.origin.add(this.size));
	} else if (vz < 0) {
	    return new AAPlane(
		this.origin,
		this.origin.move(this.size.x, this.size.y, 0));
	} else if (0 < vz) {
	    return new AAPlane(
		this.origin.move(0, 0, this.size.z),
		this.origin.add(this.size));
	} else {
	    return null;
	}
    }
    
    anchor(vx=0, vy=0, vz=0) {
	let x: number, y: number, z: number;
	if (vx < 0) {
	    x = this.origin.x;
	} else if (0 < vx) {
	    x = this.origin.x+this.size.x;
	} else {
	    x = this.origin.x+this.size.x/2;
	}
	if (vy < 0) {
	    y = this.origin.y;
	} else if (0 < vy) {
	    y = this.origin.y+this.size.y;
	} else {
	    y = this.origin.y+this.size.y/2;
	}
	if (vz < 0) {
	    z = this.origin.z;
	} else if (0 < vz) {
	    z = this.origin.z+this.size.z;
	} else {
	    z = this.origin.z+this.size.z/2;
	}
	return new Vec3(x, y, z);
    }
    
    move(dx: number, dy: number, dz: number) {
	return new Box(this.origin.move(dx, dy, dz), this.size);
    }
    
    add(v: Vec3) {
	return new Box(this.origin.add(v), this.size);
    }
    
    sub(v: Vec3) {
	return new Box(this.origin.sub(v), this.size);
    }
    
    inflate(dx: number, dy: number, dz: number) {
	return new Box(this.origin.move(-dx, -dy, -dz),
		       this.size.move(dx*2, dy*2, dz*2));
    }
    
    xdistance(box: Box) {
	return Math.max(box.origin.x-(this.origin.x+this.size.x),
			this.origin.x-(box.origin.x+box.size.x));
    }
    
    ydistance(box: Box) {
	return Math.max(box.origin.y-(this.origin.y+this.size.y),
			this.origin.y-(box.origin.y+box.size.y));
    }
    
    zdistance(box: Box) {
	return Math.max(box.origin.z-(this.origin.z+this.size.z),
			this.origin.z-(box.origin.z+box.size.z));
    }
    
    containsPt(p: Vec3) {
	return (this.origin.x <= p.x && this.origin.y <= p.y && this.origin.z <= p.z &&
		p.x < this.origin.x+this.size.x &&
		p.y < this.origin.y+this.size.y &&
		p.z < this.origin.z+this.size.z);
    }
    
    overlapsBox(box: Box) {
	return (this.xdistance(box) < 0 &&
		this.ydistance(box) < 0 &&
		this.zdistance(box) < 0);
    }
    
    union(box: Box) {
	let x0 = Math.min(this.origin.x, box.origin.x);
	let y0 = Math.min(this.origin.y, box.origin.y);
	let z0 = Math.min(this.origin.z, box.origin.z);
	let x1 = Math.max(this.origin.x+this.size.x, box.origin.x+box.size.x);
	let y1 = Math.max(this.origin.y+this.size.y, box.origin.y+box.size.y);
	let z1 = Math.max(this.origin.z+this.size.z, box.origin.z+box.size.z);
	return new Box(new Vec3(x0, y0, z0),
		       new Vec3(x1-x0, y1-y0, z1-z0));
    }
    
    intersection(box: Box) {
	let x0 = Math.max(this.origin.x, box.origin.x);
	let y0 = Math.max(this.origin.y, box.origin.y);
	let z0 = Math.max(this.origin.z, box.origin.z);
	let x1 = Math.min(this.origin.x+this.size.x, box.origin.x+box.size.x);
	let y1 = Math.min(this.origin.y+this.size.y, box.origin.y+box.size.y);
	let z1 = Math.min(this.origin.z+this.size.z, box.origin.z+box.size.z);
	return new Box(new Vec3(x0, y0, z0),
		       new Vec3(x1-x0, y1-y0, z1-z0));
    }
    
    clamp(bounds: Box) {
	let x = ((bounds.size.x < this.size.x)?
		 (bounds.origin.x+bounds.size.x/2) :
		 clamp(bounds.origin.x, this.origin.x,
		       bounds.origin.x+bounds.size.x-this.size.x));
	let y = ((bounds.size.y < this.size.y)?
		 (bounds.origin.y+bounds.size.y/2) :
		 clamp(bounds.origin.y, this.origin.y,
		       bounds.origin.y+bounds.size.y-this.size.y));
	let z = ((bounds.size.z < this.size.z)?
		 (bounds.origin.z+bounds.size.z/2) :
		 clamp(bounds.origin.z, this.origin.z,
		       bounds.origin.z+bounds.size.z-this.size.z));
	return new Box(new Vec3(x, y, z), this.size);
    }
    
    rndpt() {
	return new Vec3(this.origin.x+frnd(this.size.x),
			this.origin.y+frnd(this.size.y),
			this.origin.z+frnd(this.size.z));
    }

    contactBox(v: Vec3, box: Box) {
	if (this.overlapsBox(box)) {
	    return new Vec3();
	}
	if (0 < v.x) {
	    v = this.surface(-1, 0, 0).contactBox(v, box);
	} else if (v.x < 0) {
	    v = this.surface(+1, 0, 0).contactBox(v, box);
	}
	if (0 < v.y) {
	    v = this.surface(0, -1, 0).contactBox(v, box);
	} else if (v.y < 0) {
	    v = this.surface(0, +1, 0).contactBox(v, box);
	}
	if (0 < v.z) {
	    v = this.surface(0, 0, -1).contactBox(v, box);
	} else if (v.z < 0) {
	    v = this.surface(0, 0, +1).contactBox(v, box);
	}
	return v;
    }
}


// getContact: returns a motion vector that satisfies the given constraints.
function getContact(shape: Shape, v: Vec2, obstacles: Collider[], fences: Rect[]=null)
{
    if (obstacles !== null) {
	for (let collider of obstacles) {
	    v = collider.contact(v, shape);
	}
    }
    if (fences !== null) {
	for (let rect of fences) {
	    v = rect.boundRect(v, shape.getAABB());
	}
    }
    return v;
}
