///  game.ts
///


var WHITE = new DummyImageSource('white')
var RED = new DummyImageSource('red')
var GREEN = new DummyImageSource('green')


//  Bullet
//
class Bullet extends Projectile {
    constructor(frame: Rect, pos: Vec2) {
	let bounds = pos.expand(2, 8);
	super(bounds, WHITE, bounds, new Vec2(0, -8), frame);
    }

    collide(entity: Entity) {
	if (entity instanceof Obstacle) {
	    this.die();
	} else if (entity instanceof Enemy) {
	    this.die();
	    entity.die();
	}
    }
}


//  Player
//
class Player extends Entity {

    scene: Game;
    vx: number;
    shooting: boolean;

    constructor(scene: Game, pos: Vec2) {
	let bounds = pos.expand(20, 12);
	super(bounds, WHITE, bounds);
	this.scene = scene;
	this.vx = 0;
    }

    update() {
	super.update();
	this.moveIfPossible(new Vec2(this.vx*8, 0), true);
	if (this.shooting && (this.ticks % 2) == 0) {
	    var bullet = new Bullet(this.scene.screen, this.bounds.center());
	    this.scene.addObject(bullet);
	    if ((this.ticks % 4) == 0) {
		playSound(APP.audios['shoot']);
	    }
	}
    }

    getFencesFor(range: Rect, force: boolean) {
	return [this.scene.screen];
    }
}


//  Enemy
//
class Enemy extends Entity {

    scene: Game;

    constructor(scene: Game, pos: Vec2) {
	let bounds = pos.expand(16, 16);
	super(bounds, RED, bounds);
	this.scene = scene;
    }

    update() {
	super.update();
    }
}


//  Obstacle
//
class Obstacle extends Entity {

    constructor(pos: Vec2) {
	let bounds = pos.expand(32, 24);
	super(bounds, GREEN, bounds);
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    enemove: Vec2;
    score: number;
    scoreText: TextBox;
    winning: boolean;

    constructor(app: App) {
	super(app);
	this.score = 0;
	this.scoreText = new TextBox(this.screen.inflate(-4,-4), APP.font);
    }
    
    init() {
	super.init();
	this.player = new Player(this, new Vec2(this.screen.centerx(), 220));
	this.addObject(this.player);
	for (var y = 0; y < 4; y++) {
	    for (var x = 0; x < 10; x++) {
		var enemy = new Enemy(this, new Vec2(30+28*x, 10+30*y));
		this.addObject(enemy);
	    }
	}
	for (var x = 0; x < 4; x++) {
	    var obj = new Obstacle(new Vec2(60+60*x, 180));
	    this.addObject(obj);
	}
	this.enemove = new Vec2(8, 0);
	this.scoreText.clear();
	this.scoreText.putText(['EARTH SAVED: '+this.score]);
	this.winning = false;
    }

    tick() {
	super.tick();
	if (this.winning) return;
	
	var bounds: Rect = null;
	for (var i = 0; i < this.entities.length; i++) {
	    var enemy = this.entities[i];
	    if (enemy instanceof Enemy) {
		if (bounds === null) {
		    bounds = enemy.bounds;
		} else {
		    bounds = bounds.union(enemy.bounds);
		}
	    }
	}
	if (bounds === null) {
	    // no enemy - win!
	    this.score++;
	    this.winning = true;
	    var text = new TextBox(this.screen, APP.font);
	    text.putText(['EARTH SAVED!'], 'center', 'center');
	    text.lifetime = 30;
	    text.died.subscribe((obj) => { this.init(); });
	    this.addObject(text);
	    playSound(APP.audios['win']);
	} else {
	    if (this.screen.right() < bounds.right()+this.enemove.x ||
		bounds.x+this.enemove.x < 0) {
		this.enemove.x = -this.enemove.x;
		this.enemove.y = 4;
	    }
	    var v: Vec2 = this.enemove.copy();
	    if (v.y != 0) {
		v.x = 0;
		this.enemove.y = 0;
	    }
	    for (var i = 0; i < this.entities.length; i++) {
		var enemy = this.entities[i];
		if (enemy instanceof Enemy) {
		    enemy.movePos(v);
		}
	    }

	    if (180 <= bounds.bottom()) {
		// died
		this.init();
		playSound(APP.audios['dead']);
	    }
	}
    }

    setDir(v: Vec2) {
	this.player.vx = v.x;
    }

    setAction(action: boolean) {
	this.player.shooting = action;
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.scoreText.render(ctx, bx, by);
    }
}
