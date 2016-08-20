/// <reference path="base/utils.ts" />
/// <reference path="base/geom.ts" />
/// <reference path="base/entity.ts" />
/// <reference path="base/text.ts" />
/// <reference path="base/scene.ts" />
/// <reference path="base/app.ts" />
///  game.ts
///


//  Thingy
//
class Thingy extends Entity {
    constructor(pos: Vec2) {
	super(pos);
	this.imgsrc = new FillImageSource('gold', new Rect(-8,-8,16,16));
	this.collider = this.imgsrc.dstRect.inflate(-2,-2);
    }

}


//  Enemy
//
class Enemy extends PlatformerEntity {

    movement: Vec2;
    
    constructor(tilemap: TileMap, pos: Vec2, color: string, movement: Vec2) {
	super(tilemap, pos);
	this.imgsrc = new FillImageSource(color, new Rect(-8,-8,16,16));
	this.collider = this.imgsrc.dstRect.inflate(-2,-2);
	this.movement = movement;
	this.jumpfunc = (vy:number, t:number) => { return vy; };
    }

    update() {
	super.update();
	let v = this.moveIfPossible(this.movement, true);
	if (!v.equals(this.movement)) {
	    this.movement = this.movement.scale(-1);
	}
    }

    getFencesFor(range: Rect, force: boolean): Rect[] {
	return [this.tilemap.bounds];
    }
}


//  Player
//
class Player extends PlatformerEntity {

    scene: Game;
    usermove: Vec2;
    good: boolean;

    constructor(scene: Game, pos: Vec2) {
	super(scene.tilemap, pos);
	this.scene = scene;
	this.imgsrc = new FillImageSource('white', new Rect(-8,-8,16,16));
	this.collider = this.imgsrc.dstRect.inflate(-2,-2);
	this.usermove = new Vec2();
	this.setJumpFunc((vy:number, t:number) => {
	    return (0 <= t && t <= 5)? -8 : vy+2;
	});
	this.good = true;
    }

    update() {
	super.update();
	if (this.good) {
	    this.moveIfPossible(this.usermove, true);
	}
    }

    collide(entity: Entity) {
	if (this.good) {
	    if (entity instanceof Thingy) {
		entity.die();
	    } else if (entity instanceof Enemy) {
		this.stop();
	    }
	}
    }
    
    setMove(v: Vec2) {
	this.usermove.x = clamp(-8, v.x, +8);
    }

    setJump(jumpend: number) {
	if (this.good) {
	    super.setJump(jumpend)
	}
    }
    
    getFencesFor(range: Rect, force: boolean): Rect[] {
	if (this.good) {
	    return [this.tilemap.bounds];
	} else {
	    return [];
	}
    }

    getObstaclesFor(range: Rect, force: boolean): Rect[] {
	if (this.good) {
	    return super.getObstaclesFor(range, force);
	} else {
	    return [];
	}
    }

    stop() {
	this.setJump(Infinity);
	this.lifetime = this.time + 2;
	this.good = false;
    }
}


//  Game
// 
class Game extends GameScene {

    tilemap: TileMap;
    player: Player;
    tiles: SpriteSheet;
    mouse: Vec2 = new Vec2();

    constructor(app: App) {
	super(app);
	this.tiles = new SimpleSpriteSheet([
	    new FillImageSource('black', new Rect(0,0,16,16)),
	    new FillImageSource('red', new Rect(0,0,16,16)),
	]);
    }
    
    init() {
	super.init();
	const MAP = [
	    "00000000000000000002",
	    "00020001001041100001",
	    "01111100000000000110",
	    "00040000130000000400",
	    "00000000000100200000",
	    "00002001100000100000",
	    "00011000000301111020",
	    "11000100000000000010",
	    "00000012000110200000",
	    "04114000110000011000",
	    "00000001000001000100",
	    "02000000030001204021",
	    "11111111011111100010",
	    "90000200000000001002",
	    "11111111111111111111",
	];
	this.tilemap = new TileMap(16, MAP.map((v:string) => { return str2array(v); }));
	this.tilemap.isObstacle = ((c:number) => { return c == 1; });
	this.tilemap.isStoppable = ((c:number) => { return c == 1; });
	this.tilemap.isGrabbable = ((c:number) => { return false; });
	this.player = new Player(this, this.screen.center());
	this.addObject(this.player);
	this.tilemap.apply((x,y,c) => {
	    let pos = this.tilemap.map2coord(new Vec2(x,y)).center();
	    switch (c) {
	    case 2:
		this.addObject(new Thingy(pos));
		this.tilemap.set(x,y,0);
		break;
	    case 3:
		this.addObject(new Enemy(this.tilemap, pos, 'purple', new Vec2(1,0)));
		this.tilemap.set(x,y,0);
		break;
	    case 4:
		this.addObject(new Enemy(this.tilemap, pos, 'green', new Vec2(0,1)));
		this.tilemap.set(x,y,0);
		break;
	    case 9:
		this.player.pos = pos;
		this.tilemap.set(x,y,0);
		break;
	    }
	    return false;
	});
	this.player.died.subscribe( (player:Player) => { this.init(); });

	let textbox = new TextBox(this.screen, APP.font);
	textbox.putText(["GET YELLOW THINGIES!"], 'center', 'center');
	textbox.lifetime = 3;
	this.addObject(textbox);
    }

    tick(t: number) {
	super.tick(t);
	let v = this.mouse.sub(this.player.pos);
	this.player.setMove(v);
	this.player.setJump(-v.y-4);
    }

    mousemove(x: number, y: number) {
	this.mouse = new Vec2(x, y);
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	this.tilemap.renderFromBottomLeft(
	    ctx, bx, by, this.tiles,
	    (x,y,c) => { return c });
	super.render(ctx, bx, by);
    }
}
