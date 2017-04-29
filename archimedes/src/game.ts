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


//  MoneyParticle
//
class MoneyParticle extends Projectile {
    
    constructor(pos: Vec2, money: number) {
	super(pos);
	let textbox = new TextBox(new Rect(-16,-10,32,10), FONT);
	this.sprite.imgsrc = textbox;
	this.movement = new Vec2(0, (0 < money)? -2 : +2);
	this.lifetime = 0.5;
	textbox.putText([money.toString()], 'center', 'center');
    }
}


//  Gold
//
class Gold extends Projectile {

    size: number;

    constructor(pos: Vec2, frame: Rect, size: number) {
	super(pos);
	this.frame = frame;
	this.size = size;
	let z = Math.abs(size);
	let rect = new Rect(-z, -z, z*2, z*2);
	this.sprite.imgsrc = new RectImageSource('gold', rect);
	this.collider = this.sprite.getBounds(new Vec2());
	let velocity = (0 < size)? z*0.3+rnd(2) : z*0.1+rnd(4);
	this.movement = new Vec2(0, velocity);
    }

    update() {
	super.update();
	let imgsrc = this.sprite.imgsrc as RectImageSource;
	imgsrc.color = (this.layer.mouseFocus === this.sprite)? 'white' : 'gold';
    }
    
}


//  Game
// 
class Game extends GameScene {

    t0: number;
    scoreBox: TextBox;
    score: number;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.score = 0;
	this.updateScore();
	this.add(new Gold(this.screen.anchor(0,-1), this.screen, +10));
	this.t0 = getTime()+2;
    }

    update() {
	super.update();
	if (this.t0 < getTime() && rnd(10) == 0) {
	    let pos = new Vec2(rnd(this.screen.width), 0);
	    let real = (rnd(4) == 0);
	    let size = rnd(5,20);
	    let gold = new Gold(pos, this.screen, real? size : -size);
	    this.add(gold);
	}
    }

    onMouseDown(p: Vec2, button: number) {
	super.onMouseDown(p, button);
	if (this.layer.mouseFocus !== null) {
	    let entity = (this.layer.mouseFocus as EntitySprite).entity;
	    if (entity instanceof Gold) {
		let score = entity.size;
		this.addScore(score);
		entity.stop();
		this.add(new MoneyParticle(entity.pos, score));
	    }
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,100)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx);
    }

    addScore(score: number) {
	this.score += score;
	this.updateScore();
	if (0 < score) {
	    playSound(SOUNDS['good']);
	} else {
	    playSound(SOUNDS['bad']);
	}
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
