///  game.ts
///

var APP: App;
const WHITE = new DummyImageSource('white');
    
const D = 2*Math.PI/3;
function getColor(t: number, intensity: number=1.0) {
    t *= 2*Math.PI;
    intensity *= 0.5;
    return new Color(
	Math.sin(t)*intensity+.5,
	Math.sin(t+D)*intensity+.5,
	Math.sin(t+2*D)*intensity+.5
    );
}


//  Thing
//
class Thing extends PhysicalEntity {

    scene: Game;

    constructor(scene: Game, bounds: Rect, speed=4) {
	super(bounds, WHITE, bounds);
	this.scene = scene;
	this.jumpfunc = (vy:number, t:number) => { return speed; };
    }
    
    land() {
	super.land();
	this.imgsrc = new DummyImageSource(this.scene.color.toString());
    }

    getObstaclesFor(range: Rect, force: boolean): Shape[] {
	let objs = this.scene.layer.findObjects(
	    range, null, (e:Entity)=>{ return e !== this; });
	let a:Shape[] = [];
	for (let i = 0; i < objs.length; i++) {
	    a.push(objs[i].collider);
	}
	return a;
    }
  
    getFencesFor(range: Rect, force: boolean): Rect[] {
	return [this.scene.screen];
    }
}


//  Player
//
class Player extends PhysicalEntity {

    scene: Game;
    usermove: Vec2;

    constructor(scene: Game, pos: Vec2) {
	let bounds = pos.expand(16, 16);
	super(bounds, WHITE, bounds);
	this.scene = scene;
	this.usermove = new Vec2();
	this.jumpfunc = (
	    (vy:number, t:number) => { return (0 <= t && t <= 8)? -6 : vy+1; }
	);
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove, true);
    }
    
    setMove(v: Vec2) {
	this.usermove.x = v.x*4;
    }
    
    getObstaclesFor(range: Rect, force: boolean): Shape[] {
	let objs = this.scene.layer.findObjects(
	    range, null, (e:Entity)=>{ return e !== this; });
	let a:Shape[] = [];
	for (let i = 0; i < objs.length; i++) {
	    a.push(objs[i].collider);
	}
	return a;
    }
  
    getFencesFor(range: Rect, force: boolean): Rect[] {
	return [this.scene.screen];
    }
}


//  Game
//
class Game extends GameScene {

    t: number;
    next: number;
    player: Player;
    color: Color;

    constructor(app: App) {
	super(app);
	APP = app;
    }
    
    init() {
	super.init();
	this.t = 0;
	this.next = 30;
	this.player = new Player(this, this.screen.center());
	this.addObject(this.player);
    }

    tick() {
	super.tick();
	this.t++;
	if (this.next <= this.t) {
	    let pos = new Vec2(rnd(this.screen.width), 0);
	    let size = rnd(10, 30);
	    let speed = rnd(1, 10);
	    let bounds = pos.expand(size, size);
	    let objs = this.layer.findObjects(bounds);
	    if (objs.length == 0) {
		let obj = new Thing(this, bounds, speed);
		this.addObject(obj);
		this.next = this.t+rnd(10, 40);
	    }
	}
    }

    setDir(v: Vec2) {
	this.player.setMove(v);
    }

    setAction(action: boolean) {
	this.player.setJump(action? Infinity : 0);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	let p = this.player.bounds.center();
	this.color = getColor(p.x/this.screen.width, 1.0-(p.y/this.screen.height))
	ctx.fillStyle = this.color.toString();
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
    }
}
