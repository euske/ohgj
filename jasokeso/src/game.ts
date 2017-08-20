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
	APP.images['sprites'], new Vec2(64,64), new Vec2(32,32));
});


//  Game
// 
class Game extends GameScene {

    textBox: TextBox;
    helpBox: TextBox;
    hplayer = 0;
    hcom = 0;
    cstep = 0;
    
    step = 0;
    next = 0;
    delay = 0;
    score = 0;
    
    init() {
	super.init();
	this.textBox = new TextBox(this.screen.resize(320,60,'n'), FONT);
	this.textBox.lineSpace = 4;
	this.helpBox = new TextBox(this.screen.resize(320,40,'s'), FONT);
	this.helpBox.putText(['1:ROCK, 2:PAPER, 3:SCISSORS'],'center','center');
	this.score = 0;
	this.step = 0;
	this.show();
    }

    update() {
	super.update();
	let t = getTime();
	if (this.next <= t) {
	    this.step++;
	    this.show();
	}
    }

    show() {
	switch (this.step) {
	case 0:
	    this.updateText(['PRESS A KEY WHEN READY.']);
	    this.next = Infinity;
	    this.hcom = 0;
	    this.hplayer = 0;
	    break;
	case 1:
	    if (this.score == 0) {
		this.delay = 0.5;
	    } else {
		this.delay = frnd(0.8)+0.4;
	    }
	    this.updateText(['1']);
	    this.next = getTime() + this.delay;
	    this.hcom = 0;
	    this.hplayer = 0;
	    APP.playSound('j0');
	    break;
	case 2:
	    this.updateText(['2']);
	    this.next = getTime() + this.delay;
	    this.hcom = 0;
	    APP.playSound('j1');
	    break;
	case 3:
	    this.updateText(['3!']);
	    this.next = getTime() + 0.5;
	    this.hcom = rnd(3)+1;
	    APP.playSound('j2');
	    break;
	case 4:
	    this.step = 0;
	    if (this.hplayer == 0) {
		this.updateText(['TOO SLOW!!','GAME OVER. SCORE: '+this.score]);
		this.score = 0;
		this.step = -1;
		this.next = getTime() + 3.0;
		APP.playSound('beep');
	    } else if (this.cstep != 3) {
		this.updateText(['TOO FAST!!','GAME OVER. SCORE: '+this.score]);
		this.score = 0;
		this.step = -1;
		this.next = getTime() + 3.0;
		APP.playSound('beep');
	    } else {
		// R...1, P...2, S...3
		if (this.hplayer == this.hcom) {
		    this.updateText(['TIE. PLAY AGAIN.']);
		    this.next = getTime() + 2.0;		    
		} else if ((this.hplayer == 1 && this.hcom == 2) ||
		      (this.hplayer == 2 && this.hcom == 3) ||
		      (this.hplayer == 3 && this.hcom == 1)) {
		    this.updateText(['YOU LOST!!','GAME OVER. SCORE: '+this.score]);
		    this.score = 0;
		    this.step = -1;
		    this.next = getTime() + 3.0;
		    APP.playSound('lost');
		} else {
		    this.score++;
		    this.updateText(['YOU WON!!','SCORE: '+this.score]);
		    this.next = getTime() + 2.0;		    
		    APP.playSound('won');
		}
	    }
	    break;
	}
    }

    judge(h: number) {
	this.hplayer = h;
	this.cstep = this.step;
    }

    onKeyPress(c: number) {
	if (this.step == 0) {
	    this.next = getTime();
	} else {
	    switch (c) {
	    case 49:
		this.judge(1);
		break;
	    case 50:
		this.judge(2);
		break;
	    case 51:
		this.judge(3);
		break;
	    }
	}
    }

    renderHand(ctx: CanvasRenderingContext2D, h: number, x:number, y:number) {
	if (h != 0) {
	    let img = SPRITES.get(h-1);
	    ctx.save();
	    ctx.translate(x, y);
	    ctx.scale(2, 2);
	    img.render(ctx);
	    ctx.restore();
	}
    }

    render(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = 'rgb(0,0,0)';
	fillRect(ctx, this.screen);
	this.renderHand(ctx, this.hplayer, 80, 120);
	this.renderHand(ctx, this.hcom, 240, 120);
    	this.textBox.render(ctx);
    	this.helpBox.render(ctx);
    }

    updateText(lines: string[]) {
	this.textBox.clear();
	this.textBox.putText(lines, 'center', 'center');
    }
}
