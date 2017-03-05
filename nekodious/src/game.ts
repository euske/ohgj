/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/entity.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/tilemap.ts" />
/// <reference path="../base/animation.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///


//  Initialize the resources.
const APIURL = 'https://dollarone.games/elympics/submitHighscore';
const APIKEY = 'WonderfulCheeryHedgehog';
let FONT: Font;
let SPRITES:ImageSpriteSheet;
let NEKO:ImageSource;
let EXPLOSION:ImageSource;
addInitHook(() => {
    FONT = new ShadowFont(IMAGES['font'], 'white');
    SPRITES = new ImageSpriteSheet(
	IMAGES['sprites'], new Vec2(16,16), new Vec2(8,8));
    NEKO = new HTMLImageSource(
	IMAGES['sprites'], new Rect(0,16,48,32), new Rect(-32,-16,48,32));    
    EXPLOSION = new HTMLImageSource(
	IMAGES['sprites'], new Rect(48,16,32,32), new Rect(-16,-16,32,32));    
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
	this.sprite.imgsrc = EXPLOSION;
	this.lifetime = 0.2;
    }
}


//  Thingy
//
class Thingy extends Entity {
    
    game: Game;
    
    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
	this.sprite.imgsrc = SPRITES.get(4);
	this.collider = this.sprite.getBounds(new Vec2()).inflate(-4,-2);
    }

    update() {
	super.update();
	this.movePos(new Vec2(this.game.speed, 0));
    }
}


//  Player
//
class Player extends Entity {

    game: Game;
    usermove: Vec2 = new Vec2();
    firing: boolean = false;
    nextfire: number = 0;

    movespeed = 2;
    firespeed = 8;

    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
	this.sprite.imgsrc = NEKO;
	this.collider = this.sprite.getBounds(new Vec2()).inflate(-8,-4);
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
	if (this.firing) {
	    if (this.nextfire == 0) {
		var bullet = new Bullet(this.pos);
		bullet.movement = new Vec2(8, 0);
		bullet.frame = this.game.screen;
		this.game.add(bullet);
		playSound(SOUNDS['shoot']);
		this.nextfire = this.firespeed;
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
	    this.nextfire = 0;
	}
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(this.movespeed);
    }
    
    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.game.screen];
    }

    collidedWith(entity: Entity) {
	if (entity instanceof EnemyBase) {
	    this.die();
	} else if (entity instanceof Thingy) {
	    entity.stop();
	    this.powerup();
	}
    }

    die() {
	playSound(SOUNDS['explosion']);
	this.stop();
	this.chain(new Explosion(this.pos));
    }

    powerup() {
	playSound(SOUNDS['powerup']);
	this.movespeed = 1+rnd(8);
	this.firespeed = 2+rnd(10);
	this.game.powerup();
    }
}


//  EnemyBase
//
class EnemyBase extends Projectile {

    game: Game;
    
    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
	this.frame = game.screen;
    }
    
    update() {
	super.update();
	this.movePos(new Vec2(this.game.speed, 0));
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Bullet) {
	    playSound(SOUNDS['explosion']);
	    this.stop();
	    this.chain(new Explosion(this.pos));
	    this.game.addScore();
	}
    }
}


//  Enemy1
//
class Enemy1 extends EnemyBase {

    constructor(game: Game, pos: Vec2) {
	super(game, pos);
	this.sprite.imgsrc = SPRITES.get(2);
	this.collider = this.sprite.getBounds(new Vec2());
	this.movement = new Vec2(-rnd(1,8), rnd(3)-1);
    }
}


//  Enemy2
//
class Enemy2 extends EnemyBase {

    constructor(game: Game, pos: Vec2) {
	super(game, pos);
	this.sprite.imgsrc = SPRITES.get(3);
	this.collider = this.sprite.getBounds(new Vec2());
	this.movement = new Vec2(-rnd(1,4), 0);
    }

    update() {
	super.update();
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
	this.isObstacle = ((c:number) => { return 0 < c; });
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
		let t = rnd(2)+1;
		for (let y = 0; y < this.height; y++) {
		    let c = 0;
		    if (0 < this.cy) {
			c = (y < this.cy)? t : 0;
		    } else if (this.cy < 0) {
			c = (this.height+this.cy <= y)? t : 0;
		    }
		    this.set(x, y, c);
		}
	    }
	    this.offset = dx;
	    this.cy = clamp(-this.height+2, this.cy+rnd(3)-1, this.height-2);
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

    scoreBox: TextBox;
    player: Player;
    terrain: Terrain;
    stars: StarSprite;
    
    score: number;
    speed: number;
    nextenemy: number;

    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.player = new Player(this, this.screen.center());
	this.player.stopped.subscribe(() => { this.gameover(); });
	this.add(this.player);
	this.terrain = new Terrain(22, 15);
	this.stars = new StarSprite(this.screen, 100);
	
	this.speed = -4;
	this.nextenemy = 0;
	this.score = 0;
	this.updateScore();
	APP.setMusic(SOUNDS['music'], 0, 32.0);
    }

    update() {
	super.update();
	this.stars.move(new Vec2(this.speed, 0));
	if (this.nextenemy == 0) {
	    this.spawnEnemy();
	    this.nextenemy = 10+rnd(20);
	} else {
	    this.nextenemy--;
	}
	this.terrain.proceed(-this.speed);
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

    spawnEnemy() {
	let pos = new Vec2(this.screen.width, rnd(this.screen.height));
	let enemy:EnemyBase;
	switch (rnd(2)) {
	case 0:
	    enemy = new Enemy1(this, pos);
	    break;
	case 1:
	    enemy = new Enemy2(this, pos);
	    break;
	}
	this.add(enemy);
	if (rnd(4) == 0) {
	    let pos = new Vec2(this.screen.width, rnd(this.screen.height));
	    this.add(new Thingy(this, pos));
	}
    }

    powerup() {
	this.speed = -(1+rnd(8));
	let banner = new BannerBox(this.screen, FONT, ['RANDOM POWERUP!!1']);
	banner.lifetime = 1.5;
	banner.interval = 0.3;
	this.add(banner);
    }

    gameover() {
	let banner = new BannerBox(this.screen, FONT, ['GAME OVER!!']);
	banner.lifetime = 1.5;
	banner.interval = 0.5;
	this.add(banner);
	this.add(new DelayTask(2, () => { this.init(); }));
	var name = 'kitty';
	var req = new XMLHttpRequest();
	req.addEventListener('load', () => { this.showHighScores(); });
	req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	req.open('POST', APIURL);
	req.send('key='+APIKEY+'&name='+name+'&score='+this.score);
    }	
    
    addScore() {
	this.score++;
	this.updateScore();
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE:'+format(this.score)]);
    }

    showHighScores() {
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(50,0,100)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.stars.render(ctx, bx, by);
	this.terrain.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }
}
