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
    FONT = new ShadowFont(APP.images['font'], 'white');
    SPRITES = new ImageSpriteSheet(
	APP.images['sprites'], new Vec2(15,20), new Vec2(8,10));
});


//  Bullet
//
class Bullet extends Projectile {

    constructor(pos: Vec2) {
	super(pos);
	let bounds = new Rect(-4, -1, 8, 2);
	this.skin = new RectImageSource('white', bounds)
	this.collider = bounds;
    }
}


//  Coin
//
class Coin extends Entity {

    constructor(pos: Vec2) {
	super(pos);
	this.skin = SPRITES.get(1);
	this.collider = this.skin.getBounds().inflate(-1,-1);
    }
}


//  Gun
//
class Gun extends Entity {

    scene: Game;
    trigger: number;

    constructor(scene: Game, pos: Vec2, delay: number) {
	super(pos);
	this.scene = scene;
	this.skin = SPRITES.get(2);
        this.trigger = getTime()+delay;
    }

    update() {
	super.update();
	if (0 < this.trigger && this.trigger < getTime()) {
	    var bullet = new Bullet(this.pos.move(0,2));
	    bullet.movement = new Vec2(-5, 0);
	    bullet.frame = this.scene.screen.inflate(50,0);
	    this.scene.add(bullet);
            this.trigger = 0;
	    APP.playSound('gun');
        }
    }
}


//  Kid
//
class Kid extends Entity {

    type: number;
    dead: boolean = false;

    constructor(pos: Vec2) {
	super(pos);
        this.type = rnd(2);
	this.skin = SPRITES.get(3+this.type*2);
	this.collider = this.skin.getBounds().inflate(-2,-3);
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Bullet) {
            entity.stop();
            if (!this.dead) {
                this.dead = true;
	        APP.playSound('dead');
	        this.skin = SPRITES.get(4+this.type*2);
            }
	}
    }
}


//  Player
//
class Player extends Entity {

    scene: Game;
    picked: Signal;
    gameover: Signal;
    alive: boolean = true;
    usermove: Vec2 = new Vec2();

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
        this.picked = new Signal(this);
        this.gameover = new Signal(this);
	this.skin = SPRITES.get(0);
	this.collider = this.skin.getBounds().inflate(-2,-2);
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
    }

    setMove(v: Vec2) {
        if (this.alive) {
	    this.usermove = v.scale(2);
        }
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.scene.screen];
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Coin) {
            entity.stop();
            this.picked.fire();
	} else if (entity instanceof Bullet) {
            entity.stop();
            this.alive = false;
            this.usermove = new Vec2();
            this.gameover.fire();
	}
    }
}


//  Game
//
class Game extends GameScene {

    player: Player;
    scoreBox: TextBox;
    score: number;
    nextCoin: number;
    nextKid: number;

    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-4,-4), FONT);
	this.player = new Player(this, this.screen.center().move(-30,10));
        this.player.picked.subscribe((e:Entity) => { this.onPicked(e); });
        this.player.gameover.subscribe((e:Entity) => { this.gameover(); });
	this.add(this.player);

        this.add(new Coin(this.screen.center().move(30,10)));
        this.nextCoin = 0;
        this.nextKid = 0;
	this.score = 0;
	this.updateScore();

	let banner = new BannerBox(
            this.screen.move(0,-20), FONT,
            ['COLLECT MONEY!!']);
	banner.lifetime = 2.0;
	banner.interval = 0.5;
	this.add(banner);
    }

    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    onPicked(entity: Entity) {
        let yay = new TextParticle(
            entity.pos.move(0,-16), new Rect(-15,-5,30,10), FONT, ['$1m'])
	yay.movement = new Vec2(0,-2);
       	yay.lifetime = 0.5;
	this.add(yay);
        this.score += 1;
        this.updateScore();
        APP.playSound('coin');
    }

    update() {
	super.update();
        let dx = lowerbound(0, this.player.pos.x-100);
        if (0 < dx) {
            this.nextCoin -= dx;
            if (this.nextCoin < 0) {
                let y = rnd(20, this.screen.height-20);
                this.add(new Coin(new Vec2(this.screen.width, y)));
                this.nextCoin += rnd(20, 50);
            }
            this.nextKid -= dx;
            if (this.nextKid < 0) {
                let y = rnd(20, this.screen.height-20);
                let w = rnd(20, 50);
                this.add(new Kid(new Vec2(this.screen.width, y)));
                this.add(new Gun(this, new Vec2(this.screen.width+w, y), rnd(1,3)));
                this.nextKid += w+rnd(50);
            }
            this.field.moveAll(new Vec2(-dx, 0));
            this.field.filterEntities((e:Entity) => {
                let bounds = e.sprite.getBounds();
                return 0 < bounds.x1();
            });
        }
    }

    render(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = 'rgb(100,80,80)';
	fillRect(ctx, this.screen);
	super.render(ctx);
	this.scoreBox.render(ctx);
    }

    gameover() {
	let banner = new BannerBox(
            this.screen.move(0,-20), FONT,
            ['STOP KILLING','YOURSELF! LOL']);
	banner.lifetime = 2.0;
	banner.interval = 0.5;
	banner.chain(new DelayTask(2, () => { this.init(); }));
	this.add(banner);
    }

    updateScore() {
	this.scoreBox.clear();
        let text = (this.score == 0)? '$0' : ('$'+this.score+'m');
	this.scoreBox.putText([text]);
    }
}
