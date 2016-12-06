/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/entity.ts" />
/// <reference path="../base/tilemap.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///


//  Initialize the resources.
let FONT: Font;
let SPRITES:ImageSpriteSheet;
let TILES:ImageSpriteSheet;
addInitHook(() => {
    FONT = new Font(IMAGES['font'], 'white');
    SPRITES = new ImageSpriteSheet(
	IMAGES['sprites'], new Vec2(16,16), new Vec2(8,8));
    TILES = new ImageSpriteSheet(
	IMAGES['sprites'], new Vec2(16,16), new Vec2(0,0));
});


//  WorldObject
// 
class WorldObject extends Entity {

    scene: Game;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
    }

    getObstaclesFor(range: Rect, v: Vec2, context=null as string): Shape[] {
	let tilemap = this.scene.tilemap;
	let a:Shape[] = tilemap.getTileRects(tilemap.isObstacle, range);
	let ents = this.scene.layer.findEntities((e:Entity) => {
	    return this !== e && isIce(e) && e.getCollider().overlaps(range);
	});
	return a.concat(ents.map((e:Entity) => { return e.getCollider(); }));
    }
}


//  Ice
//
class Ice extends WorldObject {

    count = 0;
    movement = null as Vec2;

    constructor(scene: Game, pos: Vec2) {
	super(scene, pos);
	this.sprite.imgsrc = SPRITES.get(2);
	this.collider = this.sprite.getBounds(new Vec2());
    }

    update() {
	super.update();
	this.count = lowerbound(0, this.count-1);
	if (this.movement !== null) {
	    let v = this.moveIfPossible(this.movement);
	    if (v.isZero()) {
		this.movement = null;
	    }
	}
    }

    push(force: Vec2) {
	this.count += 2;
	if (this.movement === null && 10 <= this.count) {
	    playSound(SOUNDS['push']);
	    this.movement = force.scale(4);
	    this.count = 0;
	}
    }
}
function isIce(e:Entity) {
    return e instanceof Ice;
}


//  Enemy
//
class Enemy extends WorldObject {

    movement: Vec2;

    constructor(scene: Game, pos: Vec2) {
	super(scene, pos);
	this.sprite.imgsrc = SPRITES.get(2);
	this.collider = this.sprite.getBounds(new Vec2());
	this.movement = new Vec2(1,0).rot90(rnd(4));
    }

    update() {
	super.update();
	let v = this.moveIfPossible(this.movement);
	if (v.isZero()) {
	    this.movement = this.movement.rot90(rnd(3)-1);
	}
	let i = phase(this.getTime(), 0.3);
	this.sprite.imgsrc = SPRITES.get(i+12);
    }

    collidedWith(e:Entity) {
	if (isIce(e)) {
	    playSound(SOUNDS['hit']);
	    let particle = new Entity(this.pos);
	    particle.sprite.imgsrc = SPRITES.get(14);
	    particle.lifetime = 0.5;
	    this.scene.add(particle);
	    this.stop();
	}
    }
}


//  Player
//
class Player extends WorldObject {

    usermove = new Vec2();
    userdir = new Vec2();
    phase = 0;

    constructor(scene: Game, pos: Vec2) {
	super(scene, pos);
	this.collider = new Rect(-6,-6,12,12);
    }

    update() {
	super.update();
	let collider = this.getCollider().add(this.usermove);
	let ices = this.scene.layer.findEntities((e:Entity) => {
	    return isIce(e) && e.getCollider().overlaps(collider);
	});
	for (let ice of ices) {
	    (ice as Ice).push(this.usermove);
	    break;
	}
	let v = this.moveIfPossible(this.usermove);
	let pushing = false;
	if (v.isZero()) {
	    pushing = !this.usermove.isZero();
	} else {
	    this.phase = phase(this.getTime(), 0.4);
	}
	let b = 0;
	if (this.userdir.x != 0) {
	    this.sprite.scale.x = this.userdir.x;
	    if (pushing) {
		b = 5;
	    } else {
		b = 3+this.phase;
	    }
	} else {
	    this.sprite.scale.x = 1;
	    if (pushing) {
		b = ((this.userdir.y < 0)? 11 : 8)
	    } else {
		b = ((this.userdir.y < 0)? 9 : 6) + this.phase;
	    }
	}
	this.sprite.imgsrc = SPRITES.get(b);
	
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(2);
	if (!v.isZero()) {
	    this.userdir = v.copy();
	}
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    tilemap: TileMap;
    
    init() {
	super.init();
	let map = range(15).map((i:number) => { return new Int32Array(20); });
	this.tilemap = new TileMap(16, map);
	this.tilemap.isObstacle = ((c:number) => { return c == 1; });
	for (let x = 0; x < 20; x++) {
	    this.tilemap.set(x, 0, 1);
	    this.tilemap.set(x, 14, 1);
	}
	for (let y = 0; y < 15; y++) {
	    this.tilemap.set(0, y, 1);
	    this.tilemap.set(19, y, 1);
	}
	this.player = new Player(this, this.screen.center());
	this.add(this.player);
	for (let i = 0; i < 50; i++) {
	    let p = new Vec2(rnd(1,19), rnd(1,14));
	    let rect = this.tilemap.map2coord(p);
	    if (rect.overlaps(this.player.getCollider())) continue;
	    if (this.layer.hasEntity(isIce, rect)) continue;
	    let ice = new Ice(this, rect.center());
	    this.add(ice);
	}
	for (let i = 0; i < 10; i++) {
	    let p = new Vec2(rnd(1,19), rnd(1,14));
	    let rect = this.tilemap.map2coord(p);
	    if (rect.overlaps(this.player.getCollider())) continue;
	    if (this.layer.hasEntity(isIce, rect)) continue;
	    let enemy = new Enemy(this, rect.center());
	    this.add(enemy);
	}
    }

    update() {
	super.update();
    }

    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(10,20,50)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	this.tilemap.renderFromBottomLeft(
	    ctx, bx, by, TILES,
	    (x,y,c) => { return c; });
	super.render(ctx, bx, by);
    }
}
