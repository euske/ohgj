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
	APP.images['sprites'], new Vec2(16,16), new Vec2(8,8));
});


//  Money
//
class Money extends Entity {

    constructor(pos: Vec2) {
	super(pos);
	this.skin = SPRITES.get(2);
	this.collider = this.skin.getBounds().inflate(-4,-4);
    }
}


//  Person
//
class Person extends Entity {

    world: World;
    thief: boolean;
    dir = new Vec2();

    constructor(world: World, pos: Vec2, thief: boolean) {
	super(pos);
	this.world = world;
	this.skin = SPRITES.get(rnd(2));
	this.collider = this.skin.getBounds().inflate(-2,-2);
	this.thief = thief;
    }

    update() {
	super.update();
        if (rnd(10) == 0) {
            this.dir = new Vec2(1,0).rot90(rnd(4));
        }
	this.moveIfPossible(this.dir);
    }

    collidedWith(entity: Entity) {
        if (this.thief && entity instanceof Money) {
            entity.stop();
            APP.playSound('pickup');
        }
    }

    getFencesFor(range: Rect, v: Vec2, context: string): Rect[] {
	return [this.world.window];
    }
}


//  Game
//
class Game extends GameScene {

    scoreBox: TextBox;
    score: number;
    thieves: number;
    endgame: boolean;

    init() {
	super.init();
        let area = this.screen.inflate(-16,-16);
        for (let i = 0; i < 20; i++) {
            this.add(new Money(area.rndPt()));
        }
        this.thieves = 10;
        for (let i = 0; i < 20; i++) {
            let thief = (i < this.thieves);
	    let p = new Person(this.world, area.rndPt(), thief);
	    this.add(p);
        }
	this.scoreBox = new TextBox(this.screen.inflate(-4,-4), FONT);
	this.score = 0;
	this.updateScore();
        this.world.mousedown.subscribe((world:World, sprite:Sprite, p:Vec2) => {
            if (sprite instanceof EntitySprite) {
                this.judge(sprite.entity);
            }
        });
	let banner = new BannerBox(this.screen, FONT, ['CLICK THOSE WHO TOOK MONEY!']);
	banner.lifetime = 2.0;
	banner.interval = 0.5;
	this.add(banner);
        this.endgame = false;
    }

    update() {
        super.update();
        if (this.thieves == 0 && !this.endgame) {
	    let banner = new BannerBox(this.screen, FONT, ['GOOD JOB!!1']);
	    banner.lifetime = 3.0;
            banner.stopped.subscribe(() => { this.init(); });
	    this.add(banner);
            this.endgame = true;
        }
    }

    judge(entity: Entity) {
        if (entity instanceof Person) {
            if (entity.thief) {
                this.score++;
                this.thieves--;
                APP.playSound('correct');
            } else {
                this.score--;
                APP.playSound('wrong');
            }
            entity.stop();
            let text = (entity.thief)? 'BUSTED!' : 'WRONG!';
            let particle = new TextParticle(entity.pos, FONT, text);
            particle.movement = new Vec2(0, (entity.thief)? -1 : +1);
            particle.lifetime = 0.5;
            this.add(particle);
            this.updateScore();
        }
    }

    render(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = '#404040';
	fillRect(ctx, this.screen);
	super.render(ctx);
	this.scoreBox.render(ctx);
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['THIEVES: '+this.thieves]);
	this.scoreBox.putText(['SCORE: '+this.score], 'right');
    }
}
