// Misc. routines.

// log(...): alias of window.console.log()
const log = window.console.log.bind(window.console);

// assert(x, msg): raises an exception if the condition is not met.
function assert(x: boolean, msg="assertion error")
{
    if (!x) {
	throw new Error(msg);
    }
}

// applyMixins(class, [baseclass, ...]): create a mixin class.
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
	Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
	    derivedCtor.prototype[name] = baseCtor.prototype[name];
	});
    });
}

// fmod(x, y):
function fmod(x: number, y: number)
{
    const v = x % y;
    return (0 <= v)? v : v+y;
}

// int(x):
const int = Math.floor;

// upperbound(x, y):
const upperbound = Math.min;

// lowerbound(x, y):
const lowerbound = Math.max;

// clamp(v0, v, v1): limit the value within v0-v1.
function clamp(v0: number, v: number, v1: number)
{
    return Math.min(Math.max(v, v0), v1);
}

// sign(v): return -1, 0, +1
function sign(v: number)
{
    if (v < 0) {
	return -1;
    } else if (0 < v) {
	return +1;
    } else {
	return 0;
    }
}

// phase(t, duration, n): returns phase if t is within the on interval.
function phase(t: number, duration: number, n=2)
{
    if (duration === 0) return 0;
    return int(n*t/duration) % n;
}

// rnd(a, b): returns a random number.
function frnd(a: number, b=0)
{
    if (b < a) {
	const c = a;
	a = b;
	b = c;
    }
    return a+(Math.random()*(b-a));
}

function rnd(a: number, b=0)
{
    return int(frnd(a, b));
}

// format: pretty print a number.
function format(v: number, n=3, c=' ')
{
    let s = '';
    while (s.length < n) {
	s = (v % 10)+s;
	v = int(v/10);
	if (v <= 0) break;
    }
    while (s.length < n) {
	s = c+s;
    }
    return s;
}

// choice(a)
function choice<T>(a: T[])
{
    return a[rnd(a.length)];
}

// removeElement(a, obj): remove an element from a.
function removeElement<T>(a: T[], obj: T)
{
    const i = a.indexOf(obj);
    if (0 <= i) {
	a.splice(i, 1);
    }
    return a;
}

// removeElements(a, f): remove elements from a.
function removeElements<T>(a: T[], f: (x:T)=>boolean)
{
    for (let i = a.length-1; 0 <= i; i--) {
	if (f(a[i])) {
	    a.splice(i, 1);
	}
    }
    return a;
}

// str2array(str): converts a string to an array.
function str2array(s: string, f: (c:string)=>number=parseInt)
{
    const a = new Int32Array(s.length);
    for (let i = 0; i < s.length; i++) {
	a[i] = f(s[i]);
    }
    return a;
}

// removeChildren(node, name): remove all child nodes with the given name.
function removeChildren(node: Node, name: string)
{
    name = name.toLowerCase();
    // Iterate backwards to simplify array removal. (thanks to @the31)
    for (let i = node.childNodes.length-1; 0 <= i; i--) {
	const c = node.childNodes[i];
	if (c.nodeName.toLowerCase() === name) {
	    node.removeChild(c);
	}
    }
}

// createCanvas(width, height): create a canvas with the given size.
function createCanvas(width: number, height: number): HTMLCanvasElement
{
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

// getEdgeyContext(canvas): returns a pixellated canvas 2D context.
function getEdgeyContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D
{
    const ctx = canvas.getContext('2d');
    (ctx as any).imageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;
    return ctx;
}

// image2array(img): converts an image to 2D array.
function image2array(img: HTMLImageElement)
{
    interface ColorMap {
	[index:number]: number;
    }
    const header = 1;
    const width = img.width;
    const height = img.height;
    const canvas = createCanvas(width, height);
    const ctx = getEdgeyContext(canvas);
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, width, height).data;
    let i = 0;
    let c2v:ColorMap = {};
    for (let y = 0; y < header; y++) {
	for (let x = 0; x < width; x++, i+=4) {
	    const c = ((data[i] << 16) | (data[i+1] << 8) | data[i+2]); // RGBA
	    if (!c2v.hasOwnProperty(c.toString())) {
		c2v[c] = y*width + x;
	    }
	}
    }
    const map = new Array(height-header);
    for (let y = 0; y < height-header; y++) {
	const a = new Int32Array(width);
	for (let x = 0; x < width; x++, i+=4) {
	    const c = ((data[i] << 16) | (data[i+1] << 8) | data[i+2]); // RGBA
	    a[x] = c2v[c];
	}
	map[y] = a;
    }
    return map;
}

