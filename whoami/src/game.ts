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
	IMAGES['sprites'], new Vec2(16,16), new Vec2(8,8));
});


//  Soul
// 
class Soul extends Entity {
    
    scene: Game;
    lastmove: Vec2;
    usermove: Vec2;
    
    n = 0;
    cycle = 0;
    d = 0;
    offset = 0;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.sprite.imgsrc = SPRITES.get(0);
	this.collider = this.sprite.getBounds(new Vec2());
	this.lastmove = new Vec2();
	this.usermove = new Vec2();
	this.d = Math.random()*0.3+0.3;
	this.offset = Math.random();
    }

    update() {
	super.update();
	this.sprite.imgsrc = SPRITES.get(this.n+this.cycle);
	this.movePos(this.usermove);
	this.pos = this.scene.screen.modPt(this.pos);
	if (!this.lastmove.isZero()) {
	    this.cycle = phase(getTime()+this.offset, this.d);
	}
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(4);
	this.lastmove = v.copy();
	this.setHeadings(v);
    }
    
    setHeadings(v: Vec2) {
	if (v.x < 0) {
	    this.n = 0;
	    this.sprite.scale.x = -1;
	} else if (0 < v.x) {
	    this.n = 0;
	    this.sprite.scale.x = +1;
	} else if (v.y < 0) {
	    this.n = 4;
	    this.sprite.scale.x = +1;
	} else if (0 < v.y) {
	    this.n = 2;
	    this.sprite.scale.x = +1;
	}
    }
}


//  Player
//
class Player extends Soul {

    collidedWith(entity: Entity) {
	if (entity instanceof Home) {
	    this.scene.endGame();
	}
    }
}


//  LostSoul
//
const DIRS = [new Vec2(1,0), new Vec2(-1,0), new Vec2(0,1), new Vec2(0,-1)];
class LostSoul extends Soul {
    setMove(v: Vec2) {
	if (!v.isZero() && Math.random() < 0.1) {
	    v = choice(DIRS);
	}
	super.setMove(v);
    }
}


//  Home
//
class Home extends Entity {
    constructor(pos: Vec2) {
	super(pos);
	this.sprite.imgsrc = SPRITES.get(6);
	this.collider = this.sprite.getBounds(new Vec2());
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    souls: Soul[];
    ended = false;
    
    init() {
	super.init();
	let range = this.screen.inflate(-10,-10);
	let home = new Home(range.rndPt());
	this.add(home);
	this.player = new Player(this, range.rndPt());
	this.add(this.player);
	this.souls = [this.player];
	for (let i = 0; i < 30; i++) {
	    let soul = new LostSoul(this, range.rndPt());
	    this.add(soul);
	    this.souls.push(soul);
	}
	let banner = new BannerBox(
	    this.screen, FONT,
	    ['FIND YOUR HOME.']);
	    banner.lifetime = 2.0;
	    banner.interval = 0.5;
	this.add(banner);
	APP.setMusic(SOUNDS['music'], MP3_GAP, 5.3);
    }

    update() {
	super.update();
    }

    onDirChanged(v: Vec2) {
	for (let soul of this.souls) {
	    soul.setMove(v);
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
    }

    endGame() {
	if (!this.ended) {
	    this.ended = true;
	    playSound(SOUNDS['goal']);
	    let banner = new BannerBox(
		this.screen, FONT,
		['YOU DID IT!!1']);
	    banner.interval = 0.5;
	    this.add(banner);
	}
    }
}
