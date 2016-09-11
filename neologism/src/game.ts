/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/entity.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///
let FONT1:Font;
let FONT2:Font;
let WHITE = new FillImageSource('#ffffff', new Rect(-8,-8,16,16));
let GREEN = new FillImageSource('#00ff00', new Rect(-8,-8,16,16));


//  Letter
//
class Letter extends Entity {

    bounds: Rect;
    text: string;

    constructor(bounds: Rect, pos: Vec2, text: string) {
	super(pos);
	this.bounds = bounds;
	this.collider = new Rect(-8,-8,16,16);
	this.text = text;
    }
    
    update() {
	super.update();
	this.movePos(new Vec2(-4, 0));
	if (this.pos.x < 0) {
	    this.stop();
	}
    }
    
    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	FONT1.renderString(ctx, this.text, bx+this.pos.x-8, by+this.pos.y-8);
    }    
}


//  Player
//
class Player extends Entity {

    scene: Game;
    usermove: Vec2;

    constructor(scene: Game, pos: Vec2) {
	super(pos);
	this.scene = scene;
	this.imgsrc = GREEN;
	this.collider = this.imgsrc.dstRect;
	this.usermove = new Vec2();
    }

    update() {
	super.update();
	this.moveIfPossible(this.usermove);
    }
    
    setMove(v: Vec2) {
	this.usermove = v.scale(8);
    }

    collidedWith(entity: Entity) {
	if (entity instanceof Letter) {
	    this.scene.pick(entity.text);
	    entity.stop();
	}
    }

    getFencesFor(range: Rect, v: Vec2, context: string) {
	return [this.scene.screen];
    }
}


//  Game
// 
class Game extends GameScene {

    player: Player;
    nextletter: number;
    stars: StarSprite;
    word: string;
    tmp: string;
    textbox: TextBox;
    
    constructor(app: App) {
	super(app);
	FONT1 = new Font(APP.images['font'], 'white', 2);
	FONT2 = new Font(APP.images['font'], 'red', 2);
    }
    
    init() {
	super.init();
	this.stars = new StarSprite(this.screen, 100);
	this.stars.imgsrc = WHITE;
	this.stars.velocity.x = -4;
	this.textbox = new TextBox(this.screen.inflate(-4,-4));
	this.textbox.font = FONT2;
	this.add(this.textbox);
	this.player = new Player(this, this.screen.center());
	this.add(this.player);
	
	this.nextletter = 0;
	this.updateWord();
    }

    updateWord() {
	let n = rnd(3,6);
	let w = '';
	for (let i = 0; i < n; i++) {
	    w += String.fromCharCode(rnd(26)+65);
	}
	this.word = w;
	this.tmp = '';
	this.updateText();
	playSound(APP.audios['gen']);
    }

    updateText() {
	this.textbox.clear();
	this.textbox.putText(['NEW WORD',this.word,this.tmp]);
    }

    tick(t: number) {
	super.tick(t);
	this.stars.tick(t);
	if (this.nextletter < t) {
	    this.nextletter = t+.1;
	    let p = new Vec2(this.screen.width, rnd(this.screen.height));
	    let letter = new Letter(this.screen, p,
				    String.fromCharCode(rnd(26)+65));
	    this.add(letter);
	}
    }

    setDir(v: Vec2) {
	this.player.setMove(v);
    }

    pick(s: string) {
	if (s == this.word.substr(this.tmp.length,1)) {
	    playSound(APP.audios['pick']);
	    this.tmp += s;
	    this.updateText();
	    if (this.tmp == this.word) {
		this.updateWord();
	    }
	} else {
	    playSound(APP.audios['hurt']);
	}
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	this.stars.render(ctx, bx, by);
	super.render(ctx, bx, by);
    }
}
