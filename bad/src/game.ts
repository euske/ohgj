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
	IMAGES['sprites'], new Vec2(32,32), new Vec2(0,0));
});


//  Player
//
class Player extends Entity {

    scene: Game;
    usermove: Vec2;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.getBounds(new Vec2());
	this.usermove = new Vec2();
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(4);
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    scoreBox: TextBox;
    score: number;
    tilemap: TileMap;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen, FONT);
	this.player = new Player(this, this.screen.center());
	this.add(this.player);
	this.score = 0;
	this.updateScore();
	this.tilemap = new TileMap(30, 44, 44);
	for (let i = 0; i < 100; i++) {
	    let x = rnd(this.tilemap.width);
	    let y = rnd(this.tilemap.height);
	    let c = rnd(8);
	    this.tilemap.set(x, y, c);
	}
	APP.setMusic(SOUNDS['bad'], MP3_GAP, 8.5);
    }

    update() {
	super.update();
	this.layer.setCenter(this.tilemap.bounds,
			     this.player.pos.expand(80,80));
    }

    onDirChanged(v: Vec2) {
	let p = this.screen.rndPt();
	this.scoreBox.frame.x = p.x;
	this.scoreBox.frame.y = p.y;
	this.score += 1;
	this.updateScore();
	this.player.setMove(v);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	this.tilemap.renderWindowFromBottomLeft(
	    ctx, bx, by, this.layer.window,
	    (x,y,c) => { return (c==0)? null : SPRITES.get(c-1); });
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx);
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
