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
    FONT = new Font(IMAGES['font'], 'black');
    SPRITES = new ImageSpriteSheet(
	IMAGES['sprites'], new Vec2(16,16), new Vec2(8,8));
});


//  Food
//
class Food extends Projectile {
    constructor(frame: Rect) {
	super(frame.inflate(-40,-40).rndpt());
	this.sprite.imgsrc = SPRITES.get(1);
	this.collider = this.sprite.imgsrc.dstRect.inflate(-2, -2);
	this.frame = frame;
	this.movement = new Vec2(0,2);
    }
}

//  Wolf
//
class Wolf extends Projectile {
    constructor(frame: Rect) {
	super(frame.inflate(-40,-80).rndpt());
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.imgsrc.dstRect.inflate(-2, -4);
	this.frame = frame;
	this.movement = new Vec2(0,2);
    }
}

//  Paddle
//
class Paddle extends Entity {

    screen: Rect;		// Screen bounds.
    vx: number;			// Moving direction.
    speed = 4;
    mouse: Vec2 = null;
    ate: Signal;

    constructor(screen: Rect) {
	// Initializes the position and shape.
	super(screen.anchor(0,+1).move(0,-20));
	let bounds = new Rect(-20,-5,40,10);
	this.sprite.imgsrc = new FillImageSource('green', bounds);
	this.collider = bounds;
	this.screen = screen;
	this.vx = 0;
	this.ate = new Signal(this);
    }

    update() {
	let x = this.pos.x;
	if (this.mouse !== null) {
	    x += clamp(-this.speed, this.mouse.x-this.pos.x, +this.speed);
	} else {
	    x += this.vx*this.speed;
	}
	this.pos.x = clamp(20, x, this.screen.right()-20);
    }
    
    collidedWith(entity: Entity) {
	if (entity instanceof Food) {
	    entity.stop();
	    this.ate.fire();
	} else if (entity instanceof Wolf) {
	    this.stop();
	}
    }
}


//  Ball
//
class Ball extends Entity {

    screen: Rect;		// Screen bounds.
    v: Vec2;			// Moving direction.
    speed = 4;

    constructor(screen: Rect) {
	// Initializes the position and shape.
	super(screen.center());
	let bounds = new Rect(-5,-5,10,10);
	this.sprite.imgsrc = new FillImageSource('#ff6600', bounds);
	this.collider = bounds;
	this.screen = screen;
	this.v = new Vec2(rnd(2)*2-1, -1);
    }

    update() {
	// Updates the position.
	let pos = this.pos.add(this.v);
	let bounds = this.getCollider(pos).getAABB();
	if (bounds.x < 0 || this.screen.right() < bounds.right()) {
	    this.v.x = -this.v.x;
	}
	if (bounds.y < 0) {
	    this.v.y = -this.v.y;
	}
	this.pos = this.pos.add(this.v.scale(this.speed));
    }

    collidedWith(entity: Entity) {
	// Bounces when hit the paddle.
	if (entity instanceof Paddle) {
	    this.v.y = -1;
	    playSound(SOUNDS['beep']);
	}
    }
}


class Game extends GameScene {

    paddle: Paddle;
    ball: Ball;
    status: TextBox;
    temp: number;

    init() {
	super.init();
	// Places the objects.
	this.paddle = new Paddle(this.screen);
	this.paddle.stopped.subscribe(() => { this.dead(); });
	this.paddle.ate.subscribe(() => { this.ate(); });
	this.add(this.paddle);
	this.ball = new Ball(this.screen);
	this.add(this.ball);
	this.status = new TextBox(this.screen.resize(100,30,1,-1).move(10,-10), FONT);
	this.temp = 0;
	APP.setMusic(SOUNDS['music'], 0, 21.3);
    }

    update() {
	super.update();
	if (this.paddle.running) {
	    if (this.screen.height < this.ball.pos.y) {
		this.paddle.stop();
	    }
	    if (rnd(30) == 0) {
		switch (rnd(2)) {
		case 0:
		    playSound(SOUNDS['wolf']);
		    this.add(new Wolf(this.screen));
		    break;
		case 1:
		    this.add(new Food(this.screen));
		    break;
		}
	    }
	    this.temp -= 0.05;
	    this.paddle.speed = 80/(1+Math.abs(this.temp));
	    this.updateStatus();
	}
    }

    dead() {
	playSound(SOUNDS['dead']);
	let task = new DelayTask(2.0, ()=>{ this.init(); });
	this.add(task);
    }

    ate() {
	playSound(SOUNDS['eat']);
	this.temp = this.temp*0.75+2;
    }
    
    setDir(v: Vec2) {
	this.paddle.vx = v.x;
	this.paddle.mouse = null;
    }

    onMouseMove(p: Vec2) {
	this.paddle.vx = 0;
	this.paddle.mouse = p;
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	// Paints the background.
	ctx.drawImage(IMAGES['bkgnd'], 0, 0);
	// Paints everything else.
	super.render(ctx, bx, by);
	this.status.render(ctx, bx, by);
    }

    updateStatus() {
	this.status.clear();
	this.status.putText(['TEMP. '+int(this.temp)]);
    }
}
