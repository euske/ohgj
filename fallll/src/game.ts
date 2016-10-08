/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/entity.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/animation.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///


//  Initialize the resources.
let FONT: Font;
let SPRITES:ImageSpriteSheet;
addInitHook(() => {
    FONT = new Font(IMAGES['font'], 'white');
    SPRITES = new ImageSpriteSheet(
	IMAGES['sprites'], new Vec2(16,16), new Vec2(8,8));
});


//  Player
//
class Player extends Entity {

    frame: Rect;
    fallen: Signal;
    died: Signal;
    fall: number = 0;
    speed: Vec2;
    vx: number = 0;
    alive: boolean = true;

    constructor(frame: Rect, pos: Vec2) {
	super(pos);
	this.frame = frame;
	this.fallen = new Signal(this);
	this.died = new Signal(this);
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.imgsrc.dstRect;
	this.speed = new Vec2(1, 2);
    }

    update() {
	super.update();
	if (this.alive) {
	    this.pos = this.pos.move(this.vx, this.speed.y);
	    this.pos.x = fmod(this.pos.x, this.frame.width);
	    if (this.frame.height < this.pos.y) {
		this.pos.y = fmod(this.pos.y, this.frame.height);
		playSound(SOUNDS['fall']);
		this.fall++;
		this.speed.y = this.fall+2;
		this.speed.x = 2*int(Math.sqrt(this.speed.y));
		this.fallen.fire();
	    }
	}
    }
    
    setMove(v: Vec2) {
	this.vx = v.x*this.speed.x;
    }

    collidedWith(entity: Entity) {
	if (this.alive) {
	    if (entity instanceof Thingy) {
		this.alive = false;
		playSound(SOUNDS['explosion']);
		this.died.fire();
	    }
	}
    }
    
}


//  Thingy
//
class Thingy extends Entity {

    scene: Game;
    frame: Rect;
    movement: Vec2 = new Vec2(4,0);
    
    constructor(scene: Game, bounds: Rect) {
	super(bounds.center());
	this.scene = scene;
	this.frame = scene.screen;
	let color = Color.generate(Math.random());
	this.sprite.imgsrc = new FillImageSource(color.toString(), bounds);
	this.collider = this.sprite.imgsrc.dstRect;
    }

    update() {
	super.update();
	if (this.scene.player.alive) {
	    this.pos = this.frame.modpt(this.pos.add(this.movement));
	}
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    stars: StarSprite;
    scoreBox: TextBox;
    nextThing: number;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.player = new Player(this.screen, this.screen.center());
	this.player.fallen.subscribe(() => { this.updateScore(); });
	this.player.died.subscribe(() => {
	    let blinker = new Blinker(this.player.sprite);
	    blinker.interval = 0.2;
	    blinker.lifetime = 2.0;
	    blinker.stopped.subscribe(() => { this.init(); });
	    this.add(blinker);
	});
	this.add(this.player);
	this.stars = new StarSprite(this.screen, 100);
	playSound(SOUNDS['fall']);
	this.updateScore();
	this.nextThing = 0;
    }

    tick(t: number) {
	super.tick(t);
	if (this.player.alive) {
	    this.stars.move(new Vec2(0,-1));
	    if (this.nextThing <= t) {
		let pos = new Vec2(0, rnd(this.screen.height));
		let size = rnd(4,12);
		let thingy = new Thingy(this, pos.expand(size, size));
		this.add(thingy);
		this.nextThing = t+frnd(0.1, 1);
	    }
	}
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['FALL:'+this.player.fall]);
    }

    setDir(v: Vec2) {
	this.player.setMove(v);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	this.stars.render(ctx, bx, by);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }
}
