/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/entity.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///
let WHITE = new FillImageSource('white', new Rect(-1,1,2,2));


//  Trace
// 
class Trace extends Sprite {
    
    prev: Trace;
    color: string;
    
    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.lineWidth = 2;
	ctx.strokeStyle = this.color;
	ctx.beginPath();
	if (this.prev !== null) {
	    ctx.moveTo(bx+this.prev.pos.x, bx+this.prev.pos.y);
	    ctx.lineTo(bx+this.pos.x, bx+this.pos.y);
	}
	ctx.stroke();
    }
}


//  Button
//
let HOLES = [
    new Vec2(-30,-30),
    new Vec2(+30,-30),
    new Vec2(+30,+30),
    new Vec2(-30,+30),
];
class Button extends Sprite {

    getHole(p: Vec2) {
	p = p.sub(this.pos);
	for (let c of HOLES) {
	    if (p.sub(c).len2() <= 100) {
		return c;
	    }
	}
	return null;
    }
    
    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.save();
	ctx.translate(bx+this.pos.x, by+this.pos.y);
	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.arc(0, 0, 100, 0, Math.PI*2, false);
	ctx.closePath();
	for (let c of HOLES) {
	    ctx.arc(c.x, c.y, 10, 0, Math.PI*2, true);
	    ctx.closePath();
	}
	ctx.fill();
	ctx.strokeStyle = 'gray';
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.arc(0, 0, 100, 0, Math.PI*2, false);
	ctx.closePath();
	ctx.stroke();
	for (let c of HOLES) {
	    ctx.beginPath();
	    ctx.arc(c.x, c.y, 10, 0, Math.PI*2, true);
	    ctx.closePath();
	    ctx.stroke();
	}
	ctx.restore();
    }
}



//  Game
// 
class Game extends GameScene {

    button: Button;
    prev: Trace;
    side: number;
    hole: Vec2;
    notice: TextBox;
    score: number;
    scoreBox: TextBox;

    constructor(app: App) {
	super(app);
	let font = new ShadowFont(app.images['font'], 'white');
	this.notice = new TextBox(this.screen, font);
	this.notice.putText(['PUT A THREAD INTO A HOLE!'], 'center', 'center');
	this.scoreBox = new TextBox(this.screen.move(0,16), font);
    }
    
    init() {
	super.init();
	this.button = new Button(this.screen.center());
	this.button.zOrder = 0;
	this.addObject(this.button);
	this.side = 1;
	this.hole = null;
	this.prev = null;
	this.score = 0;
	this.updateScore();
    }

    tick(t: number) {
	super.tick(t);
    }

    keydown(key:number) {
	this.init();
    }
	
    mousemove(x:number, y:number) {
	let p = new Vec2(x,y);
	let hole = this.button.getHole(p);
	if (hole !== null && this.hole !== hole) {
	    this.hole = hole;
	    this.side = -this.side;
	    playSound(APP.audios['blip']);
	    this.score++;
	    this.updateScore();
	}
	let trace = new Trace(p);
	trace.prev = this.prev;
	trace.zOrder = this.side;
	trace.color = (this.side < 0)? 'blue' : 'white';
	this.addObject(trace);
	this.prev = trace;
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	this.notice.render(ctx, bx, by);
	this.scoreBox.render(ctx, bx, by);
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText([''+this.score], 'center', 'center');
    }
}
