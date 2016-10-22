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


//  Player
//
class Player extends Entity {

    scene: Game;
    usermove: Vec2;
    movement: Vec2;
    locked = 0;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.imgsrc.dstRect;
	this.usermove = new Vec2();
	this.movement = new Vec2(0,0);
    }

    update() {
	super.update();
	if (this.getTime() < this.locked) {
	    if (0 < this.locked) {
		this.locked = 0;
		playSound(SOUNDS['throw']);
	    }
	}
	this.movePos(this.usermove);
	this.movePos(this.movement);
	this.movement.y += 0.2;
	if (!this.scene.screen.containsPt(this.pos)) {
	    playSound(SOUNDS['splash']);
	    this.stop();
	}
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Soldier) {
	    this.movement.x = entity.dx*rnd(2,4);
	    this.movement.y = -rnd(1,4);
	    this.locked = this.getTime()+0.5;
	    playSound(SOUNDS['splash']);
	    entity.die();
	    this.scene.addScore();
	}
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(4);
    }
}


//  Soldier
//
class Soldier extends Entity {

    dx: number;
    scene: Game;

    constructor(scene: Game, pos: Vec2, dx: number) {
	super(pos);
	this.scene = scene;
	this.dx = dx;
    }

    die() {
	let splash = new Entity(this.pos);
	splash.sprite.imgsrc = SPRITES.get(3,0,1,2);
	splash.lifetime = 0.5;
	this.scene.add(splash);
	this.stop();
    }

    update() {
	super.update();
	if (rnd(3) == 0) {
	    this.pos.x += rnd(3)-1;
	}
    }
}

class Soldier1 extends Soldier {
    
    constructor(scene: Game, pos: Vec2) {
	super(scene, pos, +1);
	this.sprite.imgsrc = SPRITES.get(1,0,1,2);
	this.collider = this.sprite.imgsrc.dstRect;
    }

    update() {
	super.update();
	this.pos.x = clamp(0, this.pos.x, 60);
    }
}

class Soldier2 extends Soldier {
    
    constructor(scene: Game, pos: Vec2) {
	super(scene, pos, -1);
	this.sprite.imgsrc = SPRITES.get(2,0,1,2);
	this.collider = this.sprite.imgsrc.dstRect;
    }

    update() {
	super.update();
	this.pos.x = clamp(100, this.pos.x, 160);
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    scoreBox: TextBox;
    score: number;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-2,-2), FONT);
	this.player = new Player(this, new Vec2(80, 40));
	this.player.stopped.subscribe(() => {
	    this.init();
	});
	this.add(this.player);
	for (let i = 0; i < 5; i++) {
	    this.add(new Soldier1(this, new Vec2(rnd(60), 56)));
	    this.add(new Soldier2(this, new Vec2(rnd(100,160), 56)));
	}
	this.score = 0;
	this.updateScore();
    }

    update() {
	super.update();
    }

    setDir(v: Vec2) {
	this.player.setMove(v);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.drawImage(IMAGES['background'], bx, by);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }

    addScore() {
	this.score++;
	this.updateScore();
	if (this.score == 10) {
	    playSound(SOUNDS['win']);
	}
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
