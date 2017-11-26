/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/entity.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///

let FONT: Font;
addInitHook(() => {
    FONT = new Font(APP.images['font'], 'white');
});

//  Player
//
class Player extends Entity {

    scene: Game;
    usermove: Vec2;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.skin = new RectImageSource('#00ff00', new Rect(-8, -8, 16, 16));
	this.collider = this.skin.getBounds().inflate(-4,-4);
	this.usermove = new Vec2();
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(8);
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.scene.screen];
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Rock) {
	    APP.playSound('explosion');
	    this.stop();
	}
    }
}


//  Rock
//
class Rock extends Entity {

    scene: Game;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.skin = new RectImageSource('#ff0000', new Rect(-8, -8, 16, 16));
	this.collider = this.skin.getBounds();
    }

    update() {
	super.update();
	this.movePos(this.scene.movedir.scale(4));
	if (!this.getCollider().overlaps(this.scene.screen)) {
	    this.stop();
	}
    }
}


//  Enemy
//
class Enemy extends Entity {

    scene: Game;
    target: Entity;

    constructor(scene: Game, pos: Vec2, target: Entity) {
	super(pos);
	this.scene = scene;
	this.skin = new RectImageSource('#ffff00', new Rect(-8, -8, 16, 16));
	this.collider = this.skin.getBounds();
	this.target = target;
    }

    update() {
	super.update();
	let v = this.target.pos.sub(this.pos);
	this.movePos(v.clamp(new Vec2(2,2)));
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Rock) {
	    APP.playSound('score');
	    this.stop();
	}
    }
}


//  Game
// 
class Game extends GameScene {

    scoreBox: TextBox;
    score: number;
    player: Player;
    stars: StarImageSource;
    movedir: Vec2;
    movetime: number;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.player = new Player(this, this.screen.center());
	this.player.chain(new DelayTask(2, () => { this.init(); }));
	this.stars = new StarImageSource(
	    this.screen, 100, 10,
	    [new RectImageSource('#444488', new Rect(-2,2,4,4))]);
	this.add(this.player);

	this.score = 0;
	this.updateScore();
	this.updateMove();
	this.updateEnemy();
    }

    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    update() {
	super.update();
	if (this.movetime < getTime()) {
	    this.updateMove();
	}
	if (rnd(10) == 0) {
	    let p = this.getRndPos();
	    this.add(new Rock(this, p.sub(this.movedir.scale(8))));
	}
	this.stars.move(this.movedir.scale(8));
    }

    render(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = 'rgb(0,0,0)';
	fillRect(ctx, this.screen);
	this.stars.render(ctx);
	super.render(ctx);
	this.scoreBox.render(ctx);
    }

    getRndPos() {
	if (0 < this.movedir.x) { // left -> right
	    return new Vec2(0, rnd(this.screen.height));
	} else if (this.movedir.x < 0) { // right -> left
	    return new Vec2(this.screen.x1(), rnd(this.screen.height));
	} else if (0 < this.movedir.y) { // top -> bottom
	    return new Vec2(rnd(this.screen.width), 0);
	} else {
	    return new Vec2(rnd(this.screen.width), this.screen.y1());
	}
    }

    updateMove() {
	this.movedir = new Vec2(1,0).rot90(rnd(4));
	this.movetime = getTime()+rnd(1, 5);
    }

    updateEnemy() {
	let p = this.getRndPos();
	let enemy = new Enemy(this, p.sub(this.movedir.scale(8)), this.player);
	enemy.stopped.subscribe(() => {
	    this.score++;
	    this.updateScore();
	    this.updateEnemy();
	});
	this.add(enemy);
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
