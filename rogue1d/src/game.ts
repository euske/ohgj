/// <reference path="../base/utils.ts" />
/// <reference path="../base/geom.ts" />
/// <reference path="../base/text.ts" />
/// <reference path="../base/scene.ts" />
/// <reference path="../base/app.ts" />

///  game.ts
///


//  Initialize the resources.
let FONT: Font;
let FONT1: Font;
let FONT2: Font;
let FONT3: Font;
let FONT4: Font;
addInitHook(() => {
    FONT = new Font(APP.images['font'], 'white');
    FONT1 = new Font(APP.images['font'], 'yellow');
    FONT2 = new Font(APP.images['font'], 'cyan');
    FONT3 = new Font(APP.images['font'], '#00ff00');
    FONT4 = new Font(APP.images['font'], 'red');
});


class Thing {
    x: number;
    c: string;
    v: number;
    name: string;
    font: Font;
    constructor(x: number, c: string, v=1, name=null as string, font=null as Font) {
        this.x = x;
        this.c = c;
        this.v = v;
        this.name = name;
        this.font = font;
    }
    toString() {
        return '<'+this.c+':'+this.x+'>';
    }
}
const ENEMIES = [
    ['e','euske'],
    ['T','Tijn'],
    ['r','rnlf'],
    ['d','dollarone'],
    ['k','ratking'],
    ['v','voxel'],
    ['s','sorceress'],
    ['P','PoV'],
];

//  Game
//
class Game extends GameScene {

    textBox: TextBox;

    gameover: boolean;
    health: number;
    strength: number;
    msgs: string[];
    target: Thing;
    things: Thing[];

    init() {
	super.init();
	this.textBox = new TextBox(this.screen.inflate(0,-2), FONT); // 16x12

        this.gameover = false;
        this.health = 10;
        this.strength = 1;
        this.things = [];
        let x = 3;
        for (let i = 0; i < ENEMIES.length; i++) {
            let n = rnd(i+2);
            let v = (i+2)*(i+2);
            for (let j = 0; j < n; j++) {
                switch (rnd(3)) {
                case 0:
                    this.things.push(new Thing(x, '!', 5+rnd(v))); // potion
                    break;
                case 1:
                    this.things.push(new Thing(x, ')', 1+rnd(3))); // weapon
                    break;
                case 2:
                    this.things.push(new Thing(x, '/', 1+rnd(n*n))); // wand
                    break;
                }
                x += rnd(1,3);
            }
            let e = ENEMIES[i];
            this.things.push(new Thing(x, e[0], rnd(v/2, v), e[1], FONT2));
            x += rnd(1,3);
        }
        this.things.push(new Thing(x, '%'));
        this.target = null;
        this.msgs = ['Good luck!'];
	this.updateText();
        APP.playSound('beep');
    }

    render(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = '#000080';
	fillRect(ctx, this.screen);
	super.render(ctx);
	this.textBox.render(ctx);
    }

    onMouseDown(p: Vec2) {
        this.onKeyDown(39);     // :P
    }

    onKeyDown(keyCode: number) {
        switch (keyCode) {
        case 37:			// LEFT
        case 72:			// H
            this.move(-1);
            break;
        case 39:			// RIGHT
        case 76:			// L
            this.move(+1);
            break;
        case 32:			// SPACE
        case 88:			// X
        case 90:			// Z
            this.move(0);
            break;
        }
	this.updateText();
    }

    updateText() {
	this.textBox.clear();
	this.textBox.put(0, 0, 'HITS '+this.health);
	this.textBox.put(0, 1, 'STR  '+this.strength);
	this.textBox.put(0, 2, '----------');
	this.textBox.put(4, 3, '@', FONT1);
	this.textBox.put(0, 4, '----------');
        this.things = this.things.filter((obj) => { return (0 < obj.v); });
        for (let obj of this.things) {
            let c = (obj === this.target)? '*' : obj.c;
            let font = (obj === this.target)? FONT4 : obj.font;
	    this.textBox.put(obj.x+4, 3, c, font);
        }
        if (this.msgs !== null) {
            let font = (this.gameover)? FONT4 : FONT3;
            for (let i = 0; i < this.msgs.length; i++) {
                this.textBox.put(0, 5+i, this.msgs[i], font);
            }
        }
    }

    move(dx: number) {
        if (this.gameover) {
            this.init();
            return;
        }
        this.target = null;
        this.msgs = null;
        let ok = true;
        let hit: Thing = null;
        for (let obj of this.things) {
            if (obj.x == dx) {
                hit = obj;
                break;
            }
        }
        log("hit="+hit);
        if (hit === null) {
            APP.playSound('step');
        } else {
            switch (hit.c) {
            case '%':           // end
                this.msgs = ['Level End','Congrats!'];
                this.gameover = true;
                APP.playSound('pickup');
                break;
            case '!':           // potion
                this.health += hit.v;
                this.msgs = ['Got potion', 'HITS +'+hit.v];
                hit.v = 0;
                APP.playSound('pickup');
                break;
            case ')':           // weapon
                this.strength += hit.v;
                this.msgs = ['Got weapon', 'STR +'+hit.v];
                hit.v = 0;
                APP.playSound('pickup');
                break;
            case '/':           // wand
                for (let obj of this.things) {
                    if (obj.name !== null) {
                        if (this.target === null || obj.x < this.target.x) {
                            this.target = obj;
                        }
                    }
                }
                this.msgs = ['Wand attck', this.target.name+' -'+hit.v];
                this.target.v -= hit.v;
                hit.v = 0;
                APP.playSound('attack');
                break;
            default:            // enemy
                {
                    let dmg = rnd(hit.v);
                    this.health -= dmg;
                    hit.v -= this.strength;
                    APP.playSound('attack');
                    ok = false;
                    if (0 < hit.v) {
                        this.msgs = ['Attacked', hit.name+' -'+this.strength];
                    } else {
                        this.msgs = ['Killed', hit.name];
                        this.strength += 1;
                    }
                }
                break;
            }
        }
        if (ok) {
            for (let obj of this.things) {
                obj.x -= dx;
            }
        } else if (this.health <= 0) {
            this.health = 0;
            this.msgs = ['You died!', 'Game over!'];
            this.gameover = true;
            APP.playSound('gameover');
        }
    }
}
