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
let RED: Font;
let SPRITES:ImageSpriteSheet;
addInitHook(() => {
    FONT = new Font(APP.images['font'], 'yellow');
    RED = new Font(APP.images['font'], 'red');
    SPRITES = new ImageSpriteSheet(
	APP.images['sprites'], new Vec2(16,16), new Vec2(8,8));
});


//  Lane
//
class Lane extends Sprite {

    textBox: TextBox = null;
    frame: Rect;
    carx: number;
    carspeed: number;
    roadx: number;
    roadspeed: number;
    step: number;
    speed: number;
    focused = false;
    selected = false;

    constructor(frame: Rect) {
	super();
	this.frame = frame;
	this.carx = rnd(this.frame.width);
	this.carspeed = rnd(-4, 20);
	this.roadx = 0;
	this.roadspeed = -rnd(20);
	this.step = rnd(30, 100);
	this.speed = int(this.carspeed - this.roadspeed);
    }

    showSpeed(font: Font) {
	this.textBox = new TextBox(this.frame.move(8,8), font);
	this.textBox.putText([''+this.speed]);
    }

    getPos(): Vec2 {
	return this.frame.topLeft();
    }

    mouseSelectable(p: Vec2): boolean {
	return this.frame.containsPt(p);
    }
	
    renderImage(ctx: CanvasRenderingContext2D) {
	let highlight = this.focused || this.selected;
	ctx.save();
	if (highlight) {
	    ctx.fillStyle = 'white';
	    ctx.fillRect(0, 0, this.frame.width, this.frame.height);
	}
	ctx.strokeStyle = highlight? 'black' : 'white';
	ctx.lineWidth = 2;
	ctx.strokeRect(0, 0, this.frame.width, this.frame.height);
	ctx.beginPath();
	ctx.rect(0, 0, this.frame.width, this.frame.height);
	ctx.clip();
	ctx.beginPath();
	ctx.lineWidth = 1;
	let x = -this.step+this.roadx;
	while (x < this.frame.width+this.step) {
	    ctx.moveTo(x, 20.5);
	    ctx.lineTo(x+this.step/2, 20.5);
	    x += this.step;
	}
	ctx.stroke();
	ctx.translate(this.carx, 12);
	let car = highlight? SPRITES.get(1) : SPRITES.get(0);
	car.render(ctx);
	ctx.restore();
    }
    
    update() {
	this.carx = fmod(this.carx + this.carspeed, this.frame.width);
	this.roadx = fmod(this.roadx + this.roadspeed, this.step);
    }
}


//  Game
// 
class Game extends GameScene {

    lanes: Lane[];
    fastest: number;

    init() {
	super.init();
	this.lanes = [];
	this.fastest = -999;
	for (let i = 0; i < 6; i++) {
	    let frame = new Rect(0, i*40, this.screen.width, 40);
	    let lane = new Lane(frame.inflate(-2, -2));
	    this.fastest = Math.max(this.fastest, lane.speed);
	    this.layer.addSprite(lane);
	    this.lanes.push(lane);
	}
	log(this.fastest);
	this.camera.clicked.subscribe((_, sprite: Sprite) => {
	    this.choose(sprite as Lane);
	});
    }

    update() {
	super.update();
	for (let lane of this.lanes) {
	    lane.focused = (lane == this.camera.mouseFocus);
	    lane.update();
	}
    }

    render(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = 'rgb(0,0,0)';
	fillRect(ctx, this.screen);
	super.render(ctx);
	for (let lane of this.lanes) {
	    if (lane.textBox !== null) {
		lane.textBox.render(ctx);
	    }
	}
    }

    choose(lane: Lane) {
	log(lane);
	if (this.fastest == lane.speed) {
	    APP.playSound('correct');
	} else {
	    APP.playSound('wrong');
	}
	lane.selected = true;
	for (let lane of this.lanes) {
	    lane.showSpeed((this.fastest == lane.speed)? RED : FONT);
	}
	this.tasklist.add(new DelayTask(3, () => { this.init(); }));
    }
}
