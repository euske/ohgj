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
let SPRITES:SimpleSpriteSheet;
let TILES:SimpleSpriteSheet;
addInitHook(() => {
    FONT = new ShadowFont(IMAGES['font'], 'white');
    SPRITES = new SimpleSpriteSheet(
	[new RectImageSource('magenta', new Rect(-4,-4, 8, 8)),
	 new RectImageSource('magenta', new Rect(-4,-4, 8, 8)),
	]);
    TILES = new SimpleSpriteSheet(
	[new RectImageSource('white', new Rect(0, 0, 8, 8)),
	 null,
	 null,
	 new RectImageSource('yellow', new Rect(0, 0, 8, 8)),
	]);
});


//  Player
//
class Player extends PlatformerEntity {

    scene: Game;
    tile: number;
    cur: number;
    pos1: Vec2;
    pos2: Vec2;
    usermove: Vec2;

    constructor(scene: Game, pos1: Vec2, pos2: Vec2) {
	super(scene.tilemap, null);
	this.scene = scene;
	this.pos1 = scene.tilemap.map2coord(pos1).center();
	this.pos2 = scene.tilemap.map2coord(pos2).center();
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.getBounds(new Vec2());
	this.usermove = new Vec2();
	this.cur = 1;
	this.pos = this.pos1;
	let p = this.tilemap.coord2map(this.pos);
	this.tile = this.tilemap.get(p.x, p.y);
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(2);
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
	if (this.pos.x % 8 == 4 && this.pos.y % 8 == 4) {
	    let p = this.tilemap.coord2map(this.pos);
	    let c = this.tilemap.get(p.x, p.y);
	    if ((c == 1 || c == 2) && c != this.tile) {
		this.flip();
	    }
	    if (c == 3) {
		this.scene.finish();
	    }
	}
    }
    
    flip() {
	switch (this.cur) {
	case 1:
	    this.pos1 = this.pos;
	    this.cur = 2;
	    this.sprite.imgsrc = SPRITES.get(1);
	    this.pos = this.pos2;
	    break;
	case 2:
	    this.pos2 = this.pos;
	    this.cur = 1;
	    this.sprite.imgsrc = SPRITES.get(0);
	    this.pos = this.pos1;
	    break;
	}
	let p = this.tilemap.coord2map(this.pos);
	this.tile = this.tilemap.get(p.x, p.y);
	playSound(SOUNDS['flip']);
    }

    canJump() {
	return false;
    }

    canFall() {
	return false;
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    tilemap: TileMap;
    finished = false;
    
    init() {
	super.init();

	let rows = 29;
	let cols = 39;
	let map = makeMatrix(rows, cols);
	for (let y = 0; y < rows; y++) {
	    for (let x = 0; x < cols; x++) {
		map[y][x] = 0;
	    }
	}
	let dirs = [new Vec2(0,1), new Vec2(0,-1), new Vec2(1,0), new Vec2(-1,0)];
	let q = [new Vec2(1,1)];
	map[1][1] = 1;
	while (0 < q.length) {
	    let i = rnd(4), j = rnd(4);
	    let z = dirs[i];
	    dirs[i] = dirs[j];
	    dirs[j] = z;
	    let k = rnd(q.length);
	    let p0 = q[k];
	    q.splice(k, 1);
	    for (let d of dirs) {
		let p1 = p0.add(d);
		let p2 = p1.add(d);
		if (0 <= p2.x && p2.x < cols &&
		    0 <= p2.y && p2.y < rows &&
		    map[p2.y][p2.x] == 0) {
		    map[p1.y][p1.x] = 1;
		    map[p2.y][p2.x] = 1;
		    q.push(p2);
		}
	    }
	}
	for (let y = 0; y < rows; y++) {
	    for (let x = 0; x < cols; x++) {
		if (map[y][x] != 0) {
		    map[y][x] = (((x+y) % 10) < 5)? 1 : 2;
		}
	    }
	}
	for (let dy = -1; dy <= +1; dy++) {
	    for (let dx = -1; dx <= +1; dx++) {
		let x = int(cols/2)+dx;
		let y = int(rows/2)+dy;
		map[y][x] = 3;		
	    }
	}
	this.tilemap = new TileMap(8, cols, rows, map);
	this.tilemap.isObstacle = ((c:number) => { return (c == 0); });
	
	this.player = new Player(this, new Vec2(1,1), new Vec2(cols-2,rows-2));
	this.add(this.player);

	APP.setMusic(SOUNDS['music']);
    }

    update() {
	super.update();
    }

    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	this.tilemap.renderFromBottomLeft(
	    ctx, bx, by, (x: number, y: number, c: number) => {
		return TILES.get(c);
	    });
	super.render(ctx, bx, by);
    }

    finish() {
	if (this.finished) return;
	this.finished = true;
	TILES.set(0, new RectImageSource('black', new Rect(0, 0, 8, 8)));
	TILES.set(1, new RectImageSource('red', new Rect(0, 0, 8, 8)));
	TILES.set(2, new RectImageSource('blue', new Rect(0, 0, 8, 8)));
	SPRITES.set(0, new RectImageSource('#0f0', new Rect(-4,-4, 8, 8)));
	SPRITES.set(1, new RectImageSource('#0ff', new Rect(-4,-4, 8, 8)));
	playSound(SOUNDS['goal']);
	this.add(new BannerBox(this.screen, FONT, ['YOU DID IT!!1', 'YAY!']));

	APP.setMusic(SOUNDS['endingoo']);
    }
}
