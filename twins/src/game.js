// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: tilemap.js
//   requires: app.js
'use strict';

// MovingActor
function MovingActor(bounds, hitbox, tileno)
{
  this._Actor(bounds, hitbox, tileno)
  this.jumpfunc = (function (vy, t) {
    if (t < 8) return vy-4;
    if (t < 30) return -1;
    return vy;
  });
  this.fallfunc = (function (vy) { return clamp(-8, vy+1, +8); });
  this.velocity = new Vec2(0, 0);
  this.landed = false;
  this._jumpt = -1;
}

define(MovingActor, Actor, 'Actor', {
  update: function () {
    var v = this.velocity.copy();
    if (0 <= this._jumpt) {
      v.y = this.jumpfunc(v.y, this._jumpt);
      this._jumpt++;
    }
    v.y = this.fallfunc(v.y);
    this.velocity = this.getMove(v);
    this.landed = (0 < v.y && this.velocity.y < v.y);
    this.movev(this.velocity);
  },

  getMoveFor: function (v, rect) {
    var hitbox = this.hitbox;
    var d0 = hitbox.contact(v, rect);
    hitbox = hitbox.move(d0.x, d0.y);
    v = v.sub(d0);
    var d1 = hitbox.contact(new Vec2(v.x, 0), rect);
    hitbox = hitbox.move(d1.x, d1.y);
    v = v.sub(d1);
    var d2 = hitbox.contact(new Vec2(0, v.y), rect);
    return new Vec2(d0.x+d1.x+d2.x,
		    d0.y+d1.y+d2.y);
  },

  getMove: function (v) {
    return v;
  },
  
  isLanded: function () {
    return this.landed;
  },

  setJumping: function (jumping) {
    if (jumping && this.landed) {
      this._jumpt = 0;
    } else {
      this._jumpt = -1;
    }
  },
});


// Block
function Block(bounds)
{
  this._Actor(bounds, bounds, 'gray');
  this.vx = -4;
}

define(Block, Actor, 'Actor', {
  update: function () {
    this._Actor_update();
    this.move(this.vx, 0);
    if (this.bounds.right() <= 0) {
      this.die();
    }
  },
});

// Train
function Train(bounds, color)
{
  this._MovingActor(bounds, bounds, color);
  this.prev = null;
  this.next = null;
}

define(Train, MovingActor, 'MovingActor', {
  getMove: function (v) {
    return this.getMoveFor(v, this.scene.ground);
  },

  collide: function (obj) {
    if (obj instanceof Block) {
      playSound(this.scene.app.audios.explosion);
    }
  },

  update: function () {
    if (this.prev !== null && this.next !== null) {
      var v = this.velocity.copy();
      v.y = (this.prev.velocity.y + this.next.velocity.y)/2;
      //v.y = this.fallfunc(v.y);
      this.velocity = this.getMove(v);
      this.landed = (0 < v.y && this.velocity.y < v.y);
      this.movev(this.velocity);
    } else {
      this._MovingActor_update();
    }
  },

  jump: function (jumping) {
    if (jumping) {
      if (this.isLanded()) {
	this.setJumping(true);
	playSound(this.scene.app.audios.jump);
      }
    } else {
      this.setJumping(false);
    }
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

    var N = 5;
    var x0 = (N-1)*36+10;
    var y0 = this.screen.height-100;
    var prev = null;
    this.first = null;
    this.last = null;
    for (var i = 0; i < N; i++) {
      var color = 'white';
      if (i == 0) {
	color = 'red';
      } else if (i == N-1) {
	color = 'blue';
      }
      var obj = new Train(new Rectangle(x0-i*36, y0, 32, 16), color);
      if (prev !== null) {
	prev.next = obj;
      }
      obj.prev = prev;
      prev = obj;
      this.addObject(obj);
      if (this.first === null) {
	this.first = obj;
      }
      this.last = obj;
    }
    this.ground = new Rectangle(0, this.screen.height-32, this.screen.width, 32);
    
    // show a banner.
    var scene = this;
    var tb = new TextBox(this.screen, app.font);
    tb.putText(['GAME!!1'], 'center', 'center');
    tb.duration = app.framerate*2;
    tb.update = function () {
      TextBox.prototype.update.call(tb);
      tb.visible = blink(scene.ticks, app.framerate/2);
    };
    this.addObject(tb);

    this.nextadd = 60;
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    ctx.fillStyle = 'rgb(128,128,128)';
    ctx.fillRect(bx+this.ground.x, by+this.ground.y,
		 this.ground.width, this.ground.height);
    this._GameScene_render(ctx, bx, by);
  },

  update: function () {
    this._GameScene_update();
    if (this.nextadd < this.ticks) {
      var rect = new Rectangle(this.screen.width, this.ground.y-20, 32, 20);
      this.addObject(new Block(rect));
      this.nextadd = this.ticks + rnd(60, 120);
    }
  },
  
  keydown: function (key) {
    this._GameScene_keydown(key);
    switch (getKeySym(key)) {
    case 'left':
      this.last.jump(true);
      break;
    case 'right':
      this.first.jump(true);
      break;
    }
  },
  
  keyup: function (key) {
    this._GameScene_keyup(key);
    switch (getKeySym(key)) {
    case 'left':
      this.last.jump(false);
      break;
    case 'right':
      this.first.jump(false);
      break;
    }
  },

});
