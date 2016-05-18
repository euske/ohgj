// game.ts

let APP:App;
let SPRITES:SpriteSheet;
const MAP = [
    "11111111111111111111",
    "10040000100000000501",
    "10111000100150011101",
    "14100000000101000101",
    "10100111110111000101",
    
    "10000000020001110001",
    "10011501100001000501",
    "11100001104011010001",
    "10000100000000010111",
    "10000100010001005001",
    
    "10100111110011000101",
    "10150400000010000101",
    "10111001001110011101",
    "10000000040000004001",
    "11111111111111111111",
];


//  Explosion
//
class Explosion extends Sprite {
    constructor(bounds: Rect) {
	super(bounds, SPRITES.get(6));
	this.lifetime = 15;
    }
}


//  Player
//
class Player extends Entity {

    pos: Vec2;
    tilemap: TileMap;

    constructor(tilemap: TileMap, pos: Vec2) {
	let bounds = tilemap.map2coord(pos);
	super(bounds, SPRITES.get(2), bounds);
	this.tilemap = tilemap;
	this.pos = pos;
    }

    update() {
	super.update();
	let b = blink(this.ticks, 40);
	this.imgsrc = SPRITES.get(b? 2 : 3);
    }

    move(v: Vec2) {
	let p = this.pos.add(v);
	if (this.tilemap.get(p.x, p.y) != 1) {
	    this.pos = p;
	    this.bounds = this.tilemap.map2coord(this.pos);
	    this.hitbox = this.bounds;
	    playSound(APP.audios['step']);
	}
    }

    collide(entity: Entity) {
	if (entity instanceof Prey) {
	    log(entity);
	    entity.die();
	}
    }
}


//  PlanMap
//
const DIRS = [new Vec2(-1,0), new Vec2(+1,0), new Vec2(0,-1), new Vec2(0,+1)];
class PlanMap {

    tilemap: TileMap;
    map: Int32Array[];
    pts: Vec2[];
    
    constructor(tilemap: TileMap) {
	this.tilemap = tilemap;
	this.map = new Array(tilemap.height);
	for (let y = 0; y < this.map.length; y++) {
	    this.map[y] = new Int32Array(tilemap.width);
	}
	this.pts = null;
    }

    get(x: number, y: number) {
	return this.map[y][x];
    }
    
    update(origin: Vec2) {
	for (let y = 0; y < this.map.length; y++) {
	    let row = this.map[y];
	    for (let x = 0; x < row.length; x++) {
		row[x] = (this.tilemap.get(x, y) == 0)? 99999 : 0;
	    }
	}
	let q:Vec2[] = [origin];
	this.map[origin.y][origin.x] = 0;
	for (let i = 0; i < q.length; i++) {
	    let p0 = q[i];
	    let cost = this.map[p0.y][p0.x]+1;
	    for (let j = 0; j < DIRS.length; j++) {
		let p1 = p0.add(DIRS[j]);
		if (cost < this.map[p1.y][p1.x]) {
		    this.map[p1.y][p1.x] = cost;
		    q.push(p1);
		}
	    }
	}
	q.sort((a:Vec2, b:Vec2) => {
	    return this.map[a.y][a.x] - this.map[b.y][b.x];
	});
	this.pts = q;
    }
}


//  Prey
//
class Item {
    cost: number;
    next: Vec2;
    constructor(cost: number=0, next: Vec2=null) {
	this.cost = cost; this.next = next; 
    }
}
class Prey extends Entity {

    planmap: PlanMap;
    tilemap: TileMap;
    pos: Vec2;
    c: number;
    map: Item[][];

    constructor(planmap: PlanMap, tilemap: TileMap, pos: Vec2, c: number) {
	let bounds = tilemap.map2coord(pos);
	super(bounds, SPRITES.get(c), bounds);
	this.planmap = planmap;
	this.tilemap = tilemap;
	this.pos = pos;
	this.c = c;
	this.tilemap.set(this.pos.x, this.pos.y, this.c);
	
	this.map = new Array(this.tilemap.height);
	for (let y = 0; y < this.map.length; y++) {
	    let row = new Array(this.tilemap.width);
	    for (let x = 0; x < row.length; x++) {
		row[x] = new Item();
	    }
	    this.map[y] = row;
	}
    }

