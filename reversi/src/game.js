// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: tilemap.js
//   requires: app.js
'use strict';

var DIRS = [new Vec2(1,0), new Vec2(-1,0), new Vec2(0,1), new Vec2(0,-1)];

function genArray(w, h, v) {
  var a = [];
  for (var y = 0; y < h; y++) {
    var row = [];
    for (var x = 0; x < w; x++) {
      row.push(v);
    }
    a.push(row);
  }
  return a;
}

function genMaze(w, h) {
  var maze = genArray(w, h, 1);
  var q = [];
  q.push({p:new Vec2(1, 1), d:new Vec2()});
  while (0 < q.length) {
    var i = rnd(q.length);
    var obj = q[i];
    q.splice(i, 1);
    var p = obj.p;
    if (0 <= p.x && p.x < w && 0 <= p.y && p.y < h &&
	maze[p.y][p.x]) {
      maze[p.y][p.x] = 0;
      var d = obj.d;
      maze[p.y-d.y][p.x-d.x] = 0;
      for (var i in DIRS) {
	d = DIRS[i];
	q.push({p:new Vec2(p.x+d.x*2, p.y+d.y*2), d:d});
      }
    }
  }
  return maze;
}

// Ghost
function Ghost(scene, night, p)
{
  var bounds = scene.tilemap.map2coord(new Rectangle(p.x, p.y, 1, 1));
  this._Actor(bounds, bounds, null);
  this.scene = scene;
  this.night = night;
  this.speed = 1;
  this.movement = this.pickDir();
}

define(Ghost, Actor, 'Actor', {
  render: function (ctx, bx, by) {
    var bounds;
    if (this.scene.day != this.night) {
      bounds = this.bounds;
      ctx.fillStyle = 'rgb(255,0,128)';
    } else {
      bounds = this.bounds.inflate(-2, -2);
      ctx.fillStyle = 'rgb(255,255,0)';
    }      
    ctx.fillRect(bx+bounds.x, by+bounds.y, bounds.width, bounds.height);
  },

  update: function () {
    if (this.scene.day != this.night) {
      var d = this.scene.player.getPos().sub(this.getPos()).sign();
      if (this.isMovable(d)) {
	if (d.x != 0 && d.y != 0) {
	  if (rnd(2) == 0) { d.x = 0; } else { d.y = 0; }
	}
	this.movement = d.scale(this.speed);
      } else {
	while (!this.isMovable(this.movement)) {
	  this.movement = this.pickDir();
	}
      }
      this._Actor_update();
    }
  },
  
  getPos: function () {
    return this.bounds.center();
  },
  
  pickDir: function () {
    return DIRS[rnd(DIRS.length)].scale(this.speed);
  },

  getContactFor: function (v, hitbox, range) {
    var night = this.night;
    var f = (function (c) { return c != night; });
    return this.scene.tilemap.contactTile(this.hitbox, f, v);
  },

});

// Player
function Player(scene, day, p)
{
  var bounds = scene.tilemap.map2coord(new Rectangle(p.x, p.y, 1, 1));
  this._Actor(bounds.inflate(-1,-1), bounds, null);
  this.scene = scene;
  this.day = day;
  this.speed = 4;
  this.invul = 0;
  this.lastmove = new Vec2();
}

define(Player, Actor, 'Actor', {
  render: function (ctx, bx, by) {
    if (this.scene.day == this.day) {
      if (0 < this.invul && !blink(this.layer.ticks, 4)) return;
      ctx.fillStyle = 'rgb(0,255,0)';
    } else {
      ctx.fillStyle = 'rgb(128,128,128)';
    }
    var bounds = this.bounds;
    ctx.fillRect(bx+bounds.x, by+bounds.y, bounds.width, bounds.height);
  },

  update: function () {
    var day = this.day;
    if (this.scene.day == day) {
      if (0 < this.invul) {
	this.invul--;
      } else {
	var f = (function (obj) { return (obj instanceof Ghost) && (obj.night != day); });
	var a = this.layer.findObjects(this.hitbox.inflate(4, 4), f);
	if (0 < a.length) {
	  this.invul = 20;
	  playSound(this.scene.app.audios.hurt);
	}
      }
      this._Actor_update();
    }
  },

  move: function (v) {
    if (0 < v.norm2()) {
      if (this.isMovable(v)) {
	this.lastmove = v;
      } else {
	v = this.lastmove;
      }
    }
    this._Actor_move(v);
  },
  
  collide: function (actor) {
    if (actor instanceof Ghost) {
      if (actor.night == this.day) {
	actor.die();
	playSound(this.scene.app.audios.pick);
      }
    }
  },

  setMove: function (v) {
    this.movement = v.scale(this.speed);
  },

  getPos: function () {
    return this.bounds.center();
  },
  
  getContactFor: function (v, hitbox, range) {
    var day = this.day;
    var f = (function (c) { return c != day; });
    return this.scene.tilemap.contactTile(hitbox, f, v);
  },

});


//  Game
// 
function Game(app)
{
  this._GameScene(app);
  this.tilesize = 8;
}

define(Game, GameScene, 'GameScene', {
  init: function () {
    this._GameScene_init();

    var app = this.app;
    var mw = int(this.screen.width/this.tilesize);
    mw = int((mw+1)/2)*2-1;
    var mh = int(this.screen.height/this.tilesize);
    mh = int((mh+1)/2)*2-1;
    var map = genMaze(mw, mh);
    this.tilemap = new TileMap(this.tilesize, map);
    this.players = [
      new Player(this, 0, new Vec2(1, 1)),
      new Player(this, 1, new Vec2(mw-1,mh-1))
    ];
    for (var i = 0; i < this.players.length; i++) {
      this.addObject(this.players[i]);
    }
    for (var i = 0; i < 10; i++) {
      this.addGhost(0);
      this.addGhost(1);
    }

    this.day = 0;
    this.player = this.players[this.day];
  },

  addGhost: function (night) {
    while (true) {
      var x = rnd(this.tilemap.width);
      var y = rnd(this.tilemap.height);
      if (this.tilemap.get(x,y) == night) {
	var ghost = new Ghost(this, night, new Vec2(x,y));
	this.addObject(ghost);
	break;
      }
    }
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    var ts = this.tilesize;
    var day = this.day;
    ctx.fillStyle = (day == 0)? 'rgb(0,128,255)' : 'rgb(0,0,128)';
    ctx.fillRect(bx, by, ts*this.tilemap.width, ts*this.tilemap.height);
    ctx.fillStyle = (day != 0)? 'rgb(0,128,255)' : 'rgb(0,0,128)';
    var f = (function (x, y, c) {
      if (c != 0) {
	ctx.fillRect(bx+x*ts, by+y*ts, ts, ts);
      }
    });
    this.tilemap.apply(f);
    this._GameScene_render(ctx, bx, by);
  },

  keydown: function (key) {
    this._GameScene_keydown(key);
  },

  set_dir: function (vx, vy) {
    this._GameScene_set_dir(vx, vy);
    this.player.setMove(new Vec2(vx, vy));
  },

  set_action: function (action) {
    this._GameScene_set_action(action);
    if (action) {
      this.swapDay();
    }
  },

  swapDay: function () {
    this.day = 1-this.day;
    this.player = this.players[this.day];
    playSound(this.app.audios.swap);
  },

});
