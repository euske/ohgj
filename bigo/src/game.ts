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

function getRect(size: number): Rect {
    return new Rect(-size, -size, size*2, size*2);
}


//  Thingy
//
class Thingy extends Entity {

    scene: Game;
    size1: number;
    size2: number;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.size1 = 0;
	this.size2 = 0;
    }

    update() {
	super.update();
	let size = ((this.scene.phase % 2) == 0)? this.size1 : this.size2;
	this.sprite.imgsrc = this.getImageSource(getRect(size));
	this.collider = this.sprite.getBounds(new Vec2());
    }

    getImageSource(rect: Rect) {
	return new RectImageSource('white', rect);
    }
}


//  Obstacle
//
class Obstacle extends Thingy {

    constructor(scene: Game, pos: Vec2) {
	super(scene, pos);
	this.size1 = rnd(4, 16);
	this.size2 = rnd(16, 32);
	if (rnd(2) == 0) {
	    let t = this.size1;
	    this.size1 = this.size2;
	    this.size2 = t;
	}
	this.collider = getRect(Math.max(this.size1, this.size2));
    }

    getImageSource(rect: Rect) {
	return new RectImageSource('red', rect);
    }
}


//  Coin
//
class Coin extends Thingy {

    constructor(scene: Game, pos: Vec2) {
	super(scene, pos);
	this.size1 = rnd(4, 8);
	this.size2 = rnd(8, 16);
	if (rnd(2) == 0) {
	    let t = this.size1;
	    this.size1 = this.size2;
	    this.size2 = t;
	}
	this.collider = getRect(Math.max(this.size1, this.size2));
    }

    getImageSource(rect: Rect) {
	return new OvalImageSource('yellow', rect);
    }
}


//  Player
//
class Player extends Thingy {

    usermove: Vec2;

    constructor(scene: Game, pos: Vec2) {
	super(scene, pos);
	this.usermove = new Vec2();
	this.size1 = 4;
	this.size2 = 20;
	this.collider = getRect(Math.max(this.size1, this.size2));
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(8);
    }

    getImageSource(rect: Rect) {
	return new RectImageSource('#0f0', rect);
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Coin) {
	    entity.stop();
	    this.scene.addScore();
	} else {
	    this.stop();
	}	    
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    scoreBox: TextBox;
    score: number;
    phase: number;
    
    constructor() {
	super();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
    }
    
    init() {
	super.init();
	this.player = new Player(this, this.screen.center());
	this.player.stopped.subscribe(() => { this.bombed(); });
	this.add(this.player);
	this.score = 0;
	this.updateScore();
	this.phase = 0;
	APP.setMusic(SOUNDS['song'], 0, 2.62);

	for (let i = 0; i < 10; i++) {
	    for (let j = 0; j < 10; j++) {
		let obj = new Obstacle(this, this.screen.rndPt());
		let c = obj.getCollider();
		if (!this.layer.hasEntity((e:Entity) => { return true; }, c)) {
		    this.add(obj);
		    break;
		}
	    }
	}
	for (let i = 0; i < 5; i++) {
	    for (let j = 0; j < 10; j++) {
		let obj = new Coin(this, this.screen.rndPt());
		let c = obj.getCollider();
		if (!this.layer.hasEntity((e:Entity) => { return true; }, c)) {
		    this.add(obj);
		    break;
		}
	    }
	}
    }

    update() {
	super.update();
	let t = APP.getMusicTime();
	this.phase = int((t+0.1) / 0.65);
    }

    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }

    addScore() {
	this.score++;
	this.updateScore();
	playSound(SOUNDS['coin']);
    }

    bombed() {
	let task = new DelayTask(1.0);
	task.stopped.subscribe(() => { this.init(); });
	this.add(task);
	playSound(SOUNDS['bombed']);
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
