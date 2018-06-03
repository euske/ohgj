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
    FONT = new Font(APP.images['font'], 'white');
    SPRITES = new ImageSpriteSheet(
	APP.images['sprites'], new Vec2(16,16), new Vec2(8,8));
});


//  Thingy
//
class Thingy extends Entity {

    constructor(pos: Vec2) {
	super(pos);
        let sprite = SPRITES.get(2);
        this.sprites = [sprite];
	this.collider = sprite.getBounds();
    }
}

//  Enemy
//
class Enemy extends Entity {

    target: Entity;
    counter = 0
    movement = new Vec2();

    constructor(pos: Vec2, target: Entity) {
	super(pos);
        this.target = target;
        let sprite = SPRITES.get(3);
        this.sprites = [sprite];
	this.collider = sprite.getBounds().inflate(-2,0);
    }

    tick() {
        if (this.counter === 0) {
            this.counter = rnd(10, 20);
            this.movement = new Vec2(rnd(3)-1, rnd(3)-1);
            if (rnd(2) == 0) {
                this.movement = this.target.pos.sub(this.pos).sign();
            }
            if (this.movement.x !== 0) {
                this.scale = new Vec2(-this.movement.x, 1);
            }
        } else {
            this.counter--;
            this.movePos(this.movement);
        }
        let i = phase(this.getTime(), 0.5);
        this.sprites = [SPRITES.get(i+3)];
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.world.area];
    }
}

//  Player
//
class Player extends Entity {

    usermove: Vec2;
    picked: Signal;

    constructor(pos: Vec2) {
	super(pos);
        this.picked = new Signal(this);
        let sprite = SPRITES.get(0);
	this.collider = sprite.getBounds().inflate(-2,-4);
	this.usermove = new Vec2();
    }

    tick() {
	super.tick();
	this.moveIfPossible(this.usermove);
        let i = phase(this.getTime(), 0.5);
        this.sprites = [SPRITES.get(i)];
    }

    setMove(v: Vec2) {
	this.usermove = v.scale(4);
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.world.area];
    }

    onCollided(e:Entity) {
        if (e instanceof Thingy) {
            e.stop();
            this.picked.fire(e);
        } else if (e instanceof Enemy) {
            this.stop();
        }
    }
}


//  Game
//
class Game extends GameScene {

    player: Player;
    score: number;
    total: number;
    spawnArea: Rect;

    init() {
	super.init();
	this.player = new Player(this.world.area.center());
        this.player.picked.subscribe(() => { this.pick(); });
        this.player.stopped.subscribe(() => { this.dead(); });
	this.add(this.player);
	this.score = 0;
        this.total = 20;
        this.spawnArea = this.world.area.inflate(-16,-16);
        for (let i = 0; i < this.total; i++) {
            this.add(new Thingy(this.spawnArea.rndPt()));
        }
    }

    tick() {
	super.tick();
    }

    pick() {
        APP.playSound('pickup');
        this.score++;
        let task = new Task();
        if (this.score == this.total) {
            task.lifetime = 2.5;
            task.stopped.subscribe(() => {
                this.init();
            });
            let bannerbox = new BannerBox(
                this.world.area, FONT, ['TO BE CONTINUED...']);
            this.add(bannerbox);
            APP.playSound('ending');
        } else {
            task.lifetime = 0.5;
            task.stopped.subscribe(() => {
                APP.playSound('spawn');
                let enemy = new Enemy(this.spawnArea.rndPt(), this.player);
                this.add(enemy);
            });
        }
        this.add(task);
    }

    dead() {
        APP.playSound('dead');
        let task = new Task();
        task.lifetime = 1;
        task.stopped.subscribe(() => {
            this.init();
        });
        this.add(task);
    }

    onDirChanged(v: Vec2) {
	this.player.setMove(v);
    }

    render(ctx: CanvasRenderingContext2D) {
        let v = (this.total-this.score)/this.total;
	ctx.fillStyle = new Color(v,v,v).toString();
	fillRect(ctx, this.screen);
	super.render(ctx);
    }
}
