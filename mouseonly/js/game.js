var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// Misc. routines.
// log(...): alias of window.console.log()
var log = window.console.log.bind(window.console);
// assert(x, msg): raises an exception if the condition is not met.
function assert(x, msg) {
    if (msg === void 0) { msg = "assertion error"; }
    if (!x) {
        throw new Error(msg);
    }
}
// applyMixins(class, [baseclass, ...]): create a mixin class.
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
// fmod(x, y):
function fmod(x, y) {
    var v = x % y;
    return (0 <= v) ? v : v + y;
}
// int(x):
var int = Math.floor;
// upperbound(x, y):
var upperbound = Math.min;
// lowerbound(x, y):
var lowerbound = Math.max;
// clamp(v0, v, v1): limit the value within v0-v1.
function clamp(v0, v, v1) {
    return Math.min(Math.max(v, v0), v1);
}
// sign(v): return -1, 0, +1
function sign(v) {
    if (v < 0) {
        return -1;
    }
    else if (0 < v) {
        return +1;
    }
    else {
        return 0;
    }
}
// phase(t, duration, n): returns phase if t is within the on interval.
function phase(t, duration, n) {
    if (n === void 0) { n = 2; }
    if (duration === 0)
        return 0;
    return int(n * t / duration) % n;
}
// rnd(a, b): returns a random number.
function frnd(a, b) {
    if (b === void 0) { b = 0; }
    if (b < a) {
        var c = a;
        a = b;
        b = c;
    }
    return a + (Math.random() * (b - a));
}
function rnd(a, b) {
    if (b === void 0) { b = 0; }
    return int(frnd(a, b));
}
// format: pretty print a number.
function format(v, n, c) {
    if (n === void 0) { n = 3; }
    if (c === void 0) { c = ' '; }
    var s = '';
    while (s.length < n) {
        s = (v % 10) + s;
        v = int(v / 10);
        if (v <= 0)
            break;
    }
    while (s.length < n) {
        s = c + s;
    }
    return s;
}
// choice(a)
function choice(a) {
    return a[rnd(a.length)];
}
// removeElement(a, obj): remove an element from a.
function removeElement(a, obj) {
    var i = a.indexOf(obj);
    if (0 <= i) {
        a.splice(i, 1);
    }
    return a;
}
// removeElements(a, f): remove elements from a.
function removeElements(a, f) {
    for (var i = a.length - 1; 0 <= i; i--) {
        if (f(a[i])) {
            a.splice(i, 1);
        }
    }
    return a;
}
// str2array(str): converts a string to an array.
function str2array(s, f) {
    if (f === void 0) { f = parseInt; }
    var a = new Int32Array(s.length);
    for (var i = 0; i < s.length; i++) {
        a[i] = f(s[i]);
    }
    return a;
}
// removeChildren(node, name): remove all child nodes with the given name.
function removeChildren(node, name) {
    name = name.toLowerCase();
    // Iterate backwards to simplify array removal. (thanks to @the31)
    for (var i = node.childNodes.length - 1; 0 <= i; i--) {
        var c = node.childNodes[i];
        if (c.nodeName.toLowerCase() === name) {
            node.removeChild(c);
        }
    }
}
// createCanvas(width, height): create a canvas with the given size.
function createCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
// getEdgeyContext(canvas): returns a pixellated canvas 2D context.
function getEdgeyContext(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    return ctx;
}
// image2array(img): converts an image to 2D array.
function image2array(img) {
    var header = 1;
    var width = img.width;
    var height = img.height;
    var canvas = createCanvas(width, height);
    var ctx = getEdgeyContext(canvas);
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, width, height).data;
    var i = 0;
    var c2v = {};
    for (var y = 0; y < header; y++) {
        for (var x = 0; x < width; x++, i += 4) {
            var c = ((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]); // RGBA
            if (!c2v.hasOwnProperty(c.toString())) {
                c2v[c] = y * width + x;
            }
        }
    }
    var map = new Array(height - header);
    for (var y = 0; y < height - header; y++) {
        var a = new Int32Array(width);
        for (var x = 0; x < width; x++, i += 4) {
            var c = ((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]); // RGBA
            a[x] = c2v[c];
        }
        map[y] = a;
    }
    return map;
}
// drawImageScaled: draw a scaled image.
function drawImageScaled(ctx, src, sx, sy, sw, sh, dx, dy, dw, dh) {
    ctx.save();
    ctx.translate(dx + ((0 < dw) ? 0 : -dw), dy + ((0 < dh) ? 0 : -dh));
    ctx.scale((0 < dw) ? 1 : -1, (0 < dh) ? 1 : -1);
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, Math.abs(dw), Math.abs(dh));
    ctx.restore();
}
// playSound(sound): play a sound resource.
function playSound(sound, start) {
    if (start === void 0) { start = 0; }
    sound.currentTime = start;
    sound.play();
}
// getKeySym(keyCode): convert directional keys to symbol.
// cf. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
var KeySym;
(function (KeySym) {
    KeySym[KeySym["Unknown"] = 0] = "Unknown";
    KeySym[KeySym["Left"] = 1] = "Left";
    KeySym[KeySym["Right"] = 2] = "Right";
    KeySym[KeySym["Up"] = 3] = "Up";
    KeySym[KeySym["Down"] = 4] = "Down";
    KeySym[KeySym["Action"] = 5] = "Action";
    KeySym[KeySym["Cancel"] = 6] = "Cancel";
})(KeySym || (KeySym = {}));
function getKeySym(keyCode) {
    switch (keyCode) {
        case 37: // LEFT
        case 65: // A
        case 72: // H
        case 81:
            return KeySym.Left;
        case 39: // RIGHT
        case 68: // D
        case 76:
            return KeySym.Right;
        case 38: // UP
        case 87: // W
        case 75:
            return KeySym.Up;
        case 40: // DOWN
        case 83: // S
        case 74:
            return KeySym.Down;
        case 13: // ENTER
        case 16: // SHIFT
        case 32: // SPACE
        case 90:
            return KeySym.Action;
        case 8: // BACKSPACE
        case 27: // ESCAPE
        case 88:
            return KeySym.Cancel;
        default:
            return KeySym.Unknown;
    }
}
var Slot = (function () {
    function Slot(sender) {
        this.receivers = [];
        this.sender = sender;
    }
    Slot.prototype.toString = function () {
        return ('<Slot(' + this.sender + ') ' + this.receivers + '>');
    };
    Slot.prototype.subscribe = function (recv) {
        this.receivers.push(recv);
    };
    Slot.prototype.unsubscribe = function (recv) {
        removeElement(this.receivers, recv);
    };
    Slot.prototype.signal = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i - 0] = arguments[_i];
        }
        for (var _a = 0, _b = this.receivers; _a < _b.length; _a++) {
            var receiver = _b[_a];
            var args = Array.prototype.slice.call(arguments);
            args.unshift(this.sender);
            receiver.apply(null, args);
        }
    };
    return Slot;
}());
//  Color
//
var Color = (function () {
    function Color(r, g, b, a) {
        if (a === void 0) { a = -1.0; }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    Color.prototype.toString = function () {
        if (0 <= this.a) {
            return ('rgba(' +
                int(255 * clamp(0, this.r, 1)) + ',' +
                int(255 * clamp(0, this.g, 1)) + ',' +
                int(255 * clamp(0, this.b, 1)) + ',' +
                clamp(0, this.a, 1) + ')');
        }
        else {
            return ('rgb(' +
                int(255 * clamp(0, this.r, 1)) + ',' +
                int(255 * clamp(0, this.g, 1)) + ',' +
                int(255 * clamp(0, this.b, 1)) + ')');
        }
    };
    Color.prototype.setAlpha = function (a) {
        return new Color(this.r, this.g, this.b, a);
    };
    return Color;
}());
//  ImageSource
//
var ImageSource = (function () {
    function ImageSource(dstRect) {
        this.dstRect = dstRect;
    }
    return ImageSource;
}());
var HTMLImageSource = (function (_super) {
    __extends(HTMLImageSource, _super);
    function HTMLImageSource(image, srcRect, dstRect) {
        _super.call(this, dstRect);
        this.image = image;
        this.srcRect = srcRect;
    }
    return HTMLImageSource;
}(ImageSource));
var FillImageSource = (function (_super) {
    __extends(FillImageSource, _super);
    function FillImageSource(color, dstRect) {
        _super.call(this, dstRect);
        this.color = color;
    }
    return FillImageSource;
}(ImageSource));
//  SpriteSheet
// 
var SpriteSheet = (function () {
    function SpriteSheet() {
    }
    SpriteSheet.prototype.get = function (x, y) {
        if (y === void 0) { y = 0; }
        return null;
    };
    return SpriteSheet;
}());
var ImageSpriteSheet = (function (_super) {
    __extends(ImageSpriteSheet, _super);
    function ImageSpriteSheet(image, size, origin) {
        if (origin === void 0) { origin = null; }
        _super.call(this);
        this.image = image;
        this.size = size;
        this.origin = (origin !== null) ? origin : new Vec2();
    }
    ImageSpriteSheet.prototype.get = function (x, y) {
        if (y === void 0) { y = 0; }
        var srcRect = new Rect(x * this.size.x, y * this.size.y, this.size.x, this.size.y);
        var dstRect = new Rect(-this.origin.x, -this.origin.y, this.size.x, this.size.y);
        return new HTMLImageSource(this.image, srcRect, dstRect);
    };
    return ImageSpriteSheet;
}(SpriteSheet));
var SimpleSpriteSheet = (function (_super) {
    __extends(SimpleSpriteSheet, _super);
    function SimpleSpriteSheet(imgsrcs) {
        _super.call(this);
        this.imgsrcs = imgsrcs;
    }
    SimpleSpriteSheet.prototype.get = function (x, y) {
        if (y === void 0) { y = 0; }
        return this.imgsrcs[x];
    };
    return SimpleSpriteSheet;
}(SpriteSheet));
/// <reference path="utils.ts" />
//  Vec2
//
var Vec2 = (function () {
    function Vec2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.toString = function () {
        return '(' + this.x + ', ' + this.y + ')';
    };
    Vec2.prototype.copy = function () {
        return new Vec2(this.x, this.y);
    };
    Vec2.prototype.equals = function (p) {
        return (this.x == p.x && this.y == p.y);
    };
    Vec2.prototype.isZero = function () {
        return (this.x == 0 && this.y == 0);
    };
    Vec2.prototype.len2 = function () {
        return (this.x * this.x + this.y * this.y);
    };
    Vec2.prototype.len = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vec2.prototype.sign = function () {
        return new Vec2(sign(this.x), sign(this.y));
    };
    Vec2.prototype.add = function (v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    };
    Vec2.prototype.sub = function (v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    };
    Vec2.prototype.scale = function (n) {
        return new Vec2(this.x * n, this.y * n);
    };
    Vec2.prototype.distance = function (v) {
        return this.sub(v).len();
    };
    Vec2.prototype.clamp = function (bounds) {
        return new Vec2(clamp(-bounds.x, this.x, +bounds.x), clamp(-bounds.y, this.y, +bounds.y));
    };
    Vec2.prototype.move = function (dx, dy) {
        return new Vec2(this.x + dx, this.y + dy);
    };
    // rotate: rotates a vector clockwise by d radian.
    Vec2.prototype.rotate = function (d) {
        var s = Math.sin(d);
        var c = Math.cos(d);
        return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
    };
    Vec2.prototype.rot90 = function (d) {
        if (d < 0) {
            return new Vec2(this.y, -this.x);
        }
        else if (0 < d) {
            return new Vec2(-this.y, this.x);
        }
        else {
            return this.copy();
        }
    };
    Vec2.prototype.expand = function (dw, dh, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        return new Rect(this.x, this.y).expand(dw, dh, vx, vy);
    };
    return Vec2;
}());
//  Vec3
//
var Vec3 = (function () {
    function Vec3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Vec3.prototype.toString = function () {
        return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
    };
    Vec3.prototype.copy = function () {
        return new Vec3(this.x, this.y, this.z);
    };
    Vec3.prototype.equals = function (p) {
        return (this.x == p.x && this.y == p.y && this.z == p.z);
    };
    Vec3.prototype.isZero = function () {
        return (this.x == 0 && this.y == 0 && this.z == 0);
    };
    Vec3.prototype.len2 = function () {
        return (this.x * this.x + this.y * this.y + this.z * this.z);
    };
    Vec3.prototype.len = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    Vec3.prototype.sign = function () {
        return new Vec3(sign(this.x), sign(this.y), sign(this.z));
    };
    Vec3.prototype.add = function (v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    };
    Vec3.prototype.sub = function (v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    };
    Vec3.prototype.scale = function (v) {
        return new Vec3(this.x * v, this.y * v, this.z * v);
    };
    Vec3.prototype.distance = function (v) {
        return this.sub(v).len();
    };
    Vec3.prototype.clamp = function (bounds) {
        return new Vec3(clamp(-bounds.x, this.x, +bounds.x), clamp(-bounds.y, this.y, +bounds.y), clamp(-bounds.z, this.z, +bounds.z));
    };
    Vec3.prototype.move = function (dx, dy, dz) {
        return new Vec3(this.x + dx, this.y + dy, this.z + dz);
    };
    return Vec3;
}());
//  Rect
//
var Rect = (function () {
    function Rect(x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Rect.prototype.toString = function () {
        return '(' + this.x + ', ' + this.y + ', ' + this.width + ', ' + this.height + ')';
    };
    Rect.prototype.copy = function () {
        return new Rect(this.x, this.y, this.width, this.height);
    };
    Rect.prototype.equals = function (rect) {
        return (this.x == rect.x && this.y == rect.y &&
            this.width == rect.width && this.height == rect.height);
    };
    Rect.prototype.isZero = function () {
        return (this.width == 0 && this.height == 0);
    };
    Rect.prototype.right = function () {
        return this.x + this.width;
    };
    Rect.prototype.bottom = function () {
        return this.y + this.height;
    };
    Rect.prototype.centerx = function () {
        return this.x + this.width / 2;
    };
    Rect.prototype.centery = function () {
        return this.y + this.height / 2;
    };
    Rect.prototype.center = function () {
        return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
    };
    Rect.prototype.move = function (dx, dy) {
        return new Rect(this.x + dx, this.y + dy, this.width, this.height);
    };
    Rect.prototype.add = function (v) {
        return new Rect(this.x + v.x, this.y + v.y, this.width, this.height);
    };
    Rect.prototype.inflate = function (dw, dh) {
        return new Rect(this.x - dw, this.y - dh, this.width + dw * 2, this.height + dh * 2);
    };
    Rect.prototype.anchor = function (vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        var x, y;
        if (0 < vx) {
            x = this.x;
        }
        else if (vx < 0) {
            x = this.x + this.width;
        }
        else {
            x = this.x + this.width / 2;
        }
        if (0 < vy) {
            y = this.y;
        }
        else if (vy < 0) {
            y = this.y + this.height;
        }
        else {
            y = this.y + this.height / 2;
        }
        return new Vec2(x, y);
    };
    Rect.prototype.expand = function (dw, dh, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        var x, y;
        if (0 < vx) {
            x = this.x;
        }
        else if (vx < 0) {
            x = this.x - dw;
        }
        else {
            x = this.x - dw / 2;
        }
        if (0 < vy) {
            y = this.y;
        }
        else if (vy < 0) {
            y = this.y - dh;
        }
        else {
            y = this.y - dh / 2;
        }
        return new Rect(x, y, this.width + dw, this.height + dh);
    };
    Rect.prototype.resize = function (w, h, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        var x, y;
        if (0 < vx) {
            x = this.x;
        }
        else if (vx < 0) {
            x = this.x + this.width - w;
        }
        else {
            x = this.x + (this.width - w) / 2;
        }
        if (0 < vy) {
            y = this.y;
        }
        else if (vy < 0) {
            y = this.y + this.height - h;
        }
        else {
            y = this.y + (this.height - h) / 2;
        }
        return new Rect(x, y, w, h);
    };
    Rect.prototype.containsPt = function (p) {
        return (this.x < p.x && this.y < p.y &&
            p.x < this.x + this.width && p.y < this.y + this.height);
    };
    Rect.prototype.containsRect = function (rect) {
        return (this.x <= rect.x &&
            this.y <= rect.y &&
            rect.x + rect.width <= this.x + this.width &&
            rect.y + rect.height <= this.y + this.height);
    };
    Rect.prototype.xdistance = function (rect) {
        return Math.max(rect.x - (this.x + this.width), this.x - (rect.x + rect.width));
    };
    Rect.prototype.ydistance = function (rect) {
        return Math.max(rect.y - (this.y + this.height), this.y - (rect.y + rect.height));
    };
    Rect.prototype.overlapsRect = function (rect) {
        return (this.xdistance(rect) < 0 &&
            this.ydistance(rect) < 0);
    };
    Rect.prototype.overlapsCircle = function (circle) {
        return circle.overlapsRect(this);
    };
    Rect.prototype.union = function (rect) {
        var x0 = Math.min(this.x, rect.x);
        var y0 = Math.min(this.y, rect.y);
        var x1 = Math.max(this.x + this.width, rect.x + rect.width);
        var y1 = Math.max(this.y + this.height, rect.y + rect.height);
        return new Rect(x0, y0, x1 - x0, y1 - y0);
    };
    Rect.prototype.intersection = function (rect) {
        var x0 = Math.max(this.x, rect.x);
        var y0 = Math.max(this.y, rect.y);
        var x1 = Math.min(this.x + this.width, rect.x + rect.width);
        var y1 = Math.min(this.y + this.height, rect.y + rect.height);
        return new Rect(x0, y0, x1 - x0, y1 - y0);
    };
    Rect.prototype.clamp = function (bounds) {
        var x = ((bounds.width < this.width) ? bounds.centerx() :
            clamp(bounds.x, this.x, bounds.x + bounds.width - this.width));
        var y = ((bounds.height < this.height) ? bounds.centery() :
            clamp(bounds.y, this.y, bounds.y + bounds.height - this.height));
        return new Rect(x, y, this.width, this.height);
    };
    Rect.prototype.rndpt = function () {
        return new Vec2(this.x + frnd(this.width), this.y + frnd(this.height));
    };
    Rect.prototype.modpt = function (p) {
        return new Vec2(this.x + fmod(p.x - this.x, this.width), this.y + fmod(p.y - this.y, this.height));
    };
    Rect.prototype.contactVLine = function (v, x, y0, y1) {
        var dx, dy;
        var x0 = this.x;
        var x1 = this.x + this.width;
        if (x <= x0 && x0 + v.x < x) {
            dx = x - x0;
        }
        else if (x1 <= x && x < x1 + v.x) {
            dx = x - x1;
        }
        else {
            return v;
        }
        dy = v.y * dx / v.x;
        var y = this.y + dy;
        if (y + this.height < y0 || y1 < y ||
            (y + this.height == y0 && v.y <= 0) ||
            (y1 == y && 0 <= v.y)) {
            return v;
        }
        return new Vec2(dx, dy);
    };
    Rect.prototype.contactHLine = function (v, y, x0, x1) {
        var dx, dy;
        var y0 = this.y;
        var y1 = this.y + this.height;
        if (y <= y0 && y0 + v.y < y) {
            dy = y - y0;
        }
        else if (y1 <= y && y < y1 + v.y) {
            dy = y - y1;
        }
        else {
            return v;
        }
        dx = v.x * dy / v.y;
        var x = this.x + dx;
        if (x + this.width < x0 || x1 < x ||
            (x + this.width == x0 && v.x <= 0) ||
            (x1 == x && 0 <= v.x)) {
            return v;
        }
        return new Vec2(dx, dy);
    };
    Rect.prototype.contactRect = function (v, rect) {
        assert(!this.overlapsRect(rect), 'rect overlapped');
        if (0 < v.x) {
            v = this.contactVLine(v, rect.x, rect.y, rect.y + rect.height);
        }
        else if (v.x < 0) {
            v = this.contactVLine(v, rect.x + rect.width, rect.y, rect.y + rect.height);
        }
        if (0 < v.y) {
            v = this.contactHLine(v, rect.y, rect.x, rect.x + rect.width);
        }
        else if (v.y < 0) {
            v = this.contactHLine(v, rect.y + rect.height, rect.x, rect.x + rect.width);
        }
        return v;
    };
    Rect.prototype.contactBounds = function (v, bounds) {
        if (0 < v.x) {
            v = this.contactVLine(v, bounds.x + bounds.width, -Infinity, +Infinity);
        }
        else if (v.x < 0) {
            v = this.contactVLine(v, bounds.x, -Infinity, +Infinity);
        }
        if (0 < v.y) {
            v = this.contactHLine(v, bounds.y + bounds.height, -Infinity, +Infinity);
        }
        else if (v.y < 0) {
            v = this.contactHLine(v, bounds.y, -Infinity, +Infinity);
        }
        return v;
    };
    Rect.prototype.overlaps = function (shape) {
        if (shape instanceof Rect) {
            return this.overlapsRect(shape);
        }
        else if (shape instanceof Circle) {
            return this.overlapsCircle(shape);
        }
        else {
            return false;
        }
    };
    Rect.prototype.contact = function (v, shape) {
        if (shape instanceof Rect) {
            return this.contactRect(v, shape);
        }
        else if (shape instanceof Circle) {
            return shape.contactRect(v.scale(-1), this).scale(-1);
        }
        else {
            return null;
        }
    };
    Rect.prototype.getAABB = function () {
        return this;
    };
    return Rect;
}());
//  Circle
//
var EPSILON = 0.0001;
var Circle = (function () {
    function Circle(center, radius) {
        if (radius === void 0) { radius = 0; }
        this.center = center;
        this.radius = radius;
    }
    Circle.prototype.toString = function () {
        return 'Circle(center=' + this.center + ', radius=' + this.radius + ')';
    };
    Circle.prototype.copy = function () {
        return new Circle(this.center.copy(), this.radius);
    };
    Circle.prototype.equals = function (circle) {
        return (this.center.equals(circle.center) &&
            this.radius == circle.radius);
    };
    Circle.prototype.isZero = function () {
        return this.radius == 0;
    };
    Circle.prototype.move = function (dx, dy) {
        return new Circle(this.center.move(dx, dy), this.radius);
    };
    Circle.prototype.add = function (v) {
        return new Circle(this.center.add(v), this.radius);
    };
    Circle.prototype.inflate = function (dr) {
        return new Circle(this.center, this.radius + dr);
    };
    Circle.prototype.resize = function (radius) {
        return new Circle(this.center, radius);
    };
    Circle.prototype.dist = function (p) {
        return this.center.sub(p).len();
    };
    Circle.prototype.containsPt = function (p) {
        return this.dist(p) < this.radius;
    };
    Circle.prototype.containsCircle = function (circle) {
        var d = this.dist(circle.center);
        return d + circle.radius < this.radius;
    };
    Circle.prototype.overlapsCircle = function (circle) {
        var d = this.dist(circle.center);
        return d < this.radius + circle.radius;
    };
    Circle.prototype.overlapsRect = function (rect) {
        var x0 = rect.x;
        var x1 = rect.right();
        var y0 = rect.y;
        var y1 = rect.bottom();
        var cx = this.center.x;
        var cy = this.center.y;
        var r = this.radius;
        return (this.containsPt(new Vec2(x0, y0)) ||
            this.containsPt(new Vec2(x1, y0)) ||
            this.containsPt(new Vec2(x0, y1)) ||
            this.containsPt(new Vec2(x1, y1)) ||
            ((x0 < cx && cx < x1) &&
                (Math.abs(y0 - cy) < r ||
                    Math.abs(y1 - cy) < r)) ||
            ((y0 < cy && cy < y1) &&
                (Math.abs(x0 - cx) < r ||
                    Math.abs(x1 - cx) < r)));
    };
    Circle.prototype.clamp = function (bounds) {
        var x = ((bounds.width < this.radius) ? bounds.centerx() :
            clamp(bounds.x, this.center.x, bounds.x + bounds.width - this.radius));
        var y = ((bounds.height < this.radius) ? bounds.centery() :
            clamp(bounds.y, this.center.y, bounds.y + bounds.height - this.radius));
        return new Circle(new Vec2(x, y), this.radius);
    };
    Circle.prototype.rndpt = function () {
        var r = frnd(this.radius);
        var t = frnd(Math.PI * 2);
        return new Vec2(this.center.x + r * Math.cos(t), this.center.y + r * Math.sin(t));
    };
    Circle.prototype.contactVLine = function (v, x, y0, y1) {
        var y = this.center.y + v.y;
        if (y0 < y && y < y1) {
            x += (v.x < 0) ? this.radius : -this.radius;
            var dx = x - this.center.x;
            var dt = dx / v.x;
            if (0 <= dt && dt <= 1) {
                return new Vec2(dx, v.y * dt);
            }
        }
        return v;
    };
    Circle.prototype.contactHLine = function (v, y, x0, x1) {
        var x = this.center.x + v.x;
        if (x0 < x && x < x1) {
            y += (v.y < 0) ? this.radius : -this.radius;
            var dy = y - this.center.y;
            var dt = dy / v.y;
            if (0 <= dt && dt <= 1) {
                return new Vec2(v.x * dt, dy);
            }
        }
        return v;
    };
    Circle.prototype.contactCircle = function (v, circle) {
        //assert(!this.overlapsCircle(circle), 'circle overlapped');
        var d = circle.center.sub(this.center);
        var dv = d.x * v.x + d.y * v.y;
        var v2 = v.len2();
        var d2 = d.len2();
        var R = (this.radius + circle.radius);
        // |d - t*v|^2 = (r1+r2)^2
        // t = { (d*v) + sqrt((d*v)^2 - v^2(d^2-R^2)) } / v^2
        var s = dv * dv - v2 * (d2 - R * R);
        if (0 < s) {
            var t = (dv - Math.sqrt(s)) / v2;
            if (t < -EPSILON) {
                ;
            }
            else if (t < EPSILON) {
                v = new Vec2();
            }
            else if (t < 1 + EPSILON) {
                v = v.scale(t / (1 + EPSILON));
            }
        }
        return v;
    };
    Circle.prototype.contactRect = function (v, rect) {
        //assert(!this.overlapsRect(rect), 'rect overlapped');
        if (0 < v.x) {
            v = this.contactVLine(v, rect.x, rect.y, rect.y + rect.height);
        }
        else if (v.x < 0) {
            v = this.contactVLine(v, rect.x + rect.width, rect.y, rect.y + rect.height);
        }
        if (0 < v.y) {
            v = this.contactHLine(v, rect.y, rect.x, rect.x + rect.width);
        }
        else if (v.y < 0) {
            v = this.contactHLine(v, rect.y + rect.height, rect.x, rect.x + rect.width);
        }
        if (this.center.x < rect.x || this.center.y < rect.y) {
            v = this.contactCircle(v, new Circle(new Vec2(rect.x, rect.y)));
        }
        if (rect.right() < this.center.x || this.center.y < rect.y) {
            v = this.contactCircle(v, new Circle(new Vec2(rect.right(), rect.y)));
        }
        if (this.center.x < rect.x || rect.bottom() < this.center.y) {
            v = this.contactCircle(v, new Circle(new Vec2(rect.x, rect.bottom())));
        }
        if (rect.right() < this.center.x || rect.bottom() < this.center.y) {
            v = this.contactCircle(v, new Circle(new Vec2(rect.right(), rect.bottom())));
        }
        return v;
    };
    Circle.prototype.contactBounds = function (v, bounds) {
        return this.getAABB().contactBounds(v, bounds);
    };
    Circle.prototype.overlaps = function (shape) {
        if (shape instanceof Circle) {
            return this.overlapsCircle(shape);
        }
        else if (shape instanceof Rect) {
            return this.overlapsRect(shape);
        }
        else {
            return false;
        }
    };
    Circle.prototype.contact = function (v, shape) {
        if (shape instanceof Circle) {
            return this.contactCircle(v, shape);
        }
        else if (shape instanceof Rect) {
            return this.contactRect(v, shape);
        }
        else {
            return null;
        }
    };
    Circle.prototype.getAABB = function () {
        return new Rect(this.center.x - this.radius, this.center.y - this.radius, this.radius * 2, this.radius * 2);
    };
    return Circle;
}());
//  Box
//
var Box = (function () {
    function Box(origin, size) {
        if (size === void 0) { size = null; }
        this.origin = origin;
        this.size = (size !== null) ? size : new Vec3();
    }
    Box.prototype.toString = function () {
        return '(' + this.origin + ', ' + this.size + ')';
    };
    Box.prototype.copy = function () {
        return new Box(this.origin.copy(), this.size.copy());
    };
    Box.prototype.equals = function (box) {
        return (this.origin.equals(box.origin) &&
            this.size.equals(box.size));
    };
    Box.prototype.isZero = function () {
        return this.size.isZero();
    };
    Box.prototype.center = function () {
        return new Vec3(this.origin.x + this.size.x / 2, this.origin.y + this.size.y / 2, this.origin.z + this.size.z / 2);
    };
    Box.prototype.anchor = function (vx, vy, vz) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        if (vz === void 0) { vz = 0; }
        var x, y, z;
        if (0 < vx) {
            x = this.origin.x;
        }
        else if (vx < 0) {
            x = this.origin.x + this.size.x;
        }
        else {
            x = this.origin.x + this.size.x / 2;
        }
        if (0 < vy) {
            y = this.origin.y;
        }
        else if (vy < 0) {
            y = this.origin.y + this.size.y;
        }
        else {
            y = this.origin.y + this.size.y / 2;
        }
        if (0 < vz) {
            z = this.origin.z;
        }
        else if (vz < 0) {
            z = this.origin.z + this.size.z;
        }
        else {
            z = this.origin.z + this.size.z / 2;
        }
        return new Vec3(x, y, z);
    };
    Box.prototype.move = function (dx, dy, dz) {
        return new Box(this.origin.move(dx, dy, dz), this.size);
    };
    Box.prototype.add = function (v) {
        return new Box(this.origin.add(v), this.size);
    };
    Box.prototype.inflate = function (dx, dy, dz) {
        return new Box(this.origin.move(-dx, -dy, -dz), this.size.move(dx * 2, dy * 2, dz * 2));
    };
    Box.prototype.xdistance = function (box) {
        return Math.max(box.origin.x - (this.origin.x + this.size.x), this.origin.x - (box.origin.x + box.size.x));
    };
    Box.prototype.ydistance = function (box) {
        return Math.max(box.origin.y - (this.origin.y + this.size.y), this.origin.y - (box.origin.y + box.size.y));
    };
    Box.prototype.zdistance = function (box) {
        return Math.max(box.origin.z - (this.origin.z + this.size.z), this.origin.z - (box.origin.z + box.size.z));
    };
    Box.prototype.containsPt = function (p) {
        return (this.origin.x <= p.x && this.origin.y <= p.y && this.origin.z <= p.z &&
            p.x <= this.origin.x + this.size.x &&
            p.y <= this.origin.y + this.size.y &&
            p.z <= this.origin.z + this.size.z);
    };
    Box.prototype.overlapsBox = function (box) {
        return (this.xdistance(box) < 0 &&
            this.ydistance(box) < 0 &&
            this.zdistance(box) < 0);
    };
    Box.prototype.union = function (box) {
        var x0 = Math.min(this.origin.x, box.origin.x);
        var y0 = Math.min(this.origin.y, box.origin.y);
        var z0 = Math.min(this.origin.z, box.origin.z);
        var x1 = Math.max(this.origin.x + this.size.x, box.origin.x + box.size.x);
        var y1 = Math.max(this.origin.y + this.size.y, box.origin.y + box.size.y);
        var z1 = Math.max(this.origin.z + this.size.z, box.origin.z + box.size.z);
        return new Box(new Vec3(x0, y0, z0), new Vec3(x1 - x0, y1 - y0, z1 - z0));
    };
    Box.prototype.intersection = function (box) {
        var x0 = Math.max(this.origin.x, box.origin.x);
        var y0 = Math.max(this.origin.y, box.origin.y);
        var z0 = Math.max(this.origin.z, box.origin.z);
        var x1 = Math.min(this.origin.x + this.size.x, box.origin.x + box.size.x);
        var y1 = Math.min(this.origin.y + this.size.y, box.origin.y + box.size.y);
        var z1 = Math.min(this.origin.z + this.size.z, box.origin.z + box.size.z);
        return new Box(new Vec3(x0, y0, z0), new Vec3(x1 - x0, y1 - y0, z1 - z0));
    };
    Box.prototype.clamp = function (bounds) {
        var x = ((bounds.size.x < this.size.x) ?
            (bounds.origin.x + bounds.size.x / 2) :
            clamp(bounds.origin.x, this.origin.x, bounds.origin.x + bounds.size.x - this.size.x));
        var y = ((bounds.size.y < this.size.y) ?
            (bounds.origin.y + bounds.size.y / 2) :
            clamp(bounds.origin.y, this.origin.y, bounds.origin.y + bounds.size.y - this.size.y));
        var z = ((bounds.size.z < this.size.z) ?
            (bounds.origin.z + bounds.size.z / 2) :
            clamp(bounds.origin.z, this.origin.z, bounds.origin.z + bounds.size.z - this.size.z));
        return new Box(new Vec3(x, y, z), this.size);
    };
    Box.prototype.rndpt = function () {
        return new Vec3(this.origin.x + frnd(this.size.x), this.origin.y + frnd(this.size.y), this.origin.z + frnd(this.size.z));
    };
    Box.prototype.contactYZPlane = function (v, x, rect) {
        var dx, dy, dz;
        var x0 = this.origin.x;
        var x1 = this.origin.x + this.size.x;
        if (x <= x0 && x0 + v.x < x) {
            dx = x - x0;
        }
        else if (x1 <= x && x < x1 + v.x) {
            dx = x - x1;
        }
        else {
            return v;
        }
        dy = v.y * dx / v.x;
        dz = v.z * dx / v.x;
        if (rect !== null) {
            var y = this.origin.y + dy;
            var z = this.origin.z + dz;
            if (y + this.size.y < rect.x || rect.x + rect.width < y ||
                z + this.size.z < rect.y || rect.y + rect.height < z ||
                (y + this.size.y == rect.x && v.y <= 0) ||
                (rect.x + rect.width == y && 0 <= v.y) ||
                (z + this.size.z == rect.y && v.z <= 0) ||
                (rect.y + rect.height == z && 0 <= v.z)) {
                return v;
            }
        }
        return new Vec3(dx, dy, dz);
    };
    Box.prototype.contactZXPlane = function (v, y, rect) {
        var dx, dy, dz;
        var y0 = this.origin.y;
        var y1 = this.origin.y + this.size.y;
        if (y <= y0 && y0 + v.y < y) {
            dy = y - y0;
        }
        else if (y1 <= y && y < y1 + v.y) {
            dy = y - y1;
        }
        else {
            return v;
        }
        dz = v.z * dy / v.y;
        dx = v.x * dy / v.y;
        if (rect !== null) {
            var z = this.origin.z + dz;
            var x = this.origin.x + dx;
            if (z + this.size.z < rect.x || rect.x + rect.width < z ||
                x + this.size.x < rect.y || rect.y + rect.height < x ||
                (z + this.size.z == rect.x && v.z <= 0) ||
                (rect.x + rect.width == z && 0 <= v.z) ||
                (x + this.size.x == rect.y && v.x <= 0) ||
                (rect.y + rect.height == x && 0 <= v.x)) {
                return v;
            }
        }
        return new Vec3(dx, dy, dz);
    };
    Box.prototype.contactXYPlane = function (v, z, rect) {
        var dx, dy, dz;
        var z0 = this.origin.z;
        var z1 = this.origin.z + this.size.z;
        if (z <= z0 && z0 + v.z < z) {
            dz = z - z0;
        }
        else if (z1 <= z && z < z1 + v.z) {
            dz = z - z1;
        }
        else {
            return v;
        }
        dx = v.x * dz / v.z;
        dy = v.y * dz / v.z;
        if (rect !== null) {
            var x = this.origin.x + dx;
            var y = this.origin.y + dy;
            if (x + this.size.x < rect.x || rect.x + rect.width < x ||
                y + this.size.y < rect.y || rect.y + rect.height < y ||
                (x + this.size.x == rect.x && v.x <= 0) ||
                (rect.x + rect.width == x && 0 <= v.x) ||
                (y + this.size.y == rect.y && v.y <= 0) ||
                (rect.y + rect.height == y && 0 <= v.y)) {
                return v;
            }
        }
        return new Vec3(dx, dy, dz);
    };
    Box.prototype.contactBox = function (v, box) {
        assert(!this.overlapsBox(box), 'box overlapped');
        if (0 < v.x) {
            v = this.contactYZPlane(v, box.origin.x, new Rect(box.origin.y, box.origin.z, box.size.y, box.size.z));
        }
        else if (v.x < 0) {
            v = this.contactYZPlane(v, box.origin.x + box.size.x, new Rect(box.origin.y, box.origin.z, box.size.y, box.size.z));
        }
        if (0 < v.y) {
            v = this.contactZXPlane(v, box.origin.y, new Rect(box.origin.z, box.origin.x, box.size.z, box.size.x));
        }
        else if (v.y < 0) {
            v = this.contactZXPlane(v, box.origin.y + box.size.y, new Rect(box.origin.z, box.origin.x, box.size.z, box.size.x));
        }
        if (0 < v.z) {
            v = this.contactXYPlane(v, box.origin.z, new Rect(box.origin.x, box.origin.y, box.size.x, box.size.y));
        }
        else if (v.z < 0) {
            v = this.contactXYPlane(v, box.origin.z + box.size.z, new Rect(box.origin.x, box.origin.y, box.size.x, box.size.y));
        }
        return v;
    };
    return Box;
}());
/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
var TileMap = (function () {
    function TileMap(tilesize, map) {
        this._rangemap = {};
        this.tilesize = tilesize;
        this.map = map;
        this.width = map[0].length;
        this.height = map.length;
        this.bounds = new Rect(0, 0, this.width * this.tilesize, this.height * this.tilesize);
    }
    TileMap.prototype.toString = function () {
        return '<TileMap: ' + this.width + ',' + this.height + '>';
    };
    TileMap.prototype.get = function (x, y) {
        if (0 <= x && 0 <= y && x < this.width && y < this.height) {
            return this.map[y][x];
        }
        else {
            return -1;
        }
    };
    TileMap.prototype.set = function (x, y, c) {
        if (0 <= x && 0 <= y && x < this.width && y < this.height) {
            this.map[y][x] = c;
            this._rangemap = {};
        }
    };
    TileMap.prototype.fill = function (c, rect) {
        if (rect === void 0) { rect = null; }
        if (rect === null) {
            rect = new Rect(0, 0, this.width, this.height);
        }
        for (var dy = 0; dy < rect.height; dy++) {
            var y = rect.y + dy;
            for (var dx = 0; dx < rect.width; dx++) {
                var x = rect.x + dx;
                this.map[y][x] = c;
            }
        }
        this._rangemap = {};
    };
    TileMap.prototype.copy = function () {
        var map = [];
        for (var _i = 0, _a = this.map; _i < _a.length; _i++) {
            var a = _a[_i];
            map.push(a.slice());
        }
        return new TileMap(this.tilesize, map);
    };
    TileMap.prototype.coord2map = function (rect) {
        var ts = this.tilesize;
        if (rect instanceof Rect) {
            var x0 = Math.floor(rect.x / ts);
            var y0 = Math.floor(rect.y / ts);
            var x1 = Math.ceil((rect.x + rect.width) / ts);
            var y1 = Math.ceil((rect.y + rect.height) / ts);
            return new Rect(x0, y0, x1 - x0, y1 - y0);
        }
        else {
            var x = int(rect.x / ts);
            var y = int(rect.y / ts);
            return new Rect(x, y, 1, 1);
        }
    };
    TileMap.prototype.map2coord = function (rect) {
        var ts = this.tilesize;
        if (rect instanceof Vec2) {
            return new Rect(rect.x * ts, rect.y * ts, ts, ts);
        }
        else if (rect instanceof Rect) {
            return new Rect(rect.x * ts, rect.y * ts, rect.width * ts, rect.height * ts);
        }
        else {
            return null;
        }
    };
    TileMap.prototype.apply = function (f, rect) {
        if (rect === void 0) { rect = null; }
        if (rect === null) {
            rect = new Rect(0, 0, this.width, this.height);
        }
        for (var dy = 0; dy < rect.height; dy++) {
            var y = rect.y + dy;
            for (var dx = 0; dx < rect.width; dx++) {
                var x = rect.x + dx;
                var c = this.get(x, y);
                if (f(x, y, c)) {
                    return new Vec2(x, y);
                }
            }
        }
        return null;
    };
    TileMap.prototype.shift = function (vx, vy, rect) {
        if (rect === void 0) { rect = null; }
        if (rect === null) {
            rect = new Rect(0, 0, this.width, this.height);
        }
        var src = [];
        for (var dy = 0; dy < rect.height; dy++) {
            var a = new Int32Array(rect.width);
            for (var dx = 0; dx < rect.width; dx++) {
                a[dx] = this.map[rect.y + dy][rect.x + dx];
            }
            src.push(a);
        }
        for (var dy = 0; dy < rect.height; dy++) {
            for (var dx = 0; dx < rect.width; dx++) {
                var x = (dx + vx + rect.width) % rect.width;
                var y = (dy + vy + rect.height) % rect.height;
                this.map[rect.y + y][rect.x + x] = src[dy][dx];
            }
        }
    };
    TileMap.prototype.findTile = function (f0, range) {
        return this.apply(function (x, y, c) { return f0(c); }, this.coord2map(range));
    };
    TileMap.prototype.getTileRects = function (f0, range) {
        var ts = this.tilesize;
        var rects = [];
        function f(x, y, c) {
            if (f0(c)) {
                rects.push(new Rect(x * ts, y * ts, ts, ts));
            }
            return false;
        }
        this.apply(f, this.coord2map(range));
        return rects;
    };
    TileMap.prototype.getRangeMap = function (key, f) {
        var map = this._rangemap[key];
        if (map === undefined) {
            map = new RangeMap(this, f);
            this._rangemap[key] = map;
        }
        return map;
    };
    TileMap.prototype.renderFromBottomLeft = function (ctx, bx, by, tileset, ft, x0, y0, w, h) {
        if (x0 === void 0) { x0 = 0; }
        if (y0 === void 0) { y0 = 0; }
        if (w === void 0) { w = 0; }
        if (h === void 0) { h = 0; }
        // Align the pos to the bottom left corner.
        var ts = this.tilesize;
        w = (w != 0) ? w : this.width;
        h = (h != 0) ? h : this.height;
        // Draw tiles from the bottom-left first.
        for (var dy = h - 1; 0 <= dy; dy--) {
            var y = y0 + dy;
            for (var dx = 0; dx < w; dx++) {
                var x = x0 + dx;
                var c = this.get(x, y);
                c = ft(x, y, c);
                if (0 <= c) {
                    var imgsrc = tileset.get(c);
                    var dstRect = imgsrc.dstRect;
                    if (imgsrc instanceof FillImageSource) {
                        ctx.fillStyle = imgsrc.color;
                        ctx.fillRect(bx + ts * dx, by + ts * dy, ts, ts);
                    }
                    else if (imgsrc instanceof HTMLImageSource) {
                        var srcRect = imgsrc.srcRect;
                        ctx.drawImage(imgsrc.image, srcRect.x, srcRect.y, srcRect.width, srcRect.height, bx + ts * dx + dstRect.x, by + ts * dy + dstRect.y, dstRect.width, dstRect.height);
                    }
                }
            }
        }
    };
    TileMap.prototype.renderFromTopRight = function (ctx, bx, by, tileset, ft, x0, y0, w, h) {
        if (x0 === void 0) { x0 = 0; }
        if (y0 === void 0) { y0 = 0; }
        if (w === void 0) { w = 0; }
        if (h === void 0) { h = 0; }
        // Align the pos to the bottom left corner.
        var ts = this.tilesize;
        w = (w != 0) ? w : this.width;
        h = (h != 0) ? h : this.height;
        // Draw tiles from the top-right first.
        for (var dy = 0; dy < h; dy++) {
            var y = y0 + dy;
            for (var dx = w - 1; 0 <= dx; dx--) {
                var x = x0 + dx;
                var c = this.get(x, y);
                c = ft(x, y, c);
                if (0 <= c) {
                    var imgsrc = tileset.get(c);
                    var dstRect = imgsrc.dstRect;
                    if (imgsrc instanceof FillImageSource) {
                        ctx.fillStyle = imgsrc.color;
                        ctx.fillRect(bx + ts * dx, by + ts * dy, ts, ts);
                    }
                    else if (imgsrc instanceof HTMLImageSource) {
                        var srcRect = imgsrc.srcRect;
                        ctx.drawImage(imgsrc.image, srcRect.x, srcRect.y, srcRect.width, srcRect.height, bx + ts * dx + dstRect.x, by + ts * dy + dstRect.y, dstRect.width, dstRect.height);
                    }
                }
            }
        }
    };
    TileMap.prototype.renderWindowFromBottomLeft = function (ctx, bx, by, window, tileset, ft) {
        var ts = this.tilesize;
        var x0 = Math.floor(window.x / ts);
        var y0 = Math.floor(window.y / ts);
        var x1 = Math.ceil((window.x + window.width) / ts);
        var y1 = Math.ceil((window.y + window.height) / ts);
        var fx = x0 * ts - window.x;
        var fy = y0 * ts - window.y;
        this.renderFromBottomLeft(ctx, bx + fx, by + fy, tileset, ft, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    };
    TileMap.prototype.renderWindowFromTopRight = function (ctx, bx, by, window, tileset, ft) {
        var ts = this.tilesize;
        var x0 = Math.floor(window.x / ts);
        var y0 = Math.floor(window.y / ts);
        var x1 = Math.ceil((window.x + window.width) / ts);
        var y1 = Math.ceil((window.y + window.height) / ts);
        var fx = x0 * ts - window.x;
        var fy = y0 * ts - window.y;
        this.renderFromTopRight(ctx, bx + fx, by + fy, tileset, ft, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    };
    return TileMap;
}());
//  RangeMap
//
var RangeMap = (function () {
    function RangeMap(tilemap, f) {
        var data = new Array(tilemap.height + 1);
        var row0 = new Int32Array(tilemap.width + 1);
        for (var x = 0; x < tilemap.width; x++) {
            row0[x + 1] = 0;
        }
        data[0] = row0;
        for (var y = 0; y < tilemap.height; y++) {
            var row1 = new Int32Array(tilemap.width + 1);
            var n = 0;
            for (var x = 0; x < tilemap.width; x++) {
                if (f(tilemap.get(x, y))) {
                    n++;
                }
                row1[x + 1] = row0[x + 1] + n;
            }
            data[y + 1] = row1;
            row0 = row1;
        }
        this.width = tilemap.width;
        this.height = tilemap.height;
        this._data = data;
    }
    RangeMap.prototype.get = function (x0, y0, x1, y1) {
        var t;
        if (x1 < x0) {
            t = x0;
            x0 = x1;
            x1 = t;
        }
        if (y1 < y0) {
            t = y0;
            y0 = y1;
            y1 = t;
        }
        x0 = clamp(0, x0, this.width);
        y0 = clamp(0, y0, this.height);
        x1 = clamp(0, x1, this.width);
        y1 = clamp(0, y1, this.height);
        return (this._data[y1][x1] - this._data[y1][x0] -
            this._data[y0][x1] + this._data[y0][x0]);
    };
    RangeMap.prototype.exists = function (rect) {
        return (this.get(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height) !== 0);
    };
    return RangeMap;
}());
/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
/// <reference path="tilemap.ts" />
function getContact(collider0, v, colliders, bounds) {
    if (colliders !== null) {
        for (var _i = 0, colliders_1 = colliders; _i < colliders_1.length; _i++) {
            var collider1 = colliders_1[_i];
            v = collider0.contact(v, collider1);
        }
    }
    if (bounds !== null) {
        for (var _a = 0, bounds_1 = bounds; _a < bounds_1.length; _a++) {
            var rect = bounds_1[_a];
            v = collider0.contactBounds(v, rect);
        }
    }
    return v;
}
//  Task
//  A single procedure that runs at each frame.
//
var Task = (function () {
    function Task(lifetime) {
        if (lifetime === void 0) { lifetime = Infinity; }
        this.alive = true;
        this.layer = null;
        this.lifetime = Infinity;
        this.time0 = 0;
        this.time = 0;
        this.lifetime = lifetime;
        this.died = new Slot(this);
    }
    Task.prototype.toString = function () {
        return '<Task: time=' + this.time + '>';
    };
    Task.prototype.start = function (layer) {
        this.layer = layer;
        this.time0 = layer.time;
        this.time = 0;
    };
    Task.prototype.tick = function (t) {
        this.update();
        this.time = t - this.time0;
        if (this.alive && this.lifetime <= this.time) {
            this.die();
        }
    };
    Task.prototype.die = function () {
        this.alive = false;
        this.died.signal();
    };
    Task.prototype.update = function () {
        // [OVERRIDE]
    };
    return Task;
}());
//  Sprite
//  A moving object that doesn't interact.
//
var Sprite = (function (_super) {
    __extends(Sprite, _super);
    function Sprite(pos) {
        _super.call(this);
        this.imgsrc = null;
        this.visible = true;
        this.zOrder = 0;
        this.scale = new Vec2(1, 1);
        this.rotation = 0;
        this.pos = pos.copy();
    }
    Sprite.prototype.toString = function () {
        return '<Sprite: ' + this.pos + '>';
    };
    Sprite.prototype.getBounds = function (pos) {
        if (pos === void 0) { pos = null; }
        pos = (pos !== null) ? pos : this.pos;
        if (pos !== null && this.imgsrc !== null) {
            return this.imgsrc.dstRect.add(pos);
        }
        else {
            return null;
        }
    };
    Sprite.prototype.movePos = function (v) {
        // [OVERRIDE]
        this.pos = this.pos.add(v);
    };
    Sprite.prototype.update = function () {
        // [OVERRIDE]
        _super.prototype.update.call(this);
    };
    Sprite.prototype.render = function (ctx, bx, by) {
        // [OVERRIDE]
        var imgsrc = this.imgsrc;
        if (imgsrc !== null) {
            ctx.save();
            ctx.translate(bx + this.pos.x, by + this.pos.y);
            if (this.rotation) {
                ctx.rotate(this.rotation);
            }
            var dstRect = imgsrc.dstRect;
            if (imgsrc instanceof FillImageSource) {
                ctx.fillStyle = imgsrc.color;
                ctx.fillRect(dstRect.x, dstRect.y, dstRect.width, dstRect.height);
            }
            else if (imgsrc instanceof HTMLImageSource) {
                var srcRect = imgsrc.srcRect;
                drawImageScaled(ctx, imgsrc.image, srcRect.x, srcRect.y, srcRect.width, srcRect.height, dstRect.x, dstRect.y, dstRect.width * this.scale.x, dstRect.height * this.scale.y);
            }
            ctx.restore();
        }
    };
    return Sprite;
}(Task));
//  TiledSprite
//  Displays a tiled image repeatedly.
//
var TiledSprite = (function (_super) {
    __extends(TiledSprite, _super);
    function TiledSprite(bounds) {
        _super.call(this, new Vec2());
        this.offset = new Vec2();
        this.bounds = bounds;
    }
    TiledSprite.prototype.render = function (ctx, bx, by) {
        var imgsrc = this.imgsrc;
        if (imgsrc !== null) {
            ctx.save();
            ctx.translate(bx + this.bounds.x, by + this.bounds.y);
            ctx.beginPath();
            ctx.rect(0, 0, this.bounds.width, this.bounds.height);
            ctx.clip();
            var srcRect = imgsrc.srcRect;
            var w = imgsrc.dstRect.width;
            var h = imgsrc.dstRect.height;
            var dx0 = int(Math.floor(this.offset.x / w) * w - this.offset.x);
            var dy0 = int(Math.floor(this.offset.y / h) * h - this.offset.y);
            for (var dy = dy0; dy < this.bounds.height; dy += h) {
                for (var dx = dx0; dx < this.bounds.width; dx += w) {
                    ctx.drawImage(imgsrc.image, srcRect.x, srcRect.y, srcRect.width, srcRect.height, dx, dy, w, h);
                }
            }
            ctx.restore();
        }
    };
    return TiledSprite;
}(Sprite));
//  StarSprite
//
var Star = (function () {
    function Star() {
    }
    Star.prototype.init = function (maxdepth) {
        this.z = Math.random() * maxdepth + 1;
        this.s = (Math.random() * 2 + 1) / this.z;
    };
    return Star;
}());
var StarSprite = (function (_super) {
    __extends(StarSprite, _super);
    function StarSprite(bounds, nstars, maxdepth) {
        if (maxdepth === void 0) { maxdepth = 3; }
        _super.call(this, new Vec2());
        this.velocity = new Vec2();
        this._stars = [];
        this.bounds = bounds;
        this.maxdepth = maxdepth;
        for (var i = 0; i < nstars; i++) {
            var star = new Star();
            star.init(this.maxdepth);
            star.p = this.bounds.rndpt();
            this._stars.push(star);
        }
    }
    StarSprite.prototype.update = function () {
        _super.prototype.update.call(this);
        for (var _i = 0, _a = this._stars; _i < _a.length; _i++) {
            var star = _a[_i];
            star.p.x += this.velocity.x / star.z;
            star.p.y += this.velocity.y / star.z;
            var rect = star.p.expand(star.s, star.s);
            if (!this.bounds.overlapsRect(rect)) {
                star.init(this.maxdepth);
                star.p = this.bounds.modpt(star.p);
            }
        }
    };
    StarSprite.prototype.render = function (ctx, bx, by) {
        var imgsrc = this.imgsrc;
        if (imgsrc !== null) {
            ctx.save();
            ctx.translate(bx + this.bounds.x, by + this.bounds.y);
            for (var _i = 0, _a = this._stars; _i < _a.length; _i++) {
                var star = _a[_i];
                var dstRect = star.p.expand(star.s, star.s);
                if (imgsrc instanceof FillImageSource) {
                    ctx.fillStyle = imgsrc.color;
                    ctx.fillRect(dstRect.x, dstRect.y, dstRect.width, dstRect.height);
                }
                else if (imgsrc instanceof HTMLImageSource) {
                    var srcRect = imgsrc.srcRect;
                    drawImageScaled(ctx, imgsrc.image, srcRect.x, srcRect.y, srcRect.width, srcRect.height, dstRect.x, dstRect.y, dstRect.width * this.scale.x, dstRect.height * this.scale.y);
                }
            }
            ctx.restore();
        }
    };
    return StarSprite;
}(Sprite));
//  Entity
//  A character that can interact with other characters.
//
var Entity = (function (_super) {
    __extends(Entity, _super);
    function Entity() {
        _super.apply(this, arguments);
        this.collider = null;
    }
    Entity.prototype.toString = function () {
        return '<Entity: ' + this.pos + '>';
    };
    Entity.prototype.getCollider = function (pos) {
        if (pos === void 0) { pos = null; }
        pos = (pos !== null) ? pos : this.pos;
        if (pos !== null && this.collider !== null) {
            return this.collider.add(pos);
        }
        else {
            return null;
        }
    };
    Entity.prototype.isMovable = function (v0) {
        var v1 = this.getMove(this.pos, v0, true);
        return v1.equals(v0);
    };
    Entity.prototype.getMove = function (pos, v, force) {
        if (this.collider === null)
            return v;
        var collider = this.collider.add(pos);
        var hitbox0 = collider.getAABB();
        var range = hitbox0.union(hitbox0.add(v));
        var obstacles = this.getObstaclesFor(range, force);
        var fences = this.getFencesFor(range, force);
        var d = getContact(collider, v, obstacles, fences);
        v = v.sub(d);
        collider = collider.add(d);
        if (v.x != 0) {
            d = getContact(collider, new Vec2(v.x, 0), obstacles, fences);
            v = v.sub(d);
            collider = collider.add(d);
        }
        if (v.y != 0) {
            d = getContact(collider, new Vec2(0, v.y), obstacles, fences);
            v = v.sub(d);
            collider = collider.add(d);
        }
        var hitbox1 = collider.getAABB();
        return new Vec2(hitbox1.x - hitbox0.x, hitbox1.y - hitbox0.y);
    };
    Entity.prototype.getObstaclesFor = function (range, force) {
        // [OVERRIDE]
        return null;
    };
    Entity.prototype.getFencesFor = function (range, force) {
        // [OVERRIDE]
        return null;
    };
    Entity.prototype.collide = function (entity) {
        // [OVERRIDE]
    };
    Entity.prototype.moveIfPossible = function (v, force) {
        v = this.getMove(this.pos, v, force);
        this.movePos(v);
        return v;
    };
    return Entity;
}(Sprite));
//  Projectile
// 
var Projectile = (function (_super) {
    __extends(Projectile, _super);
    function Projectile() {
        _super.apply(this, arguments);
        this.movement = new Vec2();
        this.frame = null;
    }
    Projectile.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.movement !== null) {
            this.movePos(this.movement);
            if (this.frame !== null &&
                !this.getCollider().overlaps(this.frame)) {
                this.die();
            }
        }
    };
    return Projectile;
}(Entity));
var PhysicalEntity = (function (_super) {
    __extends(PhysicalEntity, _super);
    function PhysicalEntity() {
        _super.apply(this, arguments);
        this.velocity = new Vec2();
        this.maxspeed = new Vec2(6, 6);
        this.jumpfunc = function (vy, t) { return (0 <= t && t <= 5) ? -4 : vy + 1; };
        this._jumpt = Infinity;
        this._jumpend = 0;
        this._landed = false;
    }
    PhysicalEntity.prototype.setJumpFunc = function (jumpfunc) {
        this.jumpfunc = jumpfunc;
    };
    PhysicalEntity.prototype.setJump = function (jumpend) {
        if (0 < jumpend) {
            if (this.isLanded()) {
                this.jump();
                this._jumpt = 0;
            }
        }
        this._jumpend = jumpend;
    };
    PhysicalEntity.prototype.update = function () {
        _super.prototype.update.call(this);
        this.fall();
        if (this._jumpt < this._jumpend) {
            this._jumpt++;
        }
        else {
            this._jumpt = Infinity;
        }
    };
    PhysicalEntity.prototype.fall = function () {
        if (!this.isHolding()) {
            var vy = this.jumpfunc(this.velocity.y, this._jumpt);
            var v = new Vec2(this.velocity.x, vy);
            this.velocity = this.moveIfPossible(v, false);
            var landed = (0 < vy && this.velocity.y == 0);
            if (!this._landed && landed) {
                this.land();
            }
            this._landed = landed;
        }
    };
    PhysicalEntity.prototype.land = function () {
        // [OVERRIDE]
    };
    PhysicalEntity.prototype.jump = function () {
        // [OVERRIDE]
    };
    PhysicalEntity.prototype.isLanded = function () {
        return this._landed;
    };
    PhysicalEntity.prototype.isHolding = function () {
        return false;
    };
    return PhysicalEntity;
}(Entity));
//  PlatformerEntity
//
var PlatformerEntity = (function (_super) {
    __extends(PlatformerEntity, _super);
    function PlatformerEntity(tilemap, pos) {
        _super.call(this, pos);
        this.tilemap = tilemap;
    }
    PlatformerEntity.prototype.isHolding = function () {
        var range = this.getCollider().getAABB();
        return (this.tilemap.findTile(this.tilemap.isGrabbable, range) !== null);
    };
    PlatformerEntity.prototype.getObstaclesFor = function (range, force) {
        var f = ((force || this.isHolding()) ?
            this.tilemap.isObstacle :
            this.tilemap.isStoppable);
        return this.tilemap.getTileRects(f, range);
    };
    return PlatformerEntity;
}(PhysicalEntity));
/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
/// <reference path="entity.ts" />
function MakeGlyphs(src, color) {
    var dst = createCanvas(src.width, src.height);
    var ctx = getEdgeyContext(dst);
    ctx.clearRect(0, 0, dst.width, dst.height);
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, dst.width, dst.height);
    return dst;
}
//  Font
//
var Font = (function () {
    function Font(glyphs, color, scale) {
        if (color === void 0) { color = null; }
        if (scale === void 0) { scale = 1; }
        this._width0 = glyphs.height;
        this._height0 = glyphs.height;
        this.width = scale * this._width0;
        this.height = scale * this._height0;
        if (color === null) {
            this._glyphs = createCanvas(glyphs.width, glyphs.height);
            var ctx = getEdgeyContext(this._glyphs);
            ctx.clearRect(0, 0, glyphs.width, glyphs.height);
            ctx.drawImage(glyphs, 0, 0);
        }
        else {
            this._glyphs = MakeGlyphs(glyphs, color);
        }
    }
    Font.prototype.getSize = function (text) {
        return new Vec2(this.width * text.length, this.height);
    };
    Font.prototype.renderString = function (ctx, text, x, y) {
        for (var i = 0; i < text.length; i++) {
            var c = text.charCodeAt(i) - 32;
            ctx.drawImage(this._glyphs, c * this._width0, 0, this._width0, this._height0, x + this.width * i, y, this.width, this.height);
        }
    };
    return Font;
}());
//  ShadowFont
//
var ShadowFont = (function (_super) {
    __extends(ShadowFont, _super);
    function ShadowFont(glyphs, color, scale, shadowcolor, shadowdist) {
        if (color === void 0) { color = null; }
        if (scale === void 0) { scale = 1; }
        if (shadowcolor === void 0) { shadowcolor = 'black'; }
        if (shadowdist === void 0) { shadowdist = 1; }
        _super.call(this, glyphs, color, scale);
        this._glyphs2 = MakeGlyphs(glyphs, shadowcolor);
        this.shadowdist = shadowdist;
    }
    ShadowFont.prototype.getSize2 = function (text) {
        var size = _super.prototype.getSize.call(this, text);
        return size.move(this.shadowdist, this.shadowdist);
    };
    ShadowFont.prototype.renderString = function (ctx, text, x, y) {
        var x1 = x + this.shadowdist;
        var y1 = y + this.shadowdist;
        for (var i = 0; i < text.length; i++) {
            var c = text.charCodeAt(i) - 32;
            ctx.drawImage(this._glyphs2, c * this._width0, 0, this._width0, this._height0, x1 + this.width * i, y1, this.width, this.height);
        }
        _super.prototype.renderString.call(this, ctx, text, x, y);
    };
    return ShadowFont;
}(Font));
//  TextSegment
//
var TextSegment = (function () {
    function TextSegment(p, text, font) {
        var size = font.getSize(text);
        this.bounds = new Rect(p.x, p.y, size.x, size.y);
        this.text = text;
        this.font = font;
    }
    return TextSegment;
}());
//  TextBox
//
var TextBox = (function (_super) {
    __extends(TextBox, _super);
    function TextBox(frame, font, header) {
        if (header === void 0) { header = ''; }
        _super.call(this, new Vec2());
        this.linespace = 0;
        this.padding = 0;
        this.background = null;
        this.segments = [];
        this.frame = frame;
        this.font = font;
        this.header = header;
    }
    TextBox.prototype.toString = function () {
        return '<TextBox: ' + this.frame + '>';
    };
    TextBox.prototype.getSize = function (lines, font) {
        if (font === void 0) { font = null; }
        font = (font !== null) ? font : this.font;
        var w = 0, h = 0;
        for (var i = 0; i < lines.length; i++) {
            var size = font.getSize(lines[i]);
            w = Math.max(w, size.x);
            h = h + size.y + this.linespace;
        }
        return new Vec2(w, h - this.linespace);
    };
    TextBox.prototype.render = function (ctx, bx, by) {
        bx += this.pos.x;
        by += this.pos.y;
        if (this.background !== null) {
            var rect = this.frame.inflate(this.padding, this.padding);
            ctx.fillStyle = this.background;
            ctx.fillRect(bx + rect.x, by + rect.y, rect.width, rect.height);
        }
        for (var i = 0; i < this.segments.length; i++) {
            var seg = this.segments[i];
            seg.font.renderString(ctx, seg.text, bx + seg.bounds.x, by + seg.bounds.y);
        }
    };
    TextBox.prototype.clear = function () {
        this.segments = [];
    };
    TextBox.prototype.add = function (seg) {
        this.segments.push(seg);
    };
    TextBox.prototype.addSegment = function (p, text, font) {
        if (font === void 0) { font = null; }
        font = (font !== null) ? font : this.font;
        var seg = new TextSegment(p, text, font);
        this.add(seg);
        return seg;
    };
    TextBox.prototype.addNewline = function (font) {
        if (font === void 0) { font = null; }
        font = (font !== null) ? font : this.font;
        var x = this.frame.x;
        var y = this.frame.y;
        if (this.segments.length !== 0) {
            y = this.segments[this.segments.length - 1].bounds.bottom() + this.linespace;
        }
        var newseg = this.addSegment(new Vec2(x, y), '', font);
        var dy = newseg.bounds.bottom() - this.frame.bottom();
        if (0 < dy) {
            for (var i = this.segments.length - 1; 0 <= i; i--) {
                var seg = this.segments[i];
                seg.bounds.y -= dy;
                if (seg.bounds.y < this.frame.y) {
                    this.segments.splice(i, 1);
                }
            }
        }
        return newseg;
    };
    TextBox.prototype.addText = function (text, font) {
        font = (font !== null) ? font : this.font;
        var rx = this.frame.right();
        for (var i = 0; i < text.length;) {
            if (text[i] == '\n') {
                this.addNewline(font);
                i++;
                continue;
            }
            var j = text.indexOf('\n', i);
            if (j < 0) {
                j = text.length;
            }
            var s = text.substring(i, j);
            var size = font.getSize(s);
            var last = ((this.segments.length === 0) ? null :
                this.segments[this.segments.length - 1]);
            if (last === null || rx < last.bounds.right() + size.x) {
                last = this.addNewline(font);
            }
            else if (last.font !== font) {
                var pt = new Vec2(last.bounds.right(), last.bounds.y);
                last = this.addSegment(pt, '', font);
            }
            last.text += s;
            last.bounds.width += size.x;
            last.bounds.height = Math.max(last.bounds.height, size.y);
            i = j;
        }
    };
    TextBox.prototype.splitWords = function (x, text, font, header) {
        if (font === void 0) { font = null; }
        if (header === void 0) { header = null; }
        font = (font !== null) ? font : this.font;
        header = (header !== null) ? header : this.header;
        var line = '';
        var a = [];
        var word = /\w+\W*/;
        while (true) {
            var m = word.exec(text);
            if (m == null) {
                a.push(line + text);
                break;
            }
            var i = m.index + m[0].length;
            var w = text.substr(0, i);
            var size = font.getSize(w);
            if (this.frame.width < x + size.x) {
                a.push(line);
                line = header;
                size = font.getSize(line);
                x = this.frame.x + size.x;
            }
            line += w;
            x += size.x;
            text = text.substr(i);
        }
        return a;
    };
    TextBox.prototype.wrapLines = function (text, font, header) {
        if (font === void 0) { font = null; }
        if (header === void 0) { header = null; }
        var x = ((this.segments.length === 0) ? 0 :
            this.segments[this.segments.length - 1].bounds.right());
        var a = this.splitWords(x, text, font, header);
        var s = '';
        for (var i = 0; i < a.length; i++) {
            if (i != 0) {
                s += '\n';
            }
            s += a[i];
        }
        return s;
    };
    TextBox.prototype.putText = function (lines, halign, valign, font) {
        if (halign === void 0) { halign = 'left'; }
        if (valign === void 0) { valign = 'top'; }
        if (font === void 0) { font = null; }
        font = (font !== null) ? font : this.font;
        var y = this.frame.y;
        switch (valign) {
            case 'center':
                y += (this.frame.height - this.getSize(lines, font).y) / 2;
                break;
            case 'bottom':
                y += this.frame.height - this.getSize(lines, font).y;
                break;
        }
        for (var i = 0; i < lines.length; i++) {
            var text = lines[i];
            var size = font.getSize(text);
            var x = this.frame.x;
            switch (halign) {
                case 'center':
                    x += (this.frame.width - size.x) / 2;
                    break;
                case 'right':
                    x += this.frame.width - size.x;
                    break;
            }
            var bounds = new Rect(x, y, size.x, size.y);
            this.segments.push({ bounds: bounds, text: text, font: font });
            y += size.y + this.linespace;
        }
    };
    return TextBox;
}(Sprite));
//  TextTask
//
var TextTask = (function (_super) {
    __extends(TextTask, _super);
    function TextTask(dialog) {
        _super.call(this);
        this.dialog = dialog;
    }
    TextTask.prototype.ff = function () {
    };
    TextTask.prototype.keydown = function (key) {
        this.ff();
    };
    return TextTask;
}(Task));
//  PauseTask
//
var PauseTask = (function (_super) {
    __extends(PauseTask, _super);
    function PauseTask(dialog, duration) {
        _super.call(this, dialog);
        this.lifetime = duration;
    }
    PauseTask.prototype.ff = function () {
        this.die();
    };
    return PauseTask;
}(TextTask));
//  DisplayTask
//
var DisplayTask = (function (_super) {
    __extends(DisplayTask, _super);
    function DisplayTask(dialog, text) {
        _super.call(this, dialog);
        this.speed = 0;
        this.sound = null;
        this._index = 0;
        this.text = text;
        this.font = dialog.font;
    }
    DisplayTask.prototype.tick = function (t) {
        _super.prototype.tick.call(this, t);
        if (this.text.length <= this._index) {
            this.die();
        }
        else if (this.speed === 0) {
            this.ff();
        }
        else {
            var n = this.time * this.speed;
            var sound = false;
            while (this._index < n) {
                var c = this.text.substr(this._index, 1);
                this.dialog.addText(c, this.font);
                this._index++;
                sound = sound || (/\w/.test(c));
            }
            if (sound && this.sound !== null) {
                playSound(this.sound);
            }
        }
    };
    DisplayTask.prototype.ff = function () {
        while (this._index < this.text.length) {
            this.dialog.addText(this.text.substr(this._index, 1), this.font);
            this._index++;
        }
        this.die();
    };
    return DisplayTask;
}(TextTask));
//  MenuTask
//
var MenuItem = (function () {
    function MenuItem(pos, text, value) {
        this.pos = pos;
        this.text = text;
        this.value = value;
    }
    return MenuItem;
}());
var MenuTask = (function (_super) {
    __extends(MenuTask, _super);
    function MenuTask(dialog) {
        _super.call(this, dialog);
        this.vertical = false;
        this.items = [];
        this.current = null;
        this.sound = null;
        this.font = dialog.font;
        this.cursor = new TextSegment(new Vec2(), '>', this.font);
        this.selected = new Slot(this);
    }
    MenuTask.prototype.addItem = function (pos, text, value) {
        if (value === void 0) { value = null; }
        value = (value !== null) ? value : text;
        var item = new MenuItem(pos, text, value);
        this.items.push(item);
        return item;
    };
    MenuTask.prototype.start = function (layer) {
        _super.prototype.start.call(this, layer);
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            this.dialog.addSegment(item.pos, item.text, this.font);
        }
        this.updateCursor();
    };
    MenuTask.prototype.ff = function () {
    };
    MenuTask.prototype.keydown = function (key) {
        var d = 0;
        var keysym = getKeySym(key);
        switch (keysym) {
            case KeySym.Left:
                d = (this.vertical) ? -999 : -1;
                break;
            case KeySym.Right:
                d = (this.vertical) ? +999 : +1;
                break;
            case KeySym.Up:
                d = (this.vertical) ? -1 : -999;
                break;
            case KeySym.Down:
                d = (this.vertical) ? +1 : +999;
                break;
            case KeySym.Action:
                if (this.current !== null) {
                    this.die();
                    this.selected.signal(this.current.value);
                }
                ;
                return;
            case KeySym.Cancel:
                this.die();
                this.selected.signal(null);
                return;
        }
        var i = ((this.current === null) ? 0 :
            this.items.indexOf(this.current));
        i = clamp(0, i + d, this.items.length - 1);
        this.current = this.items[i];
        this.updateCursor();
        if (this.sound !== null) {
            playSound(this.sound);
        }
    };
    MenuTask.prototype.updateCursor = function () {
        if (this.current !== null) {
            this.cursor.bounds.x = this.current.pos.x - this.cursor.bounds.width * 2;
            this.cursor.bounds.y = this.current.pos.y;
            this.dialog.cursor = this.cursor;
        }
    };
    return MenuTask;
}(TextTask));
//  DialogBox
//
var DialogBox = (function (_super) {
    __extends(DialogBox, _super);
    function DialogBox(frame, font, header) {
        if (header === void 0) { header = ''; }
        _super.call(this, frame, font, header);
        this.speed = 0;
        this.autohide = false;
        this.sound = null;
        this.queue = [];
        this.cursor = null;
        this.blinking = 0;
    }
    DialogBox.prototype.render = function (ctx, bx, by) {
        _super.prototype.render.call(this, ctx, bx, by);
        var cursor = this.cursor;
        if (cursor !== null) {
            bx += this.pos.x;
            by += this.pos.y;
            if (phase(this.time, this.blinking)) {
                cursor.font.renderString(ctx, cursor.text, bx + cursor.bounds.x, by + cursor.bounds.y);
            }
        }
    };
    DialogBox.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this.queue = [];
        this.cursor = null;
    };
    DialogBox.prototype.tick = function (t) {
        _super.prototype.tick.call(this, t);
        var task = null;
        while (true) {
            task = this.getCurrentTask();
            if (task === null)
                break;
            if (task.layer === null) {
                task.start(this.layer);
            }
            task.tick(t);
            if (task.alive)
                break;
            this.removeTask(task);
        }
        if (this.autohide && task === null) {
            this.visible = false;
        }
    };
    DialogBox.prototype.keydown = function (key) {
        while (true) {
            var task = this.getCurrentTask();
            if (task === null)
                break;
            if (task.layer === null) {
                task.start(this.layer);
            }
            task.keydown(key);
            if (task.alive)
                break;
            this.removeTask(task);
            break;
        }
    };
    DialogBox.prototype.ff = function () {
        while (true) {
            var task = this.getCurrentTask();
            if (task === null)
                break;
            if (task.layer === null) {
                task.start(this.layer);
            }
            task.ff();
            if (task.alive)
                break;
            this.removeTask(task);
        }
    };
    DialogBox.prototype.getCurrentTask = function () {
        return (0 < this.queue.length) ? this.queue[0] : null;
    };
    DialogBox.prototype.addTask = function (task) {
        this.queue.push(task);
        if (this.autohide) {
            this.visible = true;
        }
    };
    DialogBox.prototype.removeTask = function (task) {
        removeElement(this.queue, task);
        if (this.autohide && this.queue.length == 0) {
            this.visible = false;
        }
    };
    DialogBox.prototype.addPause = function (ticks) {
        var task = new PauseTask(this, ticks);
        this.addTask(task);
        return task;
    };
    DialogBox.prototype.addDisplay = function (text, speed, sound, font) {
        if (speed === void 0) { speed = -1; }
        if (sound === void 0) { sound = null; }
        if (font === void 0) { font = null; }
        var task = new DisplayTask(this, text);
        task.speed = (0 <= speed) ? speed : this.speed;
        task.sound = (sound !== null) ? sound : this.sound;
        task.font = (font !== null) ? font : this.font;
        this.addTask(task);
        return task;
    };
    DialogBox.prototype.addMenu = function (font) {
        if (font === void 0) { font = null; }
        var task = new MenuTask(this);
        task.font = (font !== null) ? font : this.font;
        this.addTask(task);
        return task;
    };
    return DialogBox;
}(TextBox));
/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
/// <reference path="entity.ts" />
//  Layer
// 
var Layer = (function () {
    function Layer() {
        this.time = 0;
        this.init();
    }
    Layer.prototype.toString = function () {
        return ('<Layer: tasks=' + this.tasks + ', sprites=' +
            this.sprites + ', entities=' + this.entities + '>');
    };
    Layer.prototype.init = function () {
        this.tasks = [];
        this.sprites = [];
        this.entities = [];
    };
    Layer.prototype.tick = function (t) {
        this.time = t;
        for (var _i = 0, _a = this.tasks; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj.alive) {
                obj.tick(t);
            }
        }
        this.cleanObjects(this.tasks);
        this.cleanObjects(this.sprites);
        this.cleanObjects(this.entities);
        this.checkCollisions();
    };
    Layer.prototype.render = function (ctx, bx, by) {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj.alive && obj.visible) {
                obj.render(ctx, bx, by);
            }
        }
    };
    Layer.prototype.moveAll = function (v) {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (!obj.alive)
                continue;
            if (obj.getBounds() === null)
                continue;
            obj.pos = obj.pos.add(v);
        }
    };
    Layer.prototype.addObject = function (obj) {
        if (obj instanceof Task) {
            if (obj.layer === null) {
                obj.start(this);
            }
            this.tasks.push(obj);
        }
        if (obj instanceof Sprite) {
            this.sprites.push(obj);
            this.sprites.sort(function (a, b) { return a.zOrder - b.zOrder; });
        }
        if (obj instanceof Entity) {
            this.entities.push(obj);
        }
    };
    Layer.prototype.removeObject = function (obj) {
        if (obj instanceof Task) {
            removeElement(this.tasks, obj);
        }
        if (obj instanceof Sprite) {
            removeElement(this.sprites, obj);
        }
        if (obj instanceof Entity) {
            removeElement(this.entities, obj);
        }
    };
    Layer.prototype.checkCollisions = function () {
        for (var i = 0; i < this.entities.length; i++) {
            var obj0 = this.entities[i];
            if (obj0.alive && obj0.collider !== null) {
                var a = this.findObjects(obj0.getCollider(), this.entities.slice(i + 1));
                for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
                    var obj1 = a_1[_i];
                    obj0.collide(obj1);
                    obj1.collide(obj0);
                }
            }
        }
    };
    Layer.prototype.findObjects = function (shape, objs, f) {
        if (objs === void 0) { objs = null; }
        if (f === void 0) { f = null; }
        if (objs === null) {
            objs = this.entities;
        }
        var a = [];
        for (var _i = 0, objs_1 = objs; _i < objs_1.length; _i++) {
            var obj1 = objs_1[_i];
            if (obj1.alive && obj1.collider !== null &&
                (f === null || f(obj1)) &&
                obj1.getCollider().overlaps(shape)) {
                a.push(obj1);
            }
        }
        return a;
    };
    Layer.prototype.cleanObjects = function (objs) {
        removeElements(objs, function (obj) { return !obj.alive; });
    };
    return Layer;
}());
//  ScrollLayer
// 
var ScrollLayer = (function (_super) {
    __extends(ScrollLayer, _super);
    function ScrollLayer(window) {
        _super.call(this);
        this.window = window;
    }
    ScrollLayer.prototype.toString = function () {
        return '<ScrollLayer: ' + this.window + '>';
    };
    ScrollLayer.prototype.moveCenter = function (v) {
        this.window = this.window.add(v);
    };
    ScrollLayer.prototype.setCenter = function (bounds, rect) {
        if (this.window.width < rect.width) {
            this.window.x = (rect.width - this.window.width) / 2;
        }
        else if (rect.x < this.window.x) {
            this.window.x = rect.x;
        }
        else if (this.window.x + this.window.width < rect.x + rect.width) {
            this.window.x = rect.x + rect.width - this.window.width;
        }
        if (this.window.height < rect.height) {
            this.window.y = (rect.height - this.window.height) / 2;
        }
        else if (rect.y < this.window.y) {
            this.window.y = rect.y;
        }
        else if (this.window.y + this.window.height < rect.y + rect.height) {
            this.window.y = rect.y + rect.height - this.window.height;
        }
        this.window.x = clamp(0, this.window.x, bounds.width - this.window.width);
        this.window.y = clamp(0, this.window.y, bounds.height - this.window.height);
    };
    ScrollLayer.prototype.render = function (ctx, bx, by) {
        bx -= this.window.x;
        by -= this.window.y;
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj.alive && obj.visible) {
                var bounds = obj.getBounds();
                if (bounds === null || bounds.overlaps(this.window)) {
                    obj.render(ctx, bx, by);
                }
            }
        }
    };
    return ScrollLayer;
}(Layer));
/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
/// <reference path="entity.ts" />
/// <reference path="layer.ts" />
//  Scene
//
var Scene = (function () {
    function Scene(app) {
        this.app = app;
        this.screen = new Rect(0, 0, app.screen.width, app.screen.height);
    }
    Scene.prototype.changeScene = function (scene) {
        var app = this.app;
        app.post(function () { app.init(scene); });
    };
    Scene.prototype.init = function () {
        // [OVERRIDE]
    };
    Scene.prototype.tick = function (t) {
        // [OVERRIDE]
    };
    Scene.prototype.render = function (ctx, bx, by) {
        // [OVERRIDE]
    };
    Scene.prototype.setDir = function (v) {
        // [OVERRIDE]
    };
    Scene.prototype.setAction = function (action) {
        // [OVERRIDE]
    };
    Scene.prototype.setCancel = function (cancel) {
        // [OVERRIDE]
    };
    Scene.prototype.keydown = function (key) {
        // [OVERRIDE]
    };
    Scene.prototype.keyup = function (key) {
        // [OVERRIDE]
    };
    Scene.prototype.mousedown = function (x, y, button) {
        // [OVERRIDE]
    };
    Scene.prototype.mouseup = function (x, y, button) {
        // [OVERRIDE]
    };
    Scene.prototype.mousemove = function (x, y) {
        // [OVERRIDE]
    };
    return Scene;
}());
//  HTMLScene
//
var HTMLScene = (function (_super) {
    __extends(HTMLScene, _super);
    function HTMLScene(app, text) {
        _super.call(this, app);
        this.text = text;
    }
    HTMLScene.prototype.init = function () {
        _super.prototype.init.call(this);
        var scene = this;
        var frame = this.app.frame;
        var e = this.app.addElement(new Rect(frame.width / 8, frame.height / 4, 3 * frame.width / 4, frame.height / 2));
        e.align = 'left';
        e.style.padding = '10px';
        e.style.color = 'black';
        e.style.background = 'white';
        e.style.border = 'solid black 2px';
        e.innerHTML = this.text;
        e.onmousedown = (function (e) { scene.change(); });
    };
    HTMLScene.prototype.render = function (ctx, bx, by) {
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    };
    HTMLScene.prototype.change = function () {
        // [OVERRIDE]
    };
    HTMLScene.prototype.mousedown = function (x, y, button) {
        this.change();
    };
    HTMLScene.prototype.keydown = function (key) {
        this.change();
    };
    return HTMLScene;
}(Scene));
//  GameScene
// 
var GameScene = (function (_super) {
    __extends(GameScene, _super);
    function GameScene(app) {
        _super.call(this, app);
        this.layer = new ScrollLayer(this.screen);
    }
    GameScene.prototype.init = function () {
        // [OVERRIDE]
        _super.prototype.init.call(this);
        this.layer.init();
        this.entities = this.layer.entities;
    };
    GameScene.prototype.tick = function (t) {
        // [OVERRIDE]
        _super.prototype.tick.call(this, t);
        this.layer.tick(t);
    };
    GameScene.prototype.render = function (ctx, bx, by) {
        // [OVERRIDE]
        _super.prototype.render.call(this, ctx, bx, by);
        this.layer.render(ctx, bx, by);
    };
    GameScene.prototype.addObject = function (obj) {
        this.layer.addObject(obj);
    };
    GameScene.prototype.removeObject = function (obj) {
        this.layer.removeObject(obj);
    };
    return GameScene;
}(Scene));
/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
/// <reference path="text.ts" />
/// <reference path="scene.ts" />
//  App
//  handles the event loop and global state management.
//  It also has shared resources (images, audios, etc.)
//
var App = (function () {
    function App(framerate, scale, frame, images, audios, labels) {
        this.ticks = 0;
        this.scene = null;
        this.active = false;
        this.keyDir = new Vec2();
        this.keyAction = false;
        this.keyCancel = false;
        this._keylock = 0;
        this._msgs = [];
        this._music = null;
        this._loop_start = 0;
        this._loop_end = 0;
        this._key_left = false;
        this._key_right = false;
        this._key_up = false;
        this._key_down = false;
        this.framerate = framerate;
        this.frame = frame;
        this.images = images;
        this.audios = audios;
        this.labels = labels;
        this.font = new Font(this.images['font'], 'white');
        this.colorFont = new Font(this.images['font'], null);
        this.shadowFont = new ShadowFont(this.images['font'], 'white');
        // Initialize the off-screen bitmap.
        this.screen = createCanvas(this.frame.width / scale, this.frame.height / scale);
        this.ctx = getEdgeyContext(this.screen);
    }
    App.prototype.addElement = function (bounds) {
        var e = document.createElement('div');
        e.style.position = 'absolute';
        e.style.left = bounds.x + 'px';
        e.style.top = bounds.y + 'px';
        e.style.width = bounds.width + 'px';
        e.style.height = bounds.height + 'px';
        e.style.padding = '0px';
        this.frame.parentNode.appendChild(e);
        return e;
    };
    App.prototype.removeElement = function (e) {
        e.parentNode.removeChild(e);
    };
    App.prototype.lockKeys = function () {
        this._keylock = this.framerate;
    };
    App.prototype.keydown = function (ev) {
        if (0 < this._keylock)
            return;
        // [OVERRIDE]
        // [GAME SPECIFIC CODE]
        var keysym = getKeySym(ev.keyCode);
        switch (keysym) {
            case KeySym.Left:
                this._key_left = true;
                this.keyDir.x = -1;
                this.scene.setDir(this.keyDir);
                break;
            case KeySym.Right:
                this._key_right = true;
                this.keyDir.x = +1;
                this.scene.setDir(this.keyDir);
                break;
            case KeySym.Up:
                this._key_up = true;
                this.keyDir.y = -1;
                this.scene.setDir(this.keyDir);
                break;
            case KeySym.Down:
                this._key_down = true;
                this.keyDir.y = +1;
                this.scene.setDir(this.keyDir);
                break;
            case KeySym.Action:
                if (!this.keyAction) {
                    this.keyAction = true;
                    this.scene.setAction(this.keyAction);
                }
                break;
            case KeySym.Cancel:
                if (!this.keyCancel) {
                    this.keyCancel = true;
                    this.scene.setCancel(this.keyCancel);
                }
                break;
            default:
                switch (ev.keyCode) {
                    case 112:
                        break;
                    case 27:
                        if (this.active) {
                            this.blur();
                        }
                        else {
                            this.focus();
                        }
                        break;
                }
                break;
        }
        this.scene.keydown(ev.keyCode);
    };
    App.prototype.keyup = function (ev) {
        // [OVERRIDE]
        // [GAME SPECIFIC CODE]
        var keysym = getKeySym(ev.keyCode);
        switch (keysym) {
            case KeySym.Left:
                this._key_left = false;
                this.keyDir.x = (this._key_right) ? +1 : 0;
                this.scene.setDir(this.keyDir);
                break;
            case KeySym.Right:
                this._key_right = false;
                this.keyDir.x = (this._key_left) ? -1 : 0;
                this.scene.setDir(this.keyDir);
                break;
            case KeySym.Up:
                this._key_up = false;
                this.keyDir.y = (this._key_down) ? +1 : 0;
                this.scene.setDir(this.keyDir);
                break;
            case KeySym.Down:
                this._key_down = false;
                this.keyDir.y = (this._key_up) ? -1 : 0;
                this.scene.setDir(this.keyDir);
                break;
            case KeySym.Action:
                if (this.keyAction) {
                    this.keyAction = false;
                    this.scene.setAction(this.keyAction);
                }
                break;
            case KeySym.Cancel:
                if (this.keyCancel) {
                    this.keyCancel = false;
                    this.scene.setCancel(this.keyCancel);
                }
                break;
        }
        this.scene.keyup(ev.keyCode);
    };
    App.prototype.mousedown = function (ev) {
        // [OVERRIDE]
        if (ev.target === this.frame) {
            this.scene.mousedown(ev.layerX * this.screen.width / this.frame.width, ev.layerY * this.screen.height / this.frame.height, ev.button);
        }
    };
    App.prototype.mouseup = function (ev) {
        // [OVERRIDE]
        if (ev.target === this.frame) {
            this.scene.mouseup(ev.layerX * this.screen.width / this.frame.width, ev.layerY * this.screen.height / this.frame.height, ev.button);
        }
    };
    App.prototype.mousemove = function (ev) {
        // [OVERRIDE]
        if (ev.target === this.frame) {
            this.scene.mousemove(ev.layerX * this.screen.width / this.frame.width, ev.layerY * this.screen.height / this.frame.height);
        }
    };
    App.prototype.focus = function () {
        // [OVERRIDE]
        this.active = true;
        if (this._music !== null && 0 < this._music.currentTime) {
            this._music.play();
        }
    };
    App.prototype.blur = function () {
        // [OVERRIDE]
        if (this._music !== null) {
            this._music.pause();
        }
        this.active = false;
    };
    App.prototype.init = function (scene) {
        // [OVERRIDE]
        removeChildren(this.frame.parentNode, 'div');
        this.setMusic();
        this.scene = scene;
        this.scene.init();
    };
    App.prototype.setMusic = function (music, start, end) {
        if (music === void 0) { music = null; }
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = 0; }
        if (this._music !== null) {
            this._music.pause();
        }
        this._music = music;
        this._loop_start = start;
        this._loop_end = end;
        if (this._music !== null) {
            if (0 < this._music.readyState) {
                this._music.currentTime = 0;
            }
            this._music.play();
        }
    };
    App.prototype.post = function (msg) {
        this._msgs.push(msg);
    };
    App.prototype.tick = function () {
        // [OVERRIDE]
        // [GAME SPECIFIC CODE]
        this.scene.tick(this.ticks / this.framerate);
        this.ticks++;
        if (0 < this._keylock) {
            this._keylock--;
        }
        if (this._music !== null &&
            this._loop_start < this._loop_end &&
            this._loop_end <= this._music.currentTime) {
            this._music.currentTime = this._loop_start;
        }
        while (0 < this._msgs.length) {
            var msg = this._msgs.shift();
            msg();
        }
    };
    App.prototype.repaint = function () {
        // [OVERRIDE]
        this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
        this.ctx.save();
        this.scene.render(this.ctx, 0, 0);
        this.ctx.restore();
    };
    return App;
}());
//  Global App instance.
var APP;
// main: sets up the browser interaction.
function main(scene0, canvasId, scale, framerate) {
    if (canvasId === void 0) { canvasId = 'game'; }
    if (scale === void 0) { scale = 2; }
    if (framerate === void 0) { framerate = 30; }
    function getprops(a) {
        var d = {};
        for (var i = 0; i < a.length; i++) {
            d[a[i].id] = a[i];
        }
        return d;
    }
    var images = getprops(document.getElementsByTagName('img'));
    var audios = getprops(document.getElementsByTagName('audio'));
    var labels = getprops(document.getElementsByClassName('label'));
    var frame = document.getElementById(canvasId);
    var ctx = getEdgeyContext(frame);
    APP = new App(framerate, scale, frame, images, audios, labels);
    var timer;
    function repaint() {
        ctx.drawImage(APP.screen, 0, 0, APP.screen.width, APP.screen.height, 0, 0, frame.width, frame.height);
    }
    function tick() {
        if (APP.active) {
            APP.tick();
            APP.repaint();
            repaint();
        }
    }
    function keydown(e) {
        if (APP.active) {
            switch (e.keyCode) {
                case 17: // Control
                case 18:
                    break;
                default:
                    APP.keydown(e);
                    break;
            }
            switch (e.keyCode) {
                case 8: // Backspace
                case 9: // Tab
                case 13: // Return
                case 14: // Enter
                case 32: // Space
                case 33: // PageUp
                case 34: // PageDown
                case 35: // End
                case 36: // Home
                case 37: // Left
                case 38: // Up
                case 39: // Right
                case 40:
                    e.preventDefault();
                    break;
            }
        }
    }
    function keyup(e) {
        if (APP.active) {
            switch (e.keyCode) {
                case 17: // Control
                case 18:
                    break;
                default:
                    APP.keyup(e);
                    break;
            }
        }
    }
    function mousedown(e) {
        if (APP.active) {
            APP.mousedown(e);
        }
    }
    function mouseup(e) {
        if (APP.active) {
            APP.mouseup(e);
        }
    }
    function mousemove(e) {
        if (APP.active) {
            APP.mousemove(e);
        }
    }
    function focus(e) {
        if (!APP.active) {
            APP.focus();
            repaint();
        }
    }
    function blur(e) {
        if (APP.active) {
            APP.blur();
            repaint();
        }
        var size = 50;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,64, 0.5)'; // gray out.
        ctx.fillRect(0, 0, frame.width, frame.height);
        ctx.fillStyle = 'lightgray';
        ctx.beginPath(); // draw a play button.
        ctx.moveTo(frame.width / 2 - size, frame.height / 2 - size);
        ctx.lineTo(frame.width / 2 - size, frame.height / 2 + size);
        ctx.lineTo(frame.width / 2 + size, frame.height / 2);
        ctx.fill();
        ctx.restore();
    }
    APP.init(new scene0(APP));
    APP.focus();
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('mousedown', mousedown);
    window.addEventListener('mouseup', mouseup);
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('focus', focus);
    window.addEventListener('blur', blur);
    timer = window.setInterval(tick, 1000 / framerate);
    frame.focus();
}
/// <reference path="base/utils.ts" />
/// <reference path="base/geom.ts" />
/// <reference path="base/entity.ts" />
/// <reference path="base/text.ts" />
/// <reference path="base/scene.ts" />
/// <reference path="base/app.ts" />
///  game.ts
///
//  Thingy
//
var Thingy = (function (_super) {
    __extends(Thingy, _super);
    function Thingy(pos) {
        _super.call(this, pos);
        this.imgsrc = new FillImageSource('gold', new Rect(-8, -8, 16, 16));
        this.collider = this.imgsrc.dstRect.inflate(-2, -2);
    }
    return Thingy;
}(Entity));
//  Enemy
//
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(tilemap, pos, color, movement) {
        _super.call(this, tilemap, pos);
        this.imgsrc = new FillImageSource(color, new Rect(-8, -8, 16, 16));
        this.collider = this.imgsrc.dstRect.inflate(-2, -2);
        this.movement = movement;
        this.jumpfunc = function (vy, t) { return vy; };
    }
    Enemy.prototype.update = function () {
        _super.prototype.update.call(this);
        var v = this.moveIfPossible(this.movement, true);
        if (!v.equals(this.movement)) {
            this.movement = this.movement.scale(-1);
        }
    };
    Enemy.prototype.getFencesFor = function (range, force) {
        return [this.tilemap.bounds];
    };
    return Enemy;
}(PlatformerEntity));
//  Player
//
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(scene, pos) {
        _super.call(this, scene.tilemap, pos);
        this.scene = scene;
        this.imgsrc = new FillImageSource('white', new Rect(-8, -8, 16, 16));
        this.collider = this.imgsrc.dstRect.inflate(-2, -2);
        this.usermove = new Vec2();
        this.setJumpFunc(function (vy, t) {
            return (0 <= t && t <= 5) ? -8 : vy + 2;
        });
        this.good = true;
    }
    Player.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.good) {
            this.moveIfPossible(this.usermove, true);
        }
    };
    Player.prototype.collide = function (entity) {
        if (this.good) {
            if (entity instanceof Thingy) {
                entity.die();
            }
            else if (entity instanceof Enemy) {
                this.stop();
            }
        }
    };
    Player.prototype.setMove = function (v) {
        this.usermove.x = clamp(-8, v.x, +8);
    };
    Player.prototype.setJump = function (jumpend) {
        if (this.good) {
            _super.prototype.setJump.call(this, jumpend);
        }
    };
    Player.prototype.getFencesFor = function (range, force) {
        if (this.good) {
            return [this.tilemap.bounds];
        }
        else {
            return [];
        }
    };
    Player.prototype.getObstaclesFor = function (range, force) {
        if (this.good) {
            return _super.prototype.getObstaclesFor.call(this, range, force);
        }
        else {
            return [];
        }
    };
    Player.prototype.stop = function () {
        this.setJump(Infinity);
        this.lifetime = this.time + 2;
        this.good = false;
    };
    return Player;
}(PlatformerEntity));
//  Game
// 
var Game = (function (_super) {
    __extends(Game, _super);
    function Game(app) {
        _super.call(this, app);
        this.mouse = new Vec2();
        this.tiles = new SimpleSpriteSheet([
            new FillImageSource('black', new Rect(0, 0, 16, 16)),
            new FillImageSource('red', new Rect(0, 0, 16, 16)),
        ]);
    }
    Game.prototype.init = function () {
        var _this = this;
        _super.prototype.init.call(this);
        var MAP = [
            "00000000000000000002",
            "00020001001041100001",
            "01111100000000000110",
            "00040000130000000400",
            "00000000000100200000",
            "00002001100000100000",
            "00011000000301111020",
            "11000100000000000010",
            "00000012000110200000",
            "04114000110000011000",
            "00000001000001000100",
            "02000000030001204021",
            "11111111011111100010",
            "90000200000000001002",
            "11111111111111111111",
        ];
        this.tilemap = new TileMap(16, MAP.map(function (v) { return str2array(v); }));
        this.tilemap.isObstacle = (function (c) { return c == 1; });
        this.tilemap.isStoppable = (function (c) { return c == 1; });
        this.tilemap.isGrabbable = (function (c) { return false; });
        this.player = new Player(this, this.screen.center());
        this.addObject(this.player);
        this.tilemap.apply(function (x, y, c) {
            var pos = _this.tilemap.map2coord(new Vec2(x, y)).center();
            switch (c) {
                case 2:
                    _this.addObject(new Thingy(pos));
                    _this.tilemap.set(x, y, 0);
                    break;
                case 3:
                    _this.addObject(new Enemy(_this.tilemap, pos, 'purple', new Vec2(1, 0)));
                    _this.tilemap.set(x, y, 0);
                    break;
                case 4:
                    _this.addObject(new Enemy(_this.tilemap, pos, 'green', new Vec2(0, 1)));
                    _this.tilemap.set(x, y, 0);
                    break;
                case 9:
                    _this.player.pos = pos;
                    _this.tilemap.set(x, y, 0);
                    break;
            }
            return false;
        });
        this.player.died.subscribe(function (player) { _this.init(); });
        var textbox = new TextBox(this.screen, APP.font);
        textbox.putText(["GET YELLOW THINGIES!"], 'center', 'center');
        textbox.lifetime = 3;
        this.addObject(textbox);
    };
    Game.prototype.tick = function (t) {
        _super.prototype.tick.call(this, t);
        var v = this.mouse.sub(this.player.pos);
        this.player.setMove(v);
        this.player.setJump(-v.y - 4);
    };
    Game.prototype.mousemove = function (x, y) {
        this.mouse = new Vec2(x, y);
    };
    Game.prototype.render = function (ctx, bx, by) {
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(bx, by, this.screen.width, this.screen.height);
        this.tilemap.renderFromBottomLeft(ctx, bx, by, this.tiles, function (x, y, c) { return c; });
        _super.prototype.render.call(this, ctx, bx, by);
    };
    return Game;
}(GameScene));
