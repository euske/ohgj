/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/entity.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///


//  Initialize the resources.
let FONT: Font;
addInitHook(() => {
    FONT = new Font(IMAGES['font'], 'white');
});

function ellipse(ctx: CanvasRenderingContext2D,
		 cx: number, cy: number, rx: number, ry: number) {
    let r1 = Math.max(rx, ry);
    ctx.save();
    ctx.translate(cx, cy);
    if (r1 == rx) {
	ctx.scale(1, ry/rx);
    } else {
	ctx.scale(rx/ry, 1);
    }
    ctx.arc(0, 0, r1, 0, Math.PI*2);
    ctx.restore();
}


//  Pancake
//
class Pancake extends PhysicalEntity implements ImageSource {

    scene: Game;
    rot = 0;
    flipping = 0;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.sprite.imgsrc = this;
	this.collider = this.sprite.getBounds(new Vec2());
	this.jumpfunc = (vy:number, t:number) => {
	    return (0 <= t && t <= 8)? -8 : vy+2;
	};
    }

    getBounds() {
	let r = 100*Math.sin(this.rot+0.3);
	return new Rect(-100, -r/2, 200, r);
    }

    render(ctx: CanvasRenderingContext2D) {
	let bounds = this.getBounds();
	ctx.fillStyle = '#fe4';
	ctx.beginPath();
	let c = bounds.center();
	ellipse(ctx, c.x, c.y, bounds.width/2, bounds.height/2);
	ctx.fill();
    }

    flip() {
	this.flipping = this.getTime();
	this.setJump(Infinity);
    }
    
    getObstaclesFor(range: Rect, v: Vec2, context: string): Collider[] {
	if (0 < this.flipping) { return null; }
	let ents = this.scene.layer.findEntities(
	    (e:Entity) => { return e !== this && e instanceof Pancake; });
	return ents.map((e:Entity) => { return e.getCollider(); });
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.scene.panRect];
    }

    update() {
	super.update();
	if (0 < this.flipping) {
	    let dt = this.getTime() - this.flipping;
	    if (dt < 0.5) {
		this.rot = Math.sin(Math.PI*dt/0.5)*Math.PI*0.5;
	    } else {
		this.rot = 0;
		this.flipping = 0;
	    }
	}
	this.collider = this.sprite.getBounds(new Vec2());
    }
}


//  Game
// 
class Game extends GameScene {

    scoreBox: TextBox;
    score: number;
    cx: number;
    panRect: Rect;
    
    start() {
	super.start();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.score = 0;
	this.updateScore();

	this.cx = this.screen.width/2;
	this.panRect = new Rect(0, 0, this.screen.width, this.screen.height-50);
	this.add(new Pancake(this, new Vec2(this.cx, 50)));
	this.add(new Pancake(this, new Vec2(this.cx, 100)));
	this.add(new Pancake(this, new Vec2(this.cx, 150)));
    }

    update() {
	super.update();
    }

    onButtonPressed(key: KeySym) {
	playSound(SOUNDS['flip']);
	for (let entity of this.layer.entities) {
	    if (entity instanceof Pancake) {
		if (entity.flipping == 0) {
		    entity.flip();
		    break;
		}
	    }
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);

	let pw = 120;
	let ph = 30;
	ctx.fillStyle = '#555';
	ctx.beginPath();
	ellipse(ctx, bx+this.cx, by+this.panRect.height, pw, ph);
	ctx.fill();
	
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