    die() {
    	this.tilemap.set(this.pos.x, this.pos.y, 0);
	super.die();
    }

    move() {
	for (let y = 0; y < this.map.length; y++) {
	    let row = this.map[y];
	    for (let x = 0; x < row.length; x++) {
		let item = row[x];
		item.cost = this.planmap.get(x,y); item.next = null;
	    }
	}
	let pts = this.planmap.pts;
	for (let i = 0; i < pts.length; i++) {
	    let p0 = pts[i];
	    if (this.tilemap.get(p0.x, p0.y) != 0) continue;
	    let cost = this.map[p0.y][p0.x].cost;
	    for (let i = 0; i < DIRS.length; i++) {
		let p1 = p0.add(DIRS[i]);
		let item = this.map[p1.y][p1.x];
		if (item.cost < cost) {
		    item.cost = cost;
		    item.next = p0;
		}
	    }
	}

	let p = this.map[this.pos.y][this.pos.x].next;
	if (p !== null) {
	    this.tilemap.set(this.pos.x, this.pos.y, 0);
	    this.pos = p;
	    this.bounds = this.tilemap.map2coord(this.pos);
	    this.hitbox = this.bounds;
	    this.tilemap.set(this.pos.x, this.pos.y, this.c);
	}
    }
}


//  Game
// 
class Game extends GameScene {

    tilemap: TileMap;
    planmap: PlanMap;
    player: Player;
    score: number;
    timeleft: number;
    score_text: TextBox;
    timeleft_text: TextBox;

    constructor(app: App) {
	super(app);
	APP = app;
	SPRITES = new ImageSpriteSheet(app.images['sprites'], new Vec2(16,16));
    }
    
    init() {
	super.init();
	this.tilemap = new TileMap(16, MAP.map((v:string) => { return str2array(v); }));
	this.planmap = new PlanMap(this.tilemap);
	this.tilemap.isObstacle = ((c:number) => { return c == 1; });
	this.tilemap.apply((x:number, y:number, c:number) => {
	    switch (c) {
	    case 2:
		this.player = new Player(this.tilemap, new Vec2(x,y));
		this.addObject(this.player);
		this.tilemap.set(x, y, 0);
		break;
	    case 4:
	    case 5:
		let obj = new Prey(this.planmap, this.tilemap, new Vec2(x,y), c);
		obj.died.subscribe((entity) => { this.addScore(entity); });
		this.addObject(obj);
		break;
	    }
	    return false;
	});
	this.score = 0;
	this.timeleft = 30;
	this.score_text = new TextBox(this.screen.inflate(-4,-4), APP.shadowfont);
	this.timeleft_text = new TextBox(this.screen.inflate(-4,-4), APP.shadowfont);
	this.addObject(this.score_text);
	this.addObject(this.timeleft_text);
	this.updateStatus();
    }

    set_dir(v: Vec2) {
	if (v.isZero()) return;
	if (this.timeleft == 0) {
	    this.init();
	    return;
	}
	this.player.move(v);
	this.layer.checkCollisions();
	this.planmap.update(this.player.pos);
	for (let i = 0; i < this.entities.length; i++) {
	    let entity = this.entities[i];
	    if (entity instanceof Prey) {
		(entity as Prey).move();
	    }
	}
	this.timeleft--;
	this.updateStatus();
	if (this.timeleft == 0) {
	    playSound(APP.audios['expl']);
	    this.addObject(new Explosion(this.player.bounds));
	    this.player.die();
	    let textbox = new TextBox(this.screen, APP.shadowfont);
	    textbox.putText(['GAME OVER'],'center','center');
	    this.addObject(textbox);
	}
    }

    updateStatus() {
	this.score_text.clear();
	this.score_text.putText(['SCORE:'+format(this.score)]);
	this.timeleft_text.clear();
	this.timeleft_text.putText(['TIME:'+format(this.timeleft)], 'right');
    }

    addScore(entity: Entity) {
	playSound(APP.audios['expl']);
	this.score++;
	this.timeleft = 30;
	this.updateStatus();
	this.addObject(new Explosion(entity.bounds));
    }
    
    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	this.tilemap.renderFromBottomLeft(
	    ctx, bx, by, SPRITES,
	    (x,y,c) => { return (c == 1)? 1 : 0; });
	super.render(ctx, bx, by);
    }
}
