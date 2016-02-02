// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: app.js
'use strict';

function func_sine(freq)
{
  var t0 = Math.random();
  return (function (t) { return Math.sin(freq*(t+t0)); });
}

function func_saw(freq)
{
  var t0 = Math.random();
  var w = 1.0/freq;
  return (function (t) { return 1-2*(t+t0-int((t+t0)/w)*w)/w; });
}

function func_square(freq)
{
  var t0 = Math.random();
  var w = 1.0/freq;
  return (function (t) { return ((t+t0-int((t+t0)/w)*w)/w < 0.5)? +1 : -1; });
}

function func_random(freq)
{
  freq = int(freq);
  var t0 = Math.random();
  var w = 1.0/freq;
  var v = [];
  for (var i = 0; i < freq; i++) {
    v.push(Math.random()*2-1);
  }
  return (function (t) { return v[int((t+t0)/w) % freq]; });
}

function addfuncs(funcs)
{
  return (function (t) {
    var v = 0.0;
    for (var i in funcs) {
      v += funcs[i](t);
    }
    return v/funcs.length;
  });
}

function Wave(scene, bounds)
{
  this._Sprite(bounds);
  this.scene = scene;
  this.func = (function (t) { return 0; });
  this.chosen = false;
  this.selected = false;
  this.answer = false;
  this.t = 0;
  this.dt = 0;
}
define(Wave, Sprite, 'Sprite', {
  reset: function (func, speed) {
    this.func = func;
    this.chosen = false;
    this.selected = false;
    this.answer = false;
    this.t = 0;
    this.dt = Math.random()*speed;
  },
  
  update: function () {
    this._Sprite_update();
    this.t += this.dt;
  },

  render: function (ctx, bx, by) {
    this._Sprite_render(ctx, bx, by);
    var color = (this.selected)? 'red' : 'white';
    if (this.answer) {
      color = (this.chosen)? 'rgb(0,255,0)' : 'gray';
    } else if (this.scene.focus === this && blink(this.getTime(), 15)) {
      color = 'yellow';
    }
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.strokeRect(bx+this.bounds.x+.5, by+this.bounds.y+.5,
		   this.bounds.width, this.bounds.height);
    var x = bx+this.bounds.x+.5;
    var y = by+this.bounds.centery()+.5;
    var h = this.bounds.height/2-2;
    ctx.moveTo(bx+this.bounds.x+.5, y+.5);
    for (var dx = 0; dx < this.bounds.width; dx++) {
      var t = this.t + dx/this.bounds.width;
      ctx.lineTo(x+dx, y+h*this.func(t));
    }
    ctx.stroke();
  },
});

function Wave0(scene, bounds)
{
  this._Wave(scene, bounds);
}
define(Wave0, Wave, 'Wave', {
  render: function (ctx, bx, by) {
    this._Wave_render(ctx, bx, by);
    ctx.strokeRect(bx+this.bounds.x-2+.5, by+this.bounds.y-2+.5,
		   this.bounds.width+4, this.bounds.height+4);
  },
});


//  Game
//
function Game(app)
{
  this._GameScene(app);
}

