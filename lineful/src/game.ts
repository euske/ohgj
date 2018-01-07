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
    FONT = new Font(APP.images['font'], 'white');
});


//  Game
//
class Game extends Scene {

    scoreVis: boolean;
    scoreBox: TextBox;

    t0: number;
    tnext: number;
    pa: Vec2;
    pb: Vec2;
    pts: Vec2[];
    line: Vec2[];

    init() {
	super.init();
        this.scoreVis = true;
	this.scoreBox = new TextBox(this.screen, FONT);
	this.scoreBox.clear();
	this.scoreBox.putText(['DRAW A LINE!'], 'center', 'center');

        this.t0 = getTime()+2;
        this.tnext = 0;
        this.pa = this.pb = null;
        this.pts = this.line = null;
    }

    update() {
	super.update();

        let t = getTime();
        if (this.t0 <= t) {
            this.tnext = 0;
            if (this.pa !== null) {
                this.t0 = t+1;
                if (this.line != null) {
                    this.judge();
                }
                this.pa = this.pb = null;
            } else {
                this.t0 = t+3;
                let frame = this.screen.inflate(-8, -8);
                this.pa = frame.rndPt().move(0.5,0.5);
                this.pb = frame.rndPt().move(0.5,0.5);
                this.scoreVis = false;
            }
            this.pts = this.line = null;
        }

        if (this.pa !== null && this.tnext <= t) {
            this.tnext = t+1;
            APP.playSound('beep');
        }
    }

    onMouseDown(p: Vec2, button: number) {
	super.onMouseDown(p, button);
        this.pts = [p];
    }

    onMouseUp(p: Vec2, button: number) {
	super.onMouseUp(p, button);
        this.line = this.pts;
        this.pts = null;
    }

    onMouseMove(p: Vec2) {
	super.onMouseMove(p);
        if (this.pts !== null) {
            this.pts.push(p);
        }
    }

    render(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = 'rgb(0,0,0)';
	fillRect(ctx, this.screen);
	super.render(ctx);

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        if (this.pa !== null) {
            strokeRect(ctx, this.pa.expand(8,8));
        }
        if (this.pb !== null) {
            strokeRect(ctx, this.pb.expand(8,8));
        }

        if (this.pts !== null) {
            ctx.beginPath();
            ctx.lineWidth = 2;
	    ctx.strokeStyle = '#ffffff';
            for (let i = 0; i < this.pts.length; i++) {
                let p = this.pts[i];
                if (i == 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
        }

        if (this.scoreVis) {
	    this.scoreBox.render(ctx);
        }
    }

    judge() {
        let x0 = Math.min(this.pa.x, this.pb.x);
        let x1 = Math.max(this.pa.x, this.pb.x);
        let y0 = Math.min(this.pa.y, this.pb.y);
        let y1 = Math.max(this.pa.y, this.pb.y);
        let v = this.pb.sub(this.pa);
        v = v.scale(1.0/v.len());
        let score = 0;
        for (let p of this.line) {
            if (p.x < x0 || x1 < p.x || p.y < y0 || y1 < p.y) {
                score--;
            } else {
                let d = Math.abs(v.y*(p.x-this.pa.x)+v.x*(this.pa.y-p.y));
                log("p="+p+", d="+d);
                score += 2-int(d);
            }
        }
        if (0 < score) {
            APP.playSound('good');
        } else {
            APP.playSound('bad');
        }
        this.scoreVis = true;
	this.scoreBox.clear();
	this.scoreBox.putText([score.toString()], 'center', 'center');
    }
}
