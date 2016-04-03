// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: app.js
'use strict';


// Thingy
function Thingy(scene, bounds, movement)
{
  this._Actor(bounds, bounds, '#ff0000');
  this.scene = scene;
  this.stuck = false;
  this.movement = movement;
}

define(Thingy, Actor, 'Actor', {
  update: function () {
    this._Actor_update();
    if (!this.scene.screen.overlap(this.hitbox)) {
      this.die();
    }
    if (!this.stuck && this.scene.ground.overlap(this.hitbox)) {
      this.stick();
    }
  },

  stick: function () {
    this.stuck = true;
    this.movement = new Vec2();
    this.tileno = '#800000';
  },

});

// Player
function Player(scene, bounds)
{
  this._PhysicalActor(bounds, bounds, '#00ff00');
  this.jumpfunc = (function (vy, t) { return (0 <= t && t <= 4)? -8 : vy+2; });
  this.speed = 4;
  this.scene = scene;
}

define(Player, PhysicalActor, 'PhysicalActor', {
  setMove: function (v) {
    this.movement.x = v.x*this.speed;
  },

  fall: function () {
    if (!this.isHolding()) {
      var vy = this.jumpfunc(this.velocity.y, this._jumpt);
      this.velocity.y = vy;
      this.velocity = this.getMove(this.velocity, this.hitbox, false);
      if (0 < vy && this.velocity.y == 0) {
	this.scene.land();
      }
      this.move(this.velocity);
    }
  },

  collide: function (actor) {
    if (actor instanceof Thingy && !actor.stuck) {
      this.scene.bombed();
      this.die();
    }
  },
  
  getConstraintsFor: function (hitbox, force) {
    return this.scene.screen;
  },
  
  getContactFor: function (v, hitbox, force, range) {
    function isThingy(actor) {
      return actor instanceof Thingy;
    }
    var a = this.layer.findObjects(range, isThingy);
    for (var i = 0; i < a.length; i++) {
      var obj = a[i];
      if (obj.stuck && !obj.hitbox.overlap(hitbox)) {
	v = hitbox.contact(v, obj.hitbox);
      }
    }
    return hitbox.contact(v, this.scene.ground);
  },

});


//  Stars
//
function Stars(frame, nstars, color, velocity, maxdepth)
{
  this._Layer();
  this.frame = frame;
  this.color = (color !== undefined)? color : 'white';
  this.velocity = (velocity !== undefined)? velocity : new Vec2(-1, 0);
  this.maxdepth = (maxdepth !== undefined)? maxdepth : 3;
  this.objs = [];
  for (var i = 0; i < nstars; i++) {
    var obj = this.initStar({});
    obj.p = this.frame.rndpt();
    this.objs.push(obj);
  }
}
define(Stars, Layer, 'Layer', {
  initStar: function (obj) {
    obj.z = Math.random()*this.maxdepth+1;
    obj.s = (Math.random()*2+1) / obj.z;
    //obj.p = this.frame.rndpt();
    return obj;
  },

  tick: function () {
    this._Layer_tick();
    for (var i = 0; i < this.objs.length; i++) {
      var obj = this.objs[i];
      obj.p.x += this.velocity.x/obj.z;
      obj.p.y += this.velocity.y/obj.z;
      var rect = obj.p.expand(obj.s, obj.s);
      if (!this.frame.overlap(rect)) {
	this.initStar(obj);
	obj.p = this.frame.modpt(obj.p);
      }
    }
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = this.color;
    bx += this.frame.x;
    by += this.frame.y;
    for (var i = 0; i < this.objs.length; i++) {
      var obj = this.objs[i];
      var rect = obj.p.expand(obj.s, obj.s);
      ctx.fillRect(bx+rect.x, by+rect.y, rect.width, rect.height);
    }
  },
});


//  Game
// 
function Game(app)
{
  this._GameScene(app);
  this.highscore = 0;
}

define(Game, GameScene, 'GameScene', {
  init: function () {
    this._GameScene_init();

    var app = this.app;
    this.ground = new Rectangle(0, this.screen.height-16, this.screen.width, 16);
    this.player = new Player(this, new Rectangle(this.screen.width/2,0,8,8));
    this.addObject(this.player);
    this.y0 = this.ground.y-this.player.hitbox.height;

    this.nextadd = 30;

    this.stars = new Stars(this.screen, 100, 'white', new Vec2(1,-10));
    
    // show a banner.
    var scene = this;
    var tb = new TextBox(this.screen, app.font);
    tb.putText(['GO HIGHER!!1'], 'center', 'center');
    tb.duration = app.framerate*2;
    tb.update = function () {
      tb.visible = blink(tb.layer.ticks, app.framerate/2);
    };
    this.addObject(tb);

    this.text_score = new TextBox(this.screen.inflate(-4,-4), app.font);
    this.addObject(this.text_score);
    this.update_score();

    playSound(app.audios.start);
  },

  tick: function () {
    this._GameScene_tick();
    this.stars.tick();

    var layer = this.layer;
    var objs = [];
    for (var i = 0; i < layer.colliders.length; i++) {
      var obj = layer.colliders[i];
      if (obj.layer === layer && obj instanceof Thingy) {
	objs.push(obj);
      }
    }
    for (var i = 0; i < objs.length; i++) {
      var obj0 = objs[i];
      var hitbox0 = obj0.hitbox.union(obj0.hitbox.add(obj0.movement));
      for (var j = i+1; j < objs.length; j++) {
	var obj1 = objs[j];
	var hitbox1 = obj1.hitbox.union(obj1.hitbox.add(obj1.movement));
	if (hitbox0.overlap(hitbox1)) {
	  obj0.stick();
	  obj1.stick();
	}
      }
    }
    
    if (this.nextadd < this.layer.ticks) {
      var x = this.player.hitbox.x+rnd(40)-20;
      if (0 <= x && x < this.screen.width-8) {
	var rect = new Rectangle(x, 0, 8, 8);
	var v = new Vec2(rnd(3)-1, 2);
	this.addObject(new Thingy(this, rect, v));
      }
      this.nextadd = this.layer.ticks + rnd(5, 10);
    }
  },

  land: function () {
    var score = this.y0 - this.player.bounds.y;
    if (this.highscore < score) {
      playSound(this.app.audios.beep);
      this.highscore = score;
      this.update_score();
    }
  },

  update_score: function () {
    this.text_score.clear();
    this.text_score.putText(['HISCORE:'+format(this.highscore)], 'right');
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    this.stars.render(ctx, bx, by);
    ctx.fillStyle = 'rgb(128,128,128)';
    ctx.fillRect(bx+this.ground.x, by+this.ground.y,
		 this.ground.width, this.ground.height);
    this._GameScene_render(ctx, bx, by);
  },

  set_dir: function (vx, vy) {
    this._GameScene_set_dir(vx, vy);
    this.player.setMove(new Vec2(vx, vy));
  },

  set_action: function (action) {
    this._GameScene_set_action(action);
    if (action) {
      playSound(this.app.audios.jump);
    }
    this.player.setJump(action? Infinity : 0);
  },

  bombed: function () {
    var scene = this;
    var app = this.app;
    playSound(app.audios.hurt);
    var tb = new TextBox(this.screen, app.font);
    tb.putText(['DEAD.'], 'center', 'center');
    tb.duration = app.framerate;
    tb.died.subscribe(function (_) {
      scene.init();
    });
    scene.addObject(tb);
  },

});