define(Game, GameScene, 'GameScene', {
  init: function () {
    this._GameScene_init();

    var app = this.app;

    var ww = (this.screen.width-10*4)/2;
    var hh = (this.screen.height-8*5)/4;
    this.waves = [];
    for (var i = 0; i < 6; i++) {
      var x = i % 2;
      var y = 1+int(i / 2);
      var rect = new Rectangle(10+(ww+20)*x, 8+(hh+8)*y, ww, hh);
      var wave = new Wave(this, rect);
      this.waves.push(wave);
      this.addObject(wave);
    }
    var rect = new Rectangle((this.screen.width-ww)/2, 8, ww, hh);
    this.wave0 = new Wave0(this, rect);
    this.addObject(this.wave0);
    
    this.textbox = new TextBox(this.screen.inflate(-20,-90), app.font);
    this.textbox.background = 'rgba(0,0,0,0.7)';
    this.textbox.linespace = 8;
    this.addObject(this.textbox);

    this.levelbox = new TextBox(new Rectangle(10,10,60,20), app.font);
    this.levelbox.linespace = 8;
    this.addObject(this.levelbox);
    
    this.showText(['CHOOSE THE RIGHT MIX OF WAVES.',
		   'SELECT: SPACE, CONFIRM:RETURN']);
    this.next = null;
    this.initLevel(0);
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,64,128)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    this._GameScene_render(ctx, bx, by);
  },

  keydown: function (key) {
    this._GameScene_keydown(key);
    if (this.textbox.visible) {
      this.textbox.visible = false;
      if (this.next !== null) {
	this.next();
      }
    } else {
      switch (key) {
      case 13:			// ENTER
	this.focus = null;
	this.judge();
	break;
      case 32:			// SPACE
	if (this.focus !== null) {
	  this.focus.selected = !this.focus.selected;
	  playSound(this.focus.selected?
		    this.app.audios.select :
		    this.app.audios.cancel);
	}
	break;
      }
    }
  },

  set_dir: function (vx, vy) {
    this._GameScene_set_dir(vx, vy);
    var i = this.waves.indexOf(this.focus);
    var x0 = i % 2;
    var y0 = int(i / 2);
    var x1 = clamp(0, x0+vx, 1);
    var y1 = clamp(0, y0+vy, 2);
    if (x0 != x1 || y0 != y1) {
      playSound(this.app.audios.beep);
      this.focus = this.waves[y1*2+x1];
    }
  },

  showText: function (lines) {
    this.textbox.clear();
    this.textbox.putText(lines, 'center', 'center');
    this.textbox.visible = true;
    this.next = null;
  },			 

  initLevel: function (level) {
    var n, speed;
    switch (level) {
    case 0:
    case 1:
    case 2:
      n = 2
      speed = 0.02*level;
      break;
    default:
      n = 3;
      speed = (level-3)*0.03;
      break;
    }

    var params = [];
    for (var i in this.waves) {
      var loop = true;
      var p1;
      while (loop) {
	switch (rnd(4)) {
	case 0:
	  p1 = {f:func_sine, q:rnd(2, 20)};
	  break;
	case 1:
	  p1 = {f:func_saw, q:rnd(2, 10)};
	  break;
	case 2:
	  p1 = {f:func_square, q:rnd(4, 10)};
	  break;
	default:
	  p1 = {f:func_random, q:rnd(2, 30)};
	  break;
	}
	loop = false;
	for (var j in params) {
	  var p0 = params[j];
	  if (p0.f === p1.f &&
	      (p0.q < p1.q*2 && p1.q < p0.q*2)) {
	    loop = true;
	    break;
	  }
	}
      }
      var wave = this.waves[i];
      wave.reset(p1.f(p1.q), speed);
      params.push(p1);
    }

    var waves = this.waves.slice();
    var funcs = [];
    while (n < waves.length) {
      waves.splice(rnd(waves.length), 1);
    }
    for (var i in waves) {
      var wave = waves[i];
      funcs.push(wave.func);
      wave.chosen = true;
    }
    this.wave0.reset(addfuncs(funcs), speed);

    this.levelbox.clear();
    this.levelbox.putText(['LEVEL:'+(1+level), 'WAVES:'+n]);
    this.level = level;
    this.focus = null;
  },

  judge: function () {
    var ok = true;
    for (var i in this.waves) {
      var wave = this.waves[i];
      if (wave.chosen != wave.selected) {
	ok = false;
      }
      wave.answer = true;
    }
    var scene = this;
    if (ok) {
      playSound(this.app.audios.pick);
      this.showText(['CORRECT!']);
      this.next = (function () {
	scene.initLevel(scene.level+1);
      });
    } else {
      playSound(this.app.audios.explosion);
      this.showText(['WRONG!', 'GAME OVER']);
      this.next = (function () {
	scene.initLevel(0);
      });
    }
  },
  
});
