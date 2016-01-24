// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: tilemap.js
//   requires: app.js
'use strict';


// Ball
function Ball(scene, bounds)
{
  this._Actor(bounds, bounds, 'white');
  this.scene = scene;
  this.speed = 16;
  this.movement = new Vec2(1+rnd(this.speed), 1+rnd(this.speed));
}

define(Ball, Actor, 'Actor', {
  update: function () {
    var v = this.getContactFor(this.movement, this.hitbox);
    this._Actor_update();
    if (!v.equals(this.movement)) {
      var vx = (1+rnd(this.speed))*sign(this.movement.x);
      var vy = (1+rnd(this.speed))*sign(this.movement.y);
      if (v.x != this.movement.x) {
	vx = -vx;
      }
      if (v.y != this.movement.y) {
	vy = -vy;
      }
      this.movement = new Vec2(vx, vy);
      playSound(this.scene.app.audios.beep);
    }
  },
  
  getContactFor: function (v, hitbox, range) {
    var rect = hitbox.add(v).clamp(this.scene.screen);
    v = rect.diff(hitbox);
    hitbox = hitbox.add(v);
    var paddle = this.scene.paddle.hitbox;
    if (!hitbox.overlap(paddle)) {
      var v2 = hitbox.contact(v, paddle);
      v.y = v2.y;
    }
    return v;
  },

});

// Paddle
function Paddle(scene, bounds)
{
  this._Actor(bounds, bounds, 'white');
  this.scene = scene;
  this.speed = 8;
}

define(Paddle, Actor, 'Actor', {
  setMove: function (vx, vy) {
    this.movement.x = vx*this.speed;
  },
  
  getContactFor: function (v, hitbox, range) {
    var rect = hitbox.add(v).clamp(this.scene.screen);
    return rect.diff(hitbox);
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
    this.ball = new Ball(this, new Rectangle(0,0,16,16));
    this.addObject(this.ball);
    this.paddle = new Paddle(this, new Rectangle(0,this.screen.height-8,48,8));
    this.addObject(this.paddle);
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    this._GameScene_render(ctx, bx, by);
  },

  set_dir: function (vx, vy) {
    this._GameScene_set_dir(vx, vy);
    this.paddle.setMove(vx, vy);
  },

});
