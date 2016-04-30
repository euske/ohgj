/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
/// <reference path="entity.ts" />
/// <reference path="text.ts" />
/// <reference path="layer.ts" />
/// <reference path="scene.ts" />
/// <reference path="app.ts" />



//  WorldObject
//
class WorldObject {
    
    scene: Game;
    
    getConstraintsFor(hitbox: Rect, force: boolean) {
	return this.scene.screen;
    }
    
}


//  Cloud
//
class Cloud extends Sprite {

    scene: Game;
    speed: number;
    
    constructor(scene: Game, pos: Vec2) {
	let bounds = new Rect(pos.x, pos.y-32, 64, 64);
	super(bounds, scene.sheet.get(4));
	this.scene = scene;
	if (rnd(2) == 0) {
	    this.zorder = -1;
	    this.speed = 2;
	} else {
	    this.zorder = +2;
	    this.speed = 4;
	}
    }

    update() {
	super.update();
	this.bounds.x -= this.speed;
	if (!this.bounds.overlap(this.scene.screen)) {
	    this.die();
	}
    }
}


//  Mansion
// 
class Mansion extends Entity {

    scene: Game;
    dy: number;
    color1: string;
    color2: string;
    
    constructor(scene: Game, bounds: Rect, dy: number) {
	super(bounds, null, bounds);
	this.scene = scene;
	this.dy = dy;
	if (rnd(2) == 0) {
	    this.color1 = 'rgb(128,128,128)';
	    this.color2 = 'rgb(255,255,255)';
	} else {
	    this.color1 = 'rgb(220,220,255)';
	    this.color2 = 'rgb(64,64,64)';
	}
    }

    update() {
	super.update();
	this.bounds.x -= this.scene.speed;
	this.hitbox.x -= this.scene.speed;
	if (!this.bounds.overlap(this.scene.screen)) {
	    this.die();
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	let w = this.bounds.width;
	let h = this.bounds.height;
	bx += this.bounds.x;
	by += this.bounds.y;
	ctx.fillStyle = this.color1;
	ctx.fillRect(bx, by, w, h);
	ctx.strokeStyle = this.color2;
	let h0 = (0 < this.dy)? 2 : 0;
	let h1 = (0 < this.dy)? h : h-2;
	for (let dx = 2; dx < w; dx += 4) {
	    ctx.beginPath();
	    ctx.moveTo(bx+dx+.5, by+h0);
	    ctx.lineTo(bx+dx+.5, by+h1);
	    ctx.stroke();
	}
    }
}


//  Player
//
class Player extends Entity {

    scene: Game;
    usermove: Vec2;
    health: number;
    invuln: number;

    constructor(scene: Game, pos: Vec2) {
	let bounds = pos.expand(64, 64);
	super(bounds, scene.sheet.get(0), bounds.inflate(-5, -2));
	this.scene = scene;
	this.health = 3;
	this.invuln = 0;
	this.usermove = new Vec2();
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove, true);
	if (0 < this.invuln) {
	    this.invuln--;
	    this.visible = blink(this.ticks, 10);
	} else {
	    this.visible = true;
	    if (this.health <= 0) {
		this.die();
	    }
	}
    }
    
    collide(entity: Entity) {
	if (0 < this.invuln) return;
	if (entity instanceof Mansion) {
	    this.scene.crash();
	    this.health--;
	    this.src = this.scene.sheet.get(3-this.health);
	    this.invuln = 30;
	}
    }

    setMove(v: Vec2) {
	if (this.health <= 0) {
	    this.usermove.x = 0;
	    this.usermove.y += 1;
	} else {
	    this.usermove = v.scale(4);
	}
    }
}
applyMixins(Player, [WorldObject]);


//  Game
// 
class Game extends GameScene {

    player: Player;
    sheet: SpriteSheet;
    speed: number;

    score: number;
    scoreField: TextBox;
    hiscore: number;
    hiscoreField: TextBox;
    
    constructor(app: App) {
	super(app);
	this.sheet = new ImageSpriteSheet(app.images['sprites'], new Vec2(32,32));
	this.scoreField = new TextBox(this.screen.inflate(-2,-2), this.app.shadowfont);
	this.hiscoreField = new TextBox(this.screen.inflate(-2,-2), this.app.shadowfont);
	this.hiscore = 0;
    }
    
    init() {
	super.init();
	this.player = new Player(this, this.screen.center());
	this.player.died.subscribe(() => { this.init(); });
	this.addObject(this.player);

	// show a banner.
	let textbox = new TextBox(this.screen, this.app.shadowfont);
	textbox.linespace = 2;
	textbox.duration = 70;
	textbox.putText(['MAKE AMERICA GREAT AGAIN!!1'], 'center', 'center');
	textbox.update = (() => { textbox.visible = blink(textbox.ticks, 15); });
	this.addObject(textbox);

	this.speed = 4;
	this.score = 0;
	this.updateScore();
	
	this.app.set_music(this.app.audios['music'], 0, 10.6);
    }

    tick() {
	super.tick();
	this.player.setMove(this.app.key_dir);
	if (rnd(10) == 0) {
	    let obj = new Cloud(this, new Vec2(this.screen.right(), rnd(this.screen.height)));
	    this.addObject(obj);
	}
	if (rnd(20) == 0) {
	    let dy = (rnd(2) == 0)? +1 : -1;
	    let w = rnd(32, 64);
	    let h = rnd(120);
	    let rect = new Rect(this.screen.right(),
				(0<dy)? this.screen.bottom()-h : 0, w, h);
	    let obj = new Mansion(this, rect, dy);
	    this.addObject(obj);
	}
	this.layer.checkCollisions();

	this.score++;
	this.updateScore();
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,200,255)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.scoreField.render(ctx, bx, by);
	this.hiscoreField.render(ctx, bx, by);
    }

    crash() {
	playSound(this.app.audios['crash']);
    }
    
    updateScore() {
	if (this.hiscore < this.score) {
	    this.hiscore = this.score;
	}
	this.scoreField.clear();
	this.scoreField.putText(['SUPPORTERS: '+this.score]);
	this.hiscoreField.clear();
	this.hiscoreField.putText(['HISCORE: '+this.hiscore], 'right');
    }
}
