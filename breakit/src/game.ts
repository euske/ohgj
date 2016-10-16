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
	IMAGES['sprites'], new Vec2(16,16), new Vec2(8,8));
});


//  Bullet
//
class Bullet extends Projectile {
    constructor(pos: Vec2) {
	super(pos);
	let bounds = new Rect(-2, -2, 4, 4);
	this.sprite.imgsrc = new FillImageSource('white', bounds)
	this.collider = bounds;
    }
}


//  Explosion
//
class Explosion extends Entity {
    constructor(pos: Vec2) {
	super(pos);
	this.sprite.imgsrc = SPRITES.get(3);
	this.lifetime = 0.2;
    }
}


//  Enemy
//
const MINDIST = 80;
class Enemy extends Entity {
    
    game: Game;
    counter = 0;
    direction = new Vec2();

    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
	this.sprite.imgsrc = SPRITES.get(2);
	this.collider = this.sprite.imgsrc.dstRect;
    }

    update() {
	super.update();
	if (this.counter <= 0) {
	    this.counter = rnd(10, 20);
	    if (rnd(2) == 0) {
		let target = this.game.player.pos;
		let v = target.sub(this.pos).sign();
		this.direction = v.scale(2);
	    } else {
		let v = new Vec2(rnd(3)-1, rnd(3)-1);
		this.direction = v.scale(2);
	    }
	}
	this.counter--;
	this.pos = this.game.screen.modpt(this.pos.add(this.direction));
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Bullet) {
	    playSound(SOUNDS['hit']);
	    this.game.addScore();
	    this.stop();
	}
    }
}


//  Player
//
let MOVES = [new Vec2(1,0), new Vec2(0,-1), new Vec2(-1,0), new Vec2(0,1)];
class Player extends Entity {

    game: Game;
    move: number;

    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
	this.sprite.imgsrc = SPRITES.get(1);
	this.collider = this.sprite.imgsrc.dstRect;
	this.move = 0;
    }

    update() {
	super.update();
	if (rnd(10) == 0) {
	    this.move = (this.move+rnd(3)-1+4) % 4;
	    playSound(SOUNDS['switch']);
	}
	let v = MOVES[this.move].scale(2);
	this.pos = this.game.screen.modpt(this.pos.add(v));
    }

    fire(p: Vec2) {
	let bullet = new Bullet(this.pos);
	let v = p.sub(this.pos);
	bullet.frame = this.game.screen;
	bullet.movement = v.scale(8/v.len());
	this.game.add(bullet);
	playSound(SOUNDS['fire']);
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Enemy) {
	    this.stop();
	    this.game.playerDead();
	}
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    cursor: Entity;
    scoreBox: TextBox;
    enemies: number;
    
    init() {
	super.init();
	
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.player = new Player(this, this.screen.center());
	this.add(this.player);
	this.cursor = new Entity(this.screen.center());
	this.cursor.sprite.imgsrc = SPRITES.get(0);
	this.add(this.cursor);
	this.enemies = 0;
	for (let i = 0; i < 12; i++) {
	    this.addEnemy();
	}
	this.updateScore();
    }

    update() {
	super.update();
    }

    onMouseMove(p: Vec2) {
	this.cursor.pos = p;
    }

    onMouseDown(p: Vec2, button: number) {
	super.onMouseDown(p, button);
	this.player.fire(p);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }

    addEnemy() {
	let pos: Vec2;
	let player = this.player.pos;
	while (true) {
	    pos = this.screen.rndpt();
	    if (MINDIST <= Math.abs(pos.x-player.x) ||
		MINDIST <= Math.abs(pos.y-player.y)) break;
	}
    	this.add(new Enemy(this, pos));
	this.enemies++;
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['ENEMY: '+this.enemies]);
    }

    addScore() {
	this.enemies--;
	this.updateScore();
	if (this.enemies == 0) {
	    let banner = new BannerBox(
		this.screen, FONT, 
		['CONGRATS!', 'YOU DID IT!!!1'], 4);
	    this.add(banner);
	}
    }

    playerDead() {
	let expl = new Explosion(this.player.pos);
	expl.stopped.subscribe(() => { this.init(); });
	playSound(SOUNDS['explosion']);
	this.add(expl);
    }
}