// drawImageScaled: draw a scaled image.
function drawImageScaled(
    ctx: CanvasRenderingContext2D,
    src: HTMLImageElement,
    sx: number, sy: number, sw: number, sh: number,
    dx: number, dy: number, dw: number, dh: number)
{
    ctx.save();
    ctx.translate(dx+((0 < dw)? 0 : -dw),
		  dy+((0 < dh)? 0 : -dh));
    ctx.scale((0 < dw)? 1 : -1,
	      (0 < dh)? 1 : -1);
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0,
		  Math.abs(dw), Math.abs(dh));
    ctx.restore();
}

// playSound(sound): play a sound resource.
function playSound(sound: HTMLAudioElement, start=0)
{
    sound.currentTime = start;
    sound.play();
}

// getKeySym(keyCode): convert directional keys to symbol.
// cf. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
enum KeySym {
    Unknown = 0,
    Left,
    Right,
    Up,
    Down,
    Action,
    Cancel,
}
function getKeySym(keyCode: number): KeySym
{
    switch (keyCode) {
    case 37:			// LEFT
    case 65:			// A
    case 72:			// H
    case 81:			// Q (AZERTY)
	return KeySym.Left;
    case 39:			// RIGHT
    case 68:			// D
    case 76:			// L
	return KeySym.Right;
    case 38:			// UP
    case 87:			// W
    case 75:			// K
	return KeySym.Up;
    case 40:			// DOWN
    case 83:			// S
    case 74:			// J
	return KeySym.Down;
    case 13:			// ENTER
    case 16:			// SHIFT
    case 32:			// SPACE
    case 90:			// Z
	return KeySym.Action;
    case 8:			// BACKSPACE
    case 27:			// ESCAPE
    case 88:			// X
	return KeySym.Cancel;
    default:
	return KeySym.Unknown;
    }
}


//  Signal: an event system
//
interface Action {
    (...params:any[]): any;
}
class Signal {

    sender: any;
    receivers: Action[] = [];
    
    constructor(sender: any) {
	this.sender = sender;
    }
	
    toString() {
	return ('<Signal('+this.sender+') '+this.receivers+'>');
    }
  
    subscribe(recv: Action) {
	this.receivers.push(recv);
    }
  
    unsubscribe(recv: Action) {
	removeElement(this.receivers, recv);
    }
  
    fire(...params: any[]) {
	for (let receiver of this.receivers) {
	    const args = Array.prototype.slice.call(arguments);
	    args.unshift(this.sender);
	    receiver.apply(null, args);
	}
    }
}


//  Color
//
class Color {

    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a=-1.0) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
    }
    
    toString() {
	if (0 <= this.a) {
	    return ('rgba('+
		    int(255*clamp(0,this.r,1))+','+
		    int(255*clamp(0,this.g,1))+','+
		    int(255*clamp(0,this.b,1))+','+
		    clamp(0,this.a,1)+')');
	} else {
	    return ('rgb('+
		    int(255*clamp(0,this.r,1))+','+
		    int(255*clamp(0,this.g,1))+','+
		    int(255*clamp(0,this.b,1))+')');
	}
    }

    setAlpha(a: number) {
	return new Color(this.r, this.g, this.b, a);
    }

}


//  ImageSource
//
class ImageSource {
    dstRect: Rect;
    
    constructor(dstRect: Rect) {
	this.dstRect = dstRect;
    }
}

class HTMLImageSource extends ImageSource {
    image: HTMLImageElement;
    srcRect: Rect;
    
    constructor(image: HTMLImageElement, srcRect: Rect, dstRect: Rect) {
	super(dstRect);
	this.image = image;
	this.srcRect = srcRect;
    }
}

class FillImageSource extends ImageSource {
    color: string;
    
    constructor(color: string, dstRect: Rect) {
	super(dstRect);
	this.color = color;
    }
}


//  SpriteSheet
// 
class SpriteSheet {
    constructor() {
    }
    
    get(x:number, y=0, origin: Vec2=null) {
	return null as ImageSource;
    }
}

class ImageSpriteSheet extends SpriteSheet {
    image: HTMLImageElement;
    size: Vec2;
    origin: Vec2;

    constructor(image: HTMLImageElement, size: Vec2, origin: Vec2=null) {
	super();
	this.image = image;
	this.size = size;
	this.origin = (origin !== null)? origin : new Vec2();
    }

    get(x:number, y=0, origin: Vec2=null) {
	origin = (origin !== null)? origin : this.origin;
	let srcRect = new Rect(x*this.size.x, y*this.size.y, this.size.x, this.size.y);
	let dstRect = new Rect(-origin.x, -origin.y, this.size.x, this.size.y);
	return new HTMLImageSource(this.image, srcRect, dstRect);
    }
}

class SimpleSpriteSheet extends SpriteSheet {
    imgsrcs: FillImageSource[];

    constructor(imgsrcs: FillImageSource[]) {
	super();
	this.imgsrcs = imgsrcs;
    }

    get(x:number, y=0, origin: Vec2=null) {
	return this.imgsrcs[x];
    }
}
