/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///


//  Initialize the resources.
let FONT: Font;
addInitHook(() => {
    FONT = new Font(IMAGES['font'], 'white');
});

function getRGB(c: number) {
    let r = (c >> 16) & 0xff;
    let g = (c >> 8) & 0xff;
    let b = (c >> 0) & 0xff;
    return 'rgb('+r+','+g+','+b+')';
}


//  Game
// 
class Game extends GameScene {

    scoreBox: TextBox;
    infoBox: TextBox;
    orig: Int32Array[];
    copy: Int32Array[];
    paint: boolean;
    color: number;
    nextColor: number;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.infoBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	let img = IMAGES['orig'];
	this.orig = image2array(img);
	for (let y = 0; y < img.height; y++) {
	    for (let x = 0; x < img.width; x++) {
		let c = this.orig[y][x];
		let r = (c >> 16) & 0xff;
		let g = (c >> 8) & 0xff;
		let b = (c >> 0) & 0xff;
		r = clamp(0, r+rnd(-9, 9), 255);
		g = clamp(0, g+rnd(-9, 9), 255);
		b = clamp(0, b+rnd(-9, 9), 255);
		this.orig[y][x] = (r << 16) | (g << 8) | b;
	    }
	}
	this.color = 0xffffff;
	this.copy = range(img.height).map(() => {
	    let a = new Int32Array(img.width);
	    a.fill(this.color);
	    return a;
	});
	this.updateColor();
	this.updateScore();
	APP.setMusic(SOUNDS['fake'], MP3_GAP, 5.3);
    }

    onMouseDown(p: Vec2) {
	this.paint = true;
	this.putPix(p);
    }
    onMouseMove(p: Vec2) {
	if (this.paint) {
	    this.putPix(p);
	}
    }
    onMouseUp(p: Vec2) {
	this.paint = false;
    }

    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'white';
	ctx.strokeRect(bx+4, by+4, 208, 208);
	ctx.strokeRect(bx+260, by+4, 208, 208);
	ctx.strokeRect(bx+220, by+96, 32, 32);
	ctx.fillStyle = getRGB(this.color);
	ctx.fillRect(bx+224, by+100, 24, 24);
	this.renderImg(ctx, this.orig, bx+8, by+8);
	this.renderImg(ctx, this.copy, bx+264, by+8);
	super.render(ctx, bx, by);
	this.scoreBox.render(ctx);
	this.infoBox.render(ctx);
    }

    renderImg(ctx: CanvasRenderingContext2D, img: Int32Array[], bx: number, by: number) {
	for (let y = 0; y < img.length; y++) {
	    let row = img[y];
	    for (let x = 0; x < row.length; x++) {
		let c = row[x];
		ctx.fillStyle = getRGB(c);
		ctx.fillRect(bx+10*x, by+10*y, 10, 10);
	    }
	}
    }

    putPix(p: Vec2) {
	let x = int((p.x-264)/10);
	let y = int((p.y-8)/10);
	if (0 <= y && y < this.copy.length) {
	    let row = this.copy[y];
	    if (0 <= x && x < row.length) {
		row[x] = this.color;
		this.updateScore();
	    }
	}
    }

    update() {
	super.update();
	let t = int(Date.now()/1000);
	let dt = this.nextColor - t;
	this.infoBox.clear();
	this.infoBox.putText(['NEXT COLOR CHANGES IN '+dt+'...'], 'center', 'bottom');
	if (dt <= 0) {
	    this.updateColor();
	}
    }

    updateColor() {
	let r = rnd(256);
	let g = rnd(256);
	let b = rnd(256);
	this.color = (r << 16) | (g << 8) | (b << 0);
	this.nextColor = int(Date.now()/1000) + rnd(3,7);
	playSound(SOUNDS['put']);
    }
    
    updateScore() {
	let n = 0;
	let m = 0;
	for (let y = 0; y < this.copy.length; y++) {
	    let src = this.orig[y];
	    let dst = this.copy[y];
	    for (let x = 0; x < src.length; x++) {
		let c0 = src[x];
		let c1 = dst[x];
		let dr = Math.abs(((c0 >> 16) & 0xff) - ((c1 >> 16) & 0xff));
		let dg = Math.abs(((c0 >> 8) & 0xff) - ((c1 >> 8) & 0xff));
		let db = Math.abs(((c0 >> 0) & 0xff) - ((c1 >> 0) & 0xff));
		let d = Math.max(dr, dg, db);
		n++;
		m += (120-clamp(20, d, 120)) / 100;
	    }
	}
	let score = int(100*m/n);
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+score+'%'], 'right', 'bottom');
    }
}
