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
let SPRITES:ImageSpriteSheet;
addInitHook(() => {
    FONT = new Font(IMAGES['font'], 'white');
    SPRITES = new ImageSpriteSheet(
	IMAGES['sprites'], new Vec2(8,8), new Vec2(4,4));
});


//  Fish
//
class Fish extends Projectile {
    
    constructor(frame: Rect, pos: Vec2, vx: number=0) {
	super(pos);
	this.frame = frame;
	this.sprite.imgsrc = SPRITES.get(1);
	this.collider = this.sprite.getBounds(new Vec2());
	vx = (vx!=0)? vx : rnd(2)*2-1;
	this.movement = new Vec2(vx, 0);
	this.sprite.scale.x = vx;
    }
}


//  Crab
//
class Crab extends Entity {

    frame: Rect;
    
    constructor(frame: Rect, pos: Vec2) {
	super(pos);
	this.frame = frame;
	this.sprite.imgsrc = SPRITES.get(2);
	this.collider = this.sprite.getBounds(new Vec2());
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.frame];
    }

    update() {
	super.update();
	if (rnd(3) == 0) {
	    this.moveIfPossible(new Vec2(rnd(3)-1, 0));
	}
    }
}


//  Fire
//
class Fire extends Entity {

    frame: Rect;
    vel: Vec2;

    constructor(frame: Rect, pos: Vec2, vy: number=0) {
	super(pos);
	this.frame = frame;
	this.sprite.imgsrc = new RectImageSource('yellow', new Rect(-2,-2,4,4));
	this.collider = this.sprite.getBounds(new Vec2());
	this.vel = new Vec2(rnd(3)-1, -(rnd(vy/2)+2));
	this.lifetime = 0.6;
    }

    update() {
	super.update();
	this.movePos(this.vel);
	if (this.vel.y < 4) {
	    this.vel.y++;
	}
    }
}


//  Player
//
class Player extends Entity {

    scene: Game;
    usermove: Vec2;
    height: number;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.getBounds(new Vec2());
	this.usermove = new Vec2();
	this.height = 0;
    }

    update() {
	super.update();
	this.moveIfPossible(new Vec2(this.usermove.x*2, 0));
	if (this.usermove.x != 0) {
	    this.height = 0;
	} else {
	    this.height = clamp(0, this.height+this.usermove.y, 90);
	}
	this.collider = new Rect(-4, 0, 8, this.height);
    }

    render(ctx: CanvasRenderingContext2D) {
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0.5, 4);
	ctx.lineTo(0.5, 4+this.height);
	ctx.stroke();
    }
    
    setMove(v: Vec2) {
	this.usermove = v;
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.scene.screen];
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Fish) {
	    this.scene.updateScore(1);
	    entity.stop();
	    APP.playSound('beep');
	} else if (entity instanceof Crab) {
	    this.scene.updateScore(10);
	    entity.stop();
	    APP.playSound('beep');
	} else if (entity instanceof Fire) {
	    this.stop();
	    APP.playSound('dead');
	}
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    scoreBox: TextBox;
    score: number;
    lava: Rect;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.player = new Player(this, new Vec2(this.screen.centerx(), 24));
	this.player.chain(new DelayTask(2, () => { this.init(); }));
	this.add(this.player);
	this.score = 0;
	this.updateScore();

	this.lava = this.screen.expand(0, -20, 0, -1);
	for (let i = 0; i < 20; i++) {
	    this.add(new Fish(this.lava, this.lava.rndPt()));
	}
	for (let i = 0; i < 3; i++) {
	    let p = this.lava.rndPt();
	    p.y = this.lava.bottom()-5;
	    this.add(new Crab(this.lava, p));
	}
    }

    update() {
	super.update();
	if (rnd(10) == 0) {
	    let vx = rnd(2)*2-1;
	    let p = this.lava.rndPt();
	    if (vx < 0) { p.x = this.lava.right(); }
	    else { p.x = this.lava.x; }
	    this.add(new Fish(this.lava, p, vx));
	}
	if (rnd(10) == 0) {
	    let p = this.lava.rndPt();
	    let dy = rnd(40);
	    p.y = this.lava.y+dy;
	    this.add(new Fire(this.lava, p, dy));
	}
    }

    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,160)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	ctx.fillStyle = 'rgb(240,120,20)';
	ctx.fillRect(bx+this.lava.x, by+this.lava.y,
		     this.lava.width, this.lava.height);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx);
    }

    updateScore(d=0) {
	this.score += d;
	this.scoreBox.clear();
	this.scoreBox.putText([this.score.toString()]);
    }
}
