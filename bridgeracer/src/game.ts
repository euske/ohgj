/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
/// <reference path="entity.ts" />
/// <reference path="tilemap.ts" />
/// <reference path="text.ts" />
/// <reference path="layer.ts" />
/// <reference path="scene.ts" />
/// <reference path="app.ts" />


function isFloor(c:number) { return c == 1; }


//  Blinker
//
class Blinker extends Sprite {
    update() {
	super.update();
	this.visible = blink(this.ticks, 10);
    }
    
}

//  Player
//
class Player extends Entity {

    scene: Game;
    usermove: Vec2;

    constructor(scene: Game, pos: Vec2) {
	let bounds = pos.expand(16, 32);
	super(bounds, scene.sheet.get(0), pos.expand(14,14));
	this.scene = scene;
	this.usermove = new Vec2();
    }

    getConstraintsFor(hitbox: Rect, force: boolean) {
	return this.scene.screen;
    }
    
    update() {
	super.update();
	this.moveIfPossible(this.usermove, true);
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(4);
    }
}


//  Game
// 
class Game extends GameScene {

    sheet: SpriteSheet;
    tilemap: TileMap;
    player: Player;
    offset: Vec2;
    brx: number;
    brw: number;
    bre: number;
    brmw: number;
    score: number;
    scoreField: TextBox;
    hiscore: number;
    hiscoreField: TextBox;

    constructor(app: App) {
	super(app);
	this.sheet = new ImageSpriteSheet(app.images['sprites'], new Vec2(16, 32));
	this.scoreField = new TextBox(this.screen.inflate(-2,-2), this.app.shadowfont);
	this.hiscoreField = new TextBox(this.screen.inflate(-2,-2), this.app.shadowfont);
	this.hiscore = 0;
    }
    
    init() {
	super.init();
	let map = [] as [Int32Array];
	let w = int(this.screen.width/16);
	let h = int(this.screen.height/16)+2;
	for (let y = 0; y < h; y++) {
	    map.push(new Int32Array(w).fill(1));
	}
	this.tilemap = new TileMap(16, map);
	this.offset = new Vec2();
	
	this.player = new Player(this, this.screen.center());
	this.addObject(this.player);

	this.score = 0;
	this.brmw = w;
	this.brx = 1;
	this.brw = w-2;
	this.bre = 2;

	this.updateScore();
	this.app.set_music(this.app.audios['music'], 0, 19.1);
    }

    tick() {
	super.tick();
	if (this.player.alive) {
	    this.player.setMove(this.app.key_dir);
	    let speed = int((1.0-this.player.bounds.y/this.screen.height)*16);
	    this.score += int(lowerbound(0, Math.sqrt(speed)-2));
	    this.updateScore();
	    let b = this.player.hitbox.add(this.offset);
	    if (!this.tilemap.findTile(isFloor, b)) {
		this.app.set_music();
		this.player.die();
		playSound(this.app.audios['plunge']);
		let task = new Blinker(this.player.bounds, this.player.src);
		task.duration = 30;
		task.died.subscribe(() => { this.init(); });
		this.addObject(task);
	    }
	    this.offset.y += speed;
	    if (16 <= this.offset.y) {
		let dy = (this.offset.y % 16);
		let dh = int((this.offset.y-dy)/16);
		let w = this.tilemap.width;
		this.tilemap.scroll(0, dh);
		for (let y = 0; y < dh; y++) {
		    for (let x = 0; x < w; x++) {
			this.tilemap.set(x, y, this.bre);
		    }
		    for (let dx = 0; dx < this.brw; dx++) {
			this.tilemap.set(this.brx+dx, y, 1);
		    }
		    if (4 <= this.brw) {
			this.tilemap.set(rnd(w), y, this.bre);
		    }
		    if (rnd(10) == 0) {
			this.bre = (this.bre == 2)? 3 : 2;
		    }
		    if (rnd(10) == 0) {
			this.brw += rnd(3)-1;
			this.brw = clamp(2, this.brw, this.brmw);
			this.brx = clamp(0, this.brx, this.brmw-this.brw);
		    } else {
			this.brx += rnd(3)-1;
			this.brx = clamp(0, this.brx, this.brmw-this.brw);
		    }
		}
		this.offset.y = dy;
	    }
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	this.tilemap.renderFromTopRight(
	    ctx, bx+this.offset.x, by-32+this.offset.y, this.sheet,
	    (x,y,c) => { return (c == 1)? -1 : c; });
	this.tilemap.renderFromTopRight(
	    ctx, bx+this.offset.x, by-32+this.offset.y, this.sheet,
	    (x,y,c) => { return (c != 1)? -1 : c; });
	this.scoreField.render(ctx, bx, by);
	this.hiscoreField.render(ctx, bx, by);
	super.render(ctx, bx, by);
    }

    updateScore() {
	if (this.hiscore < this.score) {
	    this.hiscore = this.score;
	}
	this.scoreField.clear();
	this.scoreField.putText([this.score.toString()]);
	this.hiscoreField.clear();
	this.hiscoreField.putText([this.hiscore.toString()], 'right');
    }
}
