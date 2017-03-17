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
addInitHook(() => {
    FONT = new Font(IMAGES['font'], 'white');
});

function findpt(p: Vec2, pts: Vec2[]): number {
    for (var i = 0; i < pts.length; i++) {
        if (pts[i].equals(p)) return i;
    }
    return -1;
}

function findnear(p: Vec2, pts: Vec2[], dist: number): number {
    var mi = -1;
    var md = 0;
    for (var i = 0; i < pts.length; i++) {
        var d = pts[i].distance(p);
        if (d <= dist && (mi < 0 || d < md)) {
            mi = i;
            md = d;
        }
    }
    return mi;
}

class TextParticle extends Projectile {
    constructor(pos: Vec2, s: string) {
        super(pos);
        this.movement = new Vec2(0, -2);
        this.lifetime = 1.0;
        let text = new TextBox(new Rect(-16, 0, 32, 10), FONT);
        text.putText([s], 'center', 'center');
        this.sprite.imgsrc = text;
    }
}


//  Game
// 
class Game extends GameScene {

    scoreBox: TextBox;
    score: number;
    egg: Vec2[];
    plot: Vec2[];
    _begin = 0;
    _prev: Vec2 = null;
    _dist = 0;
    _total = 0;
    
    init() {
	super.init();
	this.scoreBox = new TextBox(this.screen.inflate(-8,-8), FONT);
	this.score = 0;
	this.updateScore();
        this.initEgg();
        this.plot = [];
    }

    initEgg() {
        this.egg = [];
        for (var i = 0; i < 100; i++) {
            var t = i*Math.PI/50;
            var x = int(Math.cos(t)*10) + 19;
            var y = int(Math.sin(t)*12) + 14;
            var p = new Vec2(x,y);
            if (findpt(p, this.egg) < 0) {
                this.egg.push(p);
            }
        }
    }

    update() {
	super.update();
    }

    onMouseDown(p: Vec2, button: number) {
        p = new Vec2(int(p.x/8), int(p.y/8));
        this._begin = Date.now();
        this._prev = p;
        this._total = 0;
        this._dist = 0;
    }

    onMouseUp(p: Vec2, button: number) {
        this._prev = null;
        if (0 < this._total) {
            var dt = Date.now() - this._begin; // 100 - 3000
            var miss = this.egg.length; // 0 - 82
            var dist = this._dist / this._total; // 0-5
            var score = int(200/dist - miss - dt*0.05);
            log(dist, miss, dt, score);
            this.score += score;
            this.updateScore();
	    if (0 < score) {
		playSound(SOUNDS['good']);
	    } else {
		playSound(SOUNDS['bad']);
	    }
            var s = (0 < score)? '+'+score : score.toString();
            this.add(new TextParticle(this.screen.center(), s));
        }
        this.plot = [];
        this.initEgg();
    }
    
    onMouseMove(p: Vec2) {
        p = new Vec2(int(p.x/8), int(p.y/8));
        if (this._prev != null && !this._prev.equals(p)) {
            this.plot.push(p);
            var i = findnear(p, this.egg, 5);
            if (0 <= i) {
                this._total++;
                this._dist += this.egg[i].distance(p);
                this.egg.splice(i, 1);
            }
            this._prev = p;
        }
    }

    renderPlot(ctx: CanvasRenderingContext2D, bx: number, by: number, pts: Vec2[]) {
        for (var p of pts) {
	    ctx.fillRect(bx+p.x*8, by+p.y*8, 8, 8);
        }
    }
    
    render(ctx: CanvasRenderingContext2D, bx: number, by: number) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(bx, by, this.screen.width, this.screen.height);
	super.render(ctx, bx, by);
	ctx.fillStyle = 'rgb(255,255,0)';
        this.renderPlot(ctx, bx, by, this.egg);
	ctx.fillStyle = 'rgb(255,0,0)';
        this.renderPlot(ctx, bx, by, this.plot);
	this.scoreBox.render(ctx);
    }

    updateScore() {
	this.scoreBox.clear();
	this.scoreBox.putText(['SCORE: '+this.score]);
    }
}
