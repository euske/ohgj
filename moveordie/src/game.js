// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: app.js
'use strict';

function getRect (pos) {
  return new Rect(pos.x*8, pos.y*8, 8, 8);
}

function Map (bounds) {
  this.bounds = bounds;
  this.map = [];
  for (var y = 0; y < bounds.height; y++) {
    var row = [];
    for (var x = 0; x < bounds.width; x++) {
      row.push(0);
    }
    this.map.push(row);
  }
}
define(Map, Object, '', {
  get: function (p) {
    return this.map[p.y][p.x];
  },
  set: function (p, v) {
    this.map[p.y][p.x] = v;
  },
  render: function (ctx, bx, by) {
    for (var y = 0; y < this.map.length; y++) {
      var row = this.map[y];
      for (var x = 0; x < row.length; x++) {
	var c = row[x];
	if (c == 0) continue;
	switch (c) {
	case -1:
	  ctx.fillStyle = 'red';
	  break;
	case 1:
	  ctx.fillStyle = 'magenta';
	  break;
	case 2:
	  ctx.fillStyle = 'rgb(0,255,0)';
	  break;
	case 3:
	  ctx.fillStyle = 'cyan';
	  break;
	case 4:
	  ctx.fillStyle = 'yellow';
	  break;
	}
	ctx.fillRect(x*8+1, y*8+1, 6, 6);
      }
    }
  },
});


// Player
function Player(scene, pos)
{
  var bounds = getRect(pos);
  this._Actor(bounds, bounds);
  this.scene = scene;
  this.map = scene.map;
  this.pos = pos;
  this.trace = [];
  this.length = 10;
  this.speed = 4;
  for (var i = 0; i < this.length; i++) {
    this.trace.push(new Vec2(pos.x-i, pos.y));
  }
}

define(Player, Actor, 'Actor', {
  setMove: function (v) {
    this.movement = v.copy();
  },

  update: function () {
    var rate = Math.max(1, int(30/this.speed));
    if (this.getTime() % rate != 0) return;
    if (this.movement.isZero()) {
      this.length--;
      if (this.length == 0) {
	this.die();
      }
    } else {
      var pos = this.pos.add(this.movement);
      if (pos.x < 0) {
	pos.x = this.map.bounds.width-1;
      } else if (this.map.bounds.width <= pos.x) {
	pos.x = 0;
      }
      if (pos.y < 0) {
	pos.y = this.map.bounds.height-1;
      } else if (this.map.bounds.height <= pos.y) {
	pos.y = 0;
      }
      if (this.check(pos)) {
	playSound(this.scene.app.audios.explosion);
	this.die();
      }
      var c = this.map.get(pos);
      this.map.set(pos, 0);
      if (c < 0) {
	playSound(this.scene.app.audios.hurt);
	this.length = int((this.length+1)/2);
	this.scene.addThing();
      } else if (0 < c) {
	playSound(this.scene.app.audios.pick);
	this.scene.addScore(c);
	this.scene.addThing();
      }
      this.length += c;
      this.trace.unshift(pos);
      this.pos = pos;
      this.bounds = getRect(pos);
      this.hitbox = getRect(pos);
    }
  },

  check: function (pos) {
    var length = Math.min(this.length, this.trace.length);
    for (var i = 0; i < length; i++) {
      if (this.trace[i].equals(pos)) return true;
    }
    return false;
  },

  render: function (ctx, bx, by) {
    var length = Math.min(this.length, this.trace.length);
    for (var i = 0; i < length; i++) {
      var rect = getRect(this.trace[i]);
      ctx.fillStyle = (i == 0)? 'white' : 'green';
      ctx.fillRect(bx+rect.x, by+rect.y, rect.width, rect.height);
    }
  },
  
});


//  Game
// 
function Game(app)
{
  this._GameScene(app);
  this.world = new Rect(0, 0, int(this.screen.width/8), int(this.screen.height/8));
}

define(Game, GameScene, 'GameScene', {
  init: function () {
    this._GameScene_init();

    this.app.set_music(this.app.audios.music);

    var app = this.app;
    this.map = new Map(this.world);
    this.player = new Player(this, new Vec2(int(this.world.centerx()),
					    int(this.world.centery())));
    var scene = this;
    this.player.died.subscribe(function () { scene.gameover(); });
    this.addObject(this.player);
      
    for (var i = 0; i < 50; i++) {
      this.addThing();
    }

    this.textbox = new TextBox(this.screen, app.font);
    this.textbox.linespace = 8;
    this.textbox.timer = 0;
    var textbox = this.textbox;
    this.textbox.update = (function () {
      if (0 < textbox.timer) {
	textbox.timer--;
	if (textbox.timer == 0) {
	  textbox.visible = false;
	}
      }
    });
    this.addObject(this.textbox);

    this.score = 0;
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    this.map.render(ctx, bx, by);
    this._GameScene_render(ctx, bx, by);
  },

  keydown: function (key) {
    this._GameScene_keydown(key);
  },

  tick: function () {
    this._GameScene_tick();
    var v = this.app.key_dir.copy();
    if (v.x !== 0 && v.y !== 0) {
      v.x = 0;
    }
    this.player.setMove(v);
  },
    
  addScore: function (c) {
    this.score += c;
    this.textbox.clear();
    this.textbox.putText([''+this.score], 'center', 'center');
    this.textbox.timer = 30;
    this.textbox.visible = true;
    this.player.speed = Math.max(4, int(this.score/5));
  },

  addThing: function () {
    var c = rnd(5);
    while (true) {
      var p = this.map.bounds.rndpt();
      if (this.map.get(p) == 0 && !this.player.check(p)) {
	this.map.set(p, (c == 0)? -1 : c);
	break;
      }
    }
  },

  gameover: function () {
    var scene = this;
    var task = new Task();
    task.duration = 50;
    task.died.subscribe(function () { scene.init(); });
    this.addObject(task);
    this.textbox.clear();
    this.textbox.putText(['GAME OVER', 'SCORE:'+this.score], 'center', 'center');
    this.textbox.visible = true;
    this.app.lockKeys();
  },
  
});
