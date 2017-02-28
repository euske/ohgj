/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/entity.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///


//  Initialize the resources.
const APIKEY = 'WonderfulCheeryHedgehog';
let FONT: Font;
let SPRITES:ImageSpriteSheet;
let NEKO:ImageSource;
addInitHook(() => {
    FONT = new ShadowFont(IMAGES['font'], 'white');
    SPRITES = new ImageSpriteSheet(
	IMAGES['sprites'], new Vec2(16,16), new Vec2(8,8));
    NEKO = new HTMLImageSource(
	IMAGES['sprites'], new Rect(0,16,48,32), new Rect(-32,-16,48,32));    
});


//  Bullet
//
class Bullet extends Projectile {
    constructor(pos: Vec2) {
	super(pos);
	let bounds = new Rect(-4, -1, 8, 2);
	this.sprite.imgsrc = new RectImageSource('white', bounds)
	this.collider = bounds;
    }
}


//  Explosion
//
class Explosion extends Entity {
    constructor(pos: Vec2) {
	super(pos);
	this.sprite.imgsrc = SPRITES.get(4);
	this.lifetime = 0.2;
    }
}


//  Player
//
class Player extends Entity {

    game: Game;
    usermove: Vec2 = new Vec2();
    firing: boolean = false;
    nextfire: number = 0;	// Firing counter

    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
	this.sprite.imgsrc = NEKO;
	this.collider = this.sprite.getBounds(new Vec2());
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
	if (this.firing) {
	    if (this.nextfire == 0) {
		// Shoot a bullet at a certain interval.
		var bullet = new Bullet(this.pos);
		bullet.movement = new Vec2(8, 0);
		bullet.frame = this.game.screen;
		this.game.add(bullet);
		playSound(SOUNDS['shoot']);
		this.nextfire = 4;
	    }
	    this.nextfire--;
	}
	let terrain = this.game.terrain;
	if (terrain.findTileByCoord(terrain.isObstacle, this.sprite.getBounds())) {
	    this.die();
	}
    }

    setFire(firing: boolean) {
	this.firing = firing;
	if (!this.firing) {
	    // Reset the counter when start shooting.
	    this.nextfire = 0;
	}
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(4);
    }
    
    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	// Restrict its position within the screen.
	return [this.game.screen];
    }

    collidedWith(entity: Entity) {
	if (entity instanceof EnemyBase) {
	    this.die();
	}
    }

    die() {
	playSound(SOUNDS['explosion']);
	this.stop();
	this.chain(new Explosion(this.pos));
    }
}


//  EnemyBase
//  This class has the common methods for all enemies.
//  They can be mixed in with applyMixins().
//
class EnemyBase extends Projectile {

    killed: Signal;

    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.frame = game.screen;
	this.killed = new Signal(this);
    }
    
    collidedWith(entity: Entity) {
	if (entity instanceof Bullet) {
	    this.stop();
	    this.killed.fire();
	    this.chain(new Explosion(this.pos));
	}
    }
}


//  Enemy1
//
class Enemy1 extends EnemyBase {

    constructor(game: Game, pos: Vec2) {
	super(game, pos);
	this.sprite.imgsrc = SPRITES.get(1);
	this.collider = this.sprite.getBounds(new Vec2());
	this.movement = new Vec2(-rnd(1,8), rnd(3)-1);
    }
}


//  Enemy2
//
class Enemy2 extends EnemyBase {

    constructor(game: Game, pos: Vec2) {
	super(game, pos);
	this.sprite.imgsrc = SPRITES.get(2);
	this.collider = this.sprite.getBounds(new Vec2());
	this.movement = new Vec2(-rnd(1,4), 0);
    }

    update() {
	super.update();
	// Move wiggly vertically.
	if (rnd(4) == 0) {
	    this.movement.y = rnd(5)-2;
	}
    }
}



//  Terrain
// 
class Terrain extends TileMap {
    
    offset: number;
    cy: number;

    constructor(width: number, height: number) {
	super(16, width, height);
	this.isObstacle = ((c:number) => { return c != 0; });
	this.offset = 0;
	this.cy = 0;
    }
    
    proceed(speed: number) {
	this.offset += speed;
	if (16 <= this.offset) {
	    let dx = (this.offset % 16);
	    let dw = int((this.offset-dx)/16);
	    this.shift(-dw, 0);
	    // Generate new tiles.
	    for (let x = this.width-dw; x < this.width; x++) {
		for (let y = 0; y < this.height; y++) {
		    let c = 0;
		    if (0 < this.cy) {
			c = (y < this.cy)? 1 : 0;
		    } else if (this.cy < 0) {
			c = (this.height+this.cy <= y)? 1 : 0;
		    }
		    this.set(x, y, c);
		}
	    }
	    this.offset = dx;
	    this.cy = clamp(-this.height+1, this.cy+rnd(3)-1, this.height-1);
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	this.renderFromTopRight(
	    ctx, bx-this.offset, by+8,
	    (x,y,c) => { return (c <= 0)? null : SPRITES.get(c-1); });
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    nextenemy: number;		// Enemy spawning counter.
    score: number;
    scoreBox: TextBox;
    terrain: Terrain;
    stars: StarSprite;

    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.player = new Player(this, this.screen.center());
	this.player.chain(new DelayTask(2, () => { this.init(); }));
	this.add(this.player);
	this.terrain = new Terrain(22, 15);
	this.stars = new StarSprite(this.screen, 100);
	this.nextenemy = 0;
	this.score = 0;
	this.updateScore();
	APP.setMusic(SOUNDS['music'], 0, 32.0);
    }

    update() {
	super.update();
	this.stars.move(new Vec2(-4, 0));
	// Spawn an enemy at a random interval.
	if (this.nextenemy == 0) {
	    let pos = new Vec2(this.screen.width, rnd(this.screen.height));
	    let enemy:EnemyBase;
	    if (rnd(2) == 0) {
		enemy = new Enemy1(this, pos);
	    } else {
		enemy = new Enemy2(this, pos);
	    }
	    // Increase the score when it's killed.
	    enemy.killed.subscribe(() => {
		playSound(SOUNDS['explosion']);
		this.score++;
		this.updateScore();
	    });
	    this.add(enemy);
	    this.nextenemy = 10+rnd(20);
	}
	this.terrain.proceed(4);
	this.nextenemy--;
    }

    onButtonPressed(keysym: KeySym) {
	this.player.setFire(true);
    }
    onButtonReleased(keysym: KeySym) {
	this.player.setFire(false);
    }
    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    updateScore() {
	// Update the text in the score box.
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE:'+format(this.score)]);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,200)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.stars.render(ctx, bx, by);
	this.terrain.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }
}
