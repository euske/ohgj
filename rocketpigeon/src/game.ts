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
    FONT = new ShadowFont(IMAGES['font'], 'white');
    SPRITES = new ImageSpriteSheet(
	IMAGES['sprites'], new Vec2(16,16), new Vec2(8,8));
});


//  Smoke
//
class Smoke extends Entity {
    
    constructor(pos: Vec2) {
	super(pos);
	this.sprite.imgsrc = new RectImageSource('white', new Rect());
	this.lifetime = 0.5;
    }

    update() {
	super.update();
	this.moveIfPossible(new Vec2(2, 0));
	(this.sprite.imgsrc as RectImageSource).dstRect =
	    new Rect(rnd(-8,8), rnd(-8,8), rnd(4,10), rnd(4,10));
    }
}


//  Pigeon
//
class Pigeon extends Entity {

    scene: Game;
    usermove: Vec2 = new Vec2();
    firing: number = 0;
    dead: number = 0;
    died: Signal;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.died = new Signal();
	this.scene = scene;
	this.sprite.imgsrc = SPRITES.get(1);
	this.collider = this.sprite.getBounds(new Vec2());
    }

    update() {
	super.update();
	if (0 < this.firing) {
	    this.moveIfPossible(new Vec2(Math.max(4, this.firing), 0));
	    this.firing--;
	} else if (this.dead != 0) {
	    this.movePos(new Vec2(2, this.dead));
	    this.dead++;
	} else {
	    var s = phase(getTime(), 0.1);
	    this.sprite.imgsrc = SPRITES.get(1+s);
	    this.moveIfPossible(this.usermove);
	}
    }

    setMove(v: Vec2) {
	this.usermove = v.scale(4);
    }
    
    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	// Restrict its position within the screen.
	return [this.scene.screen];
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Rocket && this.dead == 0) {
	    entity.stop();
	    this.firing = 10;
	    this.scene.add(new Smoke(this.pos));
	    playSound(SOUNDS['fire']);
	} else if (entity instanceof EnemyBase) {
	    if (this.firing != 0) {
		entity.stop();
		this.scene.addScore(1);
		playSound(SOUNDS['score']);
	    } else if (this.dead == 0) {
		this.dead = 4;
		this.died.fire();
		playSound(SOUNDS['hurt']);
	    }
	}
    }
}


class Rocket extends Projectile {
    
    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.frame = scene.screen;
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.getBounds(new Vec2());
	this.movement = new Vec2(-4, rnd(3)-1);
    }
}



//  EnemyBase
//  This class has the common methods for all enemies.
//  They can be mixed in with applyMixins().
//
class EnemyBase extends Projectile {

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.frame = scene.screen;
    }
}


//  Enemy1
//
class Enemy1 extends EnemyBase {

    constructor(scene: Game, pos: Vec2) {
	super(scene, pos);
	this.sprite.imgsrc = SPRITES.get(3);
	this.collider = this.sprite.getBounds(new Vec2());
	this.movement = new Vec2(-rnd(4,8), rnd(3)-1);
    }

    update() {
	super.update();
	var s = phase(getTime(), 0.2);
	this.sprite.imgsrc = SPRITES.get(3+s);
    }
}


//  Enemy2
//
class Enemy2 extends EnemyBase {

    y1: number;
    y2: number;

    constructor(scene: Game, pos: Vec2) {
	super(scene, pos);
	this.sprite.imgsrc = SPRITES.get(5);
	this.collider = this.sprite.getBounds(new Vec2());
	this.y1 = pos.y;
	this.y2 = rnd(scene.screen.height);
	this.movement = new Vec2(-4, (this.y1 < this.y2)? +4 : -4);
    }

    update() {
	super.update();
	var s = phase(getTime(), 0.05);
	this.sprite.imgsrc = SPRITES.get(5+s);
	if (this.y1 < this.y2) {
	    if (this.y2 < this.pos.y) { this.movement.y = -4; }
	    else if (this.pos.y < this.y1) { this.movement.y = +4; }
	} else {
	    if (this.y1 < this.pos.y) { this.movement.y = -4; }
	    else if (this.pos.y < this.y2) { this.movement.y = +4; }
	}
    }
}


//  Game
// 
class Game extends GameScene {

    player: Pigeon;
    background: FixedSprite;
    stars: StarImageSource;
    nextenemy: number;		// Enemy spawning counter.
    score: number;
    scoreBox: TextBox;

    constructor() {
	super();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
    }
    
    init() {
	super.init();
	this.player = new Pigeon(this, this.screen.center());
	this.player.died.subscribe(() => {
	    this.add(new DelayTask(2, () => { this.init(); }));
	});
	this.add(this.player);
	this.stars = new StarImageSource(this.screen, 100);
	this.stars.imgsrc = SPRITES.get(7);
	this.background = new FixedSprite(new Vec2(), this.stars);
	this.nextenemy = 0;
	this.score = 0;
	this.updateScore();
    }

    update() {
	super.update();
	this.stars.move(new Vec2(-4, 0));
	// Spawn an enemy at a random interval.
	if (this.nextenemy == 0) {
	    let pos = new Vec2(this.screen.width, rnd(this.screen.height));
	    let enemy:EnemyBase;
	    switch (rnd(4)) {
	    case 0:
	    case 1:
		this.add(new Rocket(this, pos));
		break;
	    case 2:
		this.add(new Enemy1(this, pos));
		break;
	    case 3:
		this.add(new Enemy2(this, pos));
		break;
	    }
	    this.nextenemy = 5+rnd(10);
	}
	this.nextenemy--;
    }

    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    addScore(pts: number) {
	this.score += pts;
	this.updateScore();
    }

    updateScore() {
	// Update the text in the score box.
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE:'+format(this.score)]);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,230)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	if (0 < this.player.firing) {
	    bx += rnd(10)-5;
	    by += rnd(10)-5;
	}
	this.background.render(ctx, bx, by);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx);
    }
}
