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


//  Rock
//
const SIZES = [1,2,3,3,4,4,4,5,5,5,5,6,6,6,6,6,7,7,7,7,7,8,8,8,8,8,9,9,9,9,9,9,9];
class Rock extends Entity {

    game: Game;
    height: number;
    steep: number;

    constructor(game: Game, pos: Vec2, height: number) {
	super(pos);
	this.game = game;
	this.height = height;
	this.steep = rnd(4, 8);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	let wh = this.game.height;
	let i = int((this.height - wh)/this.steep);
	ctx.fillStyle = 'rgb(80,80,80)';
	while (0 <= i) {
	    let size = (SIZES.length <= i)? 10 : SIZES[i];
	    size *= 4;
	    ctx.fillRect(bx-size, by+i*this.steep, size*2, this.steep);
	    i--;
	}
    }
}


//  Ice
//
class Ice extends Entity {

    game: Game;

    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
	let size = rnd(20, 50);
	this.sprite.imgsrc = new FillImageSource('white', new Vec2().expand(size, size/2));
	this.collider = this.sprite.imgsrc.dstRect;
    }
}


//  Player
//
class Player extends Entity {

    game: Game;
    usermove: Vec2;

    constructor(game: Game, pos: Vec2) {
	super(pos);
	this.game = game;
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.imgsrc.dstRect;
	this.usermove = new Vec2();
    }

    update() {
	super.update();
	this.movePos(this.usermove);
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.game.screen];
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    scoreBox: TextBox;
    score: number;
    speed = 1.0;

    wh = 0.0;
    dwh = 0.0;
    height = 0.0;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.player = new Player(this, this.screen.center());
	this.add(this.player);
	this.score = 0;
	this.updateScore();
    }

    setDir(v: Vec2) {
	this.player.usermove = v.scale(4);
    }

    update() {
	if (Math.random() < 0.03) {
	    let height = rnd(40, 80);
	    let p = new Vec2(this.screen.width, rnd(40, this.screen.height));
	    let rock = new Rock(this, p, height);
	    this.add(rock);
	}
	if (Math.random() < 0.02) {
	    let p = new Vec2(this.screen.width, rnd(40, this.screen.height));
	    let ice = new Ice(this, p);
	    this.add(ice);
	}
	for (let entity of this.layer.entities) {
	    if (entity instanceof Rock || entity instanceof Ice) {
		entity.pos.x -= this.speed;
		if (entity.pos.x < 0) {
		    entity.stop();
		}
	    }
	}
	this.dwh += ((Math.random()-0.5)*0.3-this.wh)*0.05;
	this.wh += this.dwh;
	this.height = int(this.wh * 40 + 40);
	let y = 80-this.height;
	this.player.pos.y = clamp(y, this.player.pos.y, this.screen.height-y);
	this.score++;
	this.updateScore();
	super.update();
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(200,240,255)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	ctx.fillStyle = 'rgb(0,20,80)';
	let y = 80-this.height;
	ctx.fillRect(bx, by+y, this.screen.width, this.screen.height-y);
	for (let entity of this.layer.entities) {
	    if (entity instanceof Rock) {
		if (entity.pos.y < this.player.pos.y+y) {
		    entity.render(ctx, bx+entity.pos.x, by+entity.pos.y);
		}
	    }
	}
	super.render(ctx, bx, by+y);
	for (let entity of this.layer.entities) {
	    if (entity instanceof Rock) {
		if (this.player.pos.y+y <= entity.pos.y) {
		    entity.render(ctx, bx+entity.pos.x, by+entity.pos.y);
		}
	    }
	}
	this.scoreBox.render(ctx, bx, by);
	
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
