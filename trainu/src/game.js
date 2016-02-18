// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: tilemap.js
//   requires: app.js
'use strict';


// Block
function Block(bounds)
{
  this._Actor(bounds, bounds.inflate(-8, 0), 2);
  this.movement = new Vec2(-4, 0);
}

define(Block, Actor, 'Actor', {
  update: function () {
    this.move(this.movement);
    if (this.bounds.right() <= 0) {
      this.die();
    }
  },
});

// Train
function Train(bounds, scene, color)
{
  this._PhysicalActor(bounds, bounds.inflate(-8, 0), 0);
  this.jumpfunc = (function (vy, t) {
    if (0 <= t && t < 8) return -2;
    if (t < 20) return vy;
    return vy+1;
  });
  this.zorder = 1;
  this.scene = scene;
  this.prev = null;
  this.next = null;
  this.speed = rnd(4, 8);
}

define(Train, PhysicalActor, 'PhysicalActor', {
  getContactFor: function (v, hitbox, range) {
    return hitbox.contact(v, this.scene.ground);
  },

  collide: function (obj) {
    if (obj instanceof Block) {
      playSound(this.scene.app.audios.hurt);
    }
  },

  update: function () {
    if (this.prev !== null && this.next !== null) {
      var v = this.velocity.copy();
      v.y = (this.prev.velocity.y + this.next.velocity.y)/2;
      this.velocity = this.getMove(v, this.hitbox, false);
      this.move(this.velocity);
    } else {
      this._PhysicalActor_update();
    }
    this.tileno = ((1 < Math.abs(this.velocity.y))? 1 :
		   (blink(this.getTime(), this.speed)? 1 : 0));
  },

  setJump: function (jumpend) {
    this._PhysicalActor_setJump(jumpend);
    if (0 < jumpend && this._jumpt == 0) {
      playSound(this.scene.app.audios.jump);
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

    this.background2 = new TileSprite(this.screen, this.app.images.background2);
    this.addObject(this.background2);
    this.background1 = new TileSprite(this.screen, this.app.images.background1);
    this.addObject(this.background1);
    
    this.ground = new Rectangle(0, this.screen.height-10, this.screen.width, 10);
    var N = 4;
    var x0 = (N-1)*30;
    var y0 = this.ground.y;
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
      var obj = new Train(new Rectangle(x0-i*30, y0-32, 32, 32), this, color);
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
    
    this.nextadd = 60;
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    this._GameScene_render(ctx, bx, by);
  },

  tick: function () {
    this._GameScene_tick();
    this.background1.offset.x += 2;
    this.background2.offset.x += 0.5;
    if (this.nextadd < this.layer.ticks) {
      var rect = new Rectangle(this.screen.width, this.ground.y-20, 32, 20);
      this.addObject(new Block(rect));
      this.nextadd = this.layer.ticks + rnd(60, 120);
    }
  },

  keydown: function (key) {
    this._GameScene_keydown(key);
    switch (getKeySym(key)) {
    case 'left':
      this.last.setJump(Infinity);
      break;
    case 'right':
      this.first.setJump(Infinity);
      break;
    }
  },
  
  keyup: function (key) {
    this._GameScene_keyup(key);
    switch (getKeySym(key)) {
    case 'left':
      this.last.setJump(0);
      break;
    case 'right':
      this.first.setJump(0);
      break;
    }
  },

});
