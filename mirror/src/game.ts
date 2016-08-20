/// <reference path="base/utils.ts" />
/// <reference path="base/geom.ts" />
/// <reference path="base/entity.ts" />
/// <reference path="base/text.ts" />
/// <reference path="base/scene.ts" />
/// <reference path="base/app.ts" />
///  game.ts
///


//  Mirror
//
const MS = 7;
class Mirror extends Entity {

    scene: Game;
    direction: number; // +1: \, -1: /

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.collider = new Rect(-MS, -MS, MS*2, MS*2);
	this.scene = scene;
	this.direction = (rnd(2) == 0)? +1 : -1;
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	if (this.scene.focus === this) {
	    ctx.fillStyle = 'blue';
	    ctx.fillRect(bx+this.pos.x-MS, by+this.pos.y-MS, MS*2, MS*2);
	}
	let d = this.direction;
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(bx+this.pos.x-MS, by+this.pos.y-MS*d);
	ctx.lineTo(bx+this.pos.x+MS, by+this.pos.y+MS*d);
	ctx.stroke();
    }

    flip() {
	this.direction = -this.direction;
    }
}


//  Ray
//
const RS = 8;
class Ray extends Entity {
    scene: Game;
    speed: number;
    direction: Vec2;

    constructor(scene: Game, pos: Vec2, direction: number) {
	super(pos);
	this.collider = new Rect(-RS, -RS, RS*2, RS*2);
	this.scene = scene;
	switch (direction % 4) {
	case 0:
	    this.direction = new Vec2(1,0);
	    break;
	case 1:
	    this.direction = new Vec2(-1,0);
	    break;
	case 2:
	    this.direction = new Vec2(0,1);
	    break;
	default:
	    this.direction = new Vec2(0,-1);
	    break;
	}
	this.speed = 4;
    }

    update() {
	let p = this.pos.add(this.direction.scale(RS));
	let mirror = this.scene.findMirror(p);
	if (mirror !== null) {
	    this.direction = this.direction.rot90(mirror.direction);
	}
	this.movePos(this.direction.scale(this.speed));
	if (!this.getCollider().overlaps(this.scene.screen)) {
	    this.die();
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	let v = this.direction;
	ctx.strokeStyle = 'yellow';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(bx+this.pos.x-v.x*RS, by+this.pos.y-v.y*RS);
	ctx.lineTo(bx+this.pos.x+v.x*RS, by+this.pos.y+v.y*RS);
	ctx.stroke();
    }
}


//  Thingy
//
class Thingy extends Entity {
    constructor(pos: Vec2) {
	super(pos);
	this.imgsrc = new FillImageSource('red', new Rect(-4,-4,8,8));
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Ray) {
	    this.die();
	}
    }
}


//  Game
// 
class Game extends GameScene {

    focus: Mirror = null;
    mirrors: Mirror[] = [];
    nextdir: number = 0;
    
    init() {
	super.init();
	for (let y = 0; y < 15; y++) {
	    for (let x = 0; x < 20; x++) {
		if (Math.random() < 0.2) {
		    let mirror = new Mirror(this, new Vec2(x*16+8, y*16+8));
		    this.addObject(mirror);
		    this.mirrors.push(mirror);
		} else if (Math.random() < 0.2) {
		    let thingy = new Thingy(new Vec2(x*16+8, y*16+8));
		    this.addObject(thingy);
		}
	    }		
	}
	this.nextdir = 0;
    }

    mousedown(x: number, y: number, button: number) {
	let p = new Vec2(x,y);
	let mirror = this.findMirror(p);
	if (mirror !== null) {
	    mirror.flip();
	} else {
	    p.x = int((p.x-8)/16)*16+8;
	    p.y = int((p.y-8)/16)*16+8;
	    let ray = new Ray(this, p, this.nextdir++);
	    this.addObject(ray);
	}
    }

    mousemove(x: number, y: number) {
	this.focus = this.findMirror(new Vec2(x,y));
    }

    findMirror(p: Vec2) {
	for (let mirror of this.mirrors) {
	    if (mirror.getCollider().containsPt(p)) {
		return mirror;
	    }
	}
	return null;
    }
    
    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
    }
}
