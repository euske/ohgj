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
	IMAGES['sprites'], new Vec2(8,8), new Vec2(4,4));
});
const BULLET = new FillImageSource('#222', new Rect(-1,-1,2,2));
const S_LAND = 0;
const S_CACTUS = 1;
const S_PLAYER = 2;
const S_SNAKE = 3;
const S_BANDIDO = 4;
const S_PRESENT = 5;


//  Cactus
//
class Cactus extends Entity {
    constructor(pos: Vec2) {
	super(pos);
	this.sprite.imgsrc = SPRITES.get(S_CACTUS);
	this.collider = this.sprite.getBounds(new Vec2()).inflate(-2,-2);
    }
}


//  Bullet
//
class Bullet extends Projectile {
    constructor(pos: Vec2, game: Game, movement: Vec2) {
	super(pos);
	this.sprite.imgsrc = BULLET;
	this.collider = new Rect(-2,-2,4,4);
	this.frame = game.screen;
	this.movement = movement;
    }
}


//  Present
//
class Present extends Projectile {
    constructor(pos: Vec2, game: Game, movement: Vec2) {
	super(pos);
	this.sprite.imgsrc = SPRITES.get(S_PRESENT);
	this.collider = new Rect(-2,-2,4,4);
	this.frame = game.screen;
	this.movement = movement;
    }
}


//  WorldEntity
//
class WorldEntity extends Entity {
    game: Game;

    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
    }
    
    getObstaclesFor(range: Rect, v: Vec2, context: string): Collider[] {
	let ents = this.game.layer.findEntities(
	    (e:Entity) => { return (e instanceof Cactus) },
	    null, range);
	return ents.map((e:Entity) => { return e.getCollider(); });
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.game.screen];
    }
}


//  Player
//
class Player extends WorldEntity {

    vx = 1;
    usermove: Vec2;

    constructor(game: Game, pos: Vec2) {
	super(game, pos);
	this.sprite.imgsrc = SPRITES.get(S_PLAYER);
	this.collider = this.sprite.getBounds(new Vec2()).inflate(-2,-2);
	this.usermove = new Vec2();
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
    }

    fire() {
	if (this.running) {
	    let v = new Vec2(this.vx*8, (rnd(2)*2-1)*rnd(2,4));
	    this.game.add(new Present(this.pos.move(this.vx*8,0), this.game, v));
	    playSound(SOUNDS['gun']);
	}
    }
    
    setMove(v: Vec2) {
	if (rnd(3) == 0) {
	    v = v.rot90(rnd(2)*2-1);
	}
	this.usermove = v.scale(2);
	if (v.x != 0) {
	    this.vx = v.x;
	    this.sprite.scale.x = this.vx;
	}
    }

    collidedWith(e: Entity) {
	if (e instanceof Bullet) {
	    playSound(SOUNDS['dead']);
	    this.stop();
	}
    }
}


//  Bandido
//
class Bandido extends WorldEntity {

    vx = 1;
    nextTurn = 0;
    nextFire = 0;
    movement = new Vec2(+1,0);
    
    constructor(game: Game, pos: Vec2) {
	super(game, pos);
	this.sprite.imgsrc = SPRITES.get(S_BANDIDO);
	this.collider = this.sprite.getBounds(new Vec2()).inflate(-2,-2);
    }

    fire() {
	let v = new Vec2(this.vx*8, 0);
	this.game.add(new Bullet(this.pos.move(this.vx*8,0), this.game, v));
    }
    
    update() {
	super.update();
	if (this.nextTurn == 0) {
	    this.movement = this.movement.rot90(rnd(4));
	    this.sprite.scale.x = this.movement.x;
	    this.nextTurn = rnd(1, 10);
	}
	this.nextTurn--;
	if (this.nextFire == 0) {
	    this.fire();
	    this.nextFire = rnd(20, 40);
	}
	this.nextFire--;
	if (this.movement.x != 0) {
	    this.vx = this.movement.x;
	}
	this.moveIfPossible(this.movement);
    }

    collidedWith(e: Entity) {
	if (e instanceof Present) {
	    this.game.addScore();
	    this.stop();
	} else if (e instanceof Bullet) {
	    this.stop();
	}
    }
}


//  Snake
//
class Snake extends WorldEntity {

    nextTurn = 0;
    movement = new Vec2(+1,0);
    
    constructor(game: Game, pos: Vec2) {
	super(game, pos);
	this.sprite.imgsrc = SPRITES.get(S_SNAKE);
	this.collider = this.sprite.getBounds(new Vec2()).inflate(-2,-2);
    }

    update() {
	super.update();
	if (this.nextTurn == 0) {
	    this.movement = this.movement.rot90(+1);
	    this.sprite.scale.x = this.movement.x;
	    this.nextTurn = rnd(1, 10);
	}
	this.nextTurn--;
	this.moveIfPossible(this.movement);
    }

    collidedWith(e: Entity) {
	if (e instanceof Present) {
	    this.game.addScore();
	    this.stop();
	} else if (e instanceof Bullet) {
	    this.stop();
	}
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    spawnArea: Rect;
    snakeSpawn = 0;
    bandidoSpawn = 0;
    scoreBox: TextBox;
    score: number;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-2,-2), FONT);
	this.player = new Player(this, this.screen.center());
	this.player.stopped.subscribe(() => { this.gameOver(); });
	this.add(this.player);
	
	this.spawnArea = this.screen.inflate(-8, -8);
	for (let i = 0; i < 10; i++) {
	    this.add(new Cactus(this.screen.rndpt()));
	}
	this.score = 0;
	this.updateScore();
    }

    update() {
	super.update();
	if (this.snakeSpawn == 0) {
	    this.add(new Snake(this, this.spawnArea.rndptEdge()));
	    this.snakeSpawn = rnd(20,40);
	}
	this.snakeSpawn--;
	if (this.bandidoSpawn == 0) {
	    this.add(new Bandido(this, this.spawnArea.rndptEdge()));
	    this.bandidoSpawn = rnd(20,40);
	}
	this.bandidoSpawn--;
    }

    setDir(v: Vec2) {
	this.player.setMove(v);
    }

    setAction(action: boolean) {
	if (action) {
	    this.player.fire();
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(255,255,128)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }

    gameOver() {
	this.add(new BannerBox(this.screen, FONT, ['GAME OVER!']));
	this.add(new DelayTask(2, ()=>{
	    this.init();
	}));
    }

    addScore() {
	this.score++;
	this.updateScore();
	playSound(SOUNDS['got']);
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
