// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: app.js
'use strict';


//  Stars
//
function Stars(frame, nstars, color, speed, maxdepth)
{
  this._Layer();
  this.frame = frame;
  this.color = (color !== undefined)? color : 'white';
  this.speed = (speed !== undefined)? speed : -10;
  this.maxdepth = (maxdepth !== undefined)? maxdepth : 3;
  this.objs = [];
  for (var i = 0; i < nstars; i++) {
    this.objs.push(this.initStar({}));
  }
}
define(Stars, Layer, 'Layer', {
  initStar: function (obj) {
    obj.s = Math.random()*2+1;
    obj.z = Math.random()*this.maxdepth+1;
    obj.x = rnd(this.frame.width);
    obj.y = rnd(this.frame.height);
    return obj;
  },

  tick: function () {
    this._Layer_tick();
    for (var i = 0; i < this.objs.length; i++) {
      var obj = this.objs[i];
      obj.x += this.speed/obj.z;
      if (obj.x+(obj.s/obj.z) < 0) {
	this.initStar(obj);
	obj.x = this.frame.width;
      } else if (this.frame.width < obj.x) {
	this.initStar(obj);
	obj.x = 0;
      }
    }
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = this.color;
    bx += this.frame.x;
    by += this.frame.y;
    for (var i = 0; i < this.objs.length; i++) {
      var obj = this.objs[i];
      var s = obj.s/obj.z;
      ctx.fillRect(bx+obj.x, by+obj.y, s, s);
    }
  },
});


// Pan
function Pan(scene, p)
{
  var bounds = p.expand(16,16,0,0);
  this._Actor(bounds, bounds, 4);
  this.movement = new Vec2(-rnd(2,8), rnd(3)-1);
  this.scene = scene;
  this.cycle = rnd(30,60);
}

define(Pan, Actor, 'Actor', {
  update: function () {
    this._Actor_update();
    this.tileno = blink(this.layer.ticks, this.cycle)? 4 : 5;
    if (!this.scene.screen.overlap(this.hitbox)) {
      this.die();
    }
  }
});


// Egg
function Egg(scene, p, v)
{
  var bounds = p.expand(16,16,0,0);
  var hitbox = bounds.inflate(-4,-4);
  this._Actor(bounds, hitbox, 2);
  this.movement = new Vec2(v.x+4, v.y);
  this.velocity = new Vec2(0, -8);
  this.gravity = 1;
  this.cooked = false;
  this.scene = scene;
}

define(Egg, Actor, 'Actor', {
  fall: function () {
    this.velocity.y += this.gravity;
    this.move(this.velocity);
  },
  collide: function (actor) {
    if (!this.cooked && actor instanceof Pan) {
      this.cooked = true;
      this.tileno = 3;
      this.movement = new Vec2(-rnd(1,4), rnd(3)-1);
      this.duration = this.layer.ticks+60;
      playSound(this.scene.app.audios.cook);
    }
  },
  update: function () {
    this._Actor_update();
    if (!this.cooked) {
      this.fall();
    }
    if (!this.scene.screen.overlap(this.hitbox)) {
      this.die();
    }
  }
});


// Player
function Player(scene, p)
{
  var bounds = p.expand(16,16,0,0);
  this._Actor(bounds, bounds, 0);
  this.speed = 4;
  this.scene = scene;
  this.bombed = false;
}

define(Player, Actor, 'Actor', {
  setMove: function (v) {
    if (!this.bombed) {
      this.movement = v.scale(this.speed);
    }
  },

  getConstraintsFor: function (hitbox, force) {
    return this.scene.screen;
  },
  
  update: function () {
    this._Actor_update();
    if (this.bombed) {
      this.tileno = 6;
    } else {
      this.tileno = blink(this.layer.ticks, 10)? 0 : 1;
    }
  },

  collide: function (actor) {
    if (!this.bombed) {
      if (actor instanceof Pan) {
	this.bombed = true;
	this.duration = this.layer.ticks+10;
	playSound(this.scene.app.audios.explosion);
      } else if (actor instanceof Egg) {
	if (actor.cooked) {
	  actor.die();
	  this.scene.nom();
	}
      }
    }
  },
  
  fire: function () {
    if (this.isAlive()) {
      var egg = new Egg(this.scene, this.bounds.anchor(-1,0), this.movement);
      this.scene.addObject(egg);
      playSound(this.scene.app.audios.egg);
    }
  },

});


//  Game
// 
function Game(app)
{
  this._GameScene(app);
  Sprite.SIZE = new Vec2(16, 16);
  Sprite.IMAGE = app.images.sprites;
  this.highscore = 0;
}

define(Game, GameScene, 'GameScene', {
  init: function () {
    this._GameScene_init();

    var app = this.app;
    var scene = this;
    this.stars = new Stars(this.screen, 100);
    this.player = new Player(this, this.screen.anchor(1,0));
    this.player.died.subscribe(function () { scene.init(); });
    this.addObject(this.player);
    this.nextadd = 30;

    this.text_score = new TextBox(this.screen.inflate(-4,-4), app.font);
    this.addObject(this.text_score);
    this.score = 0;
    this.update_score();
  },

  tick: function () {
    this._GameScene_tick();
    this.player.setMove(this.app.key_dir);
    this.stars.tick();
    if (this.nextadd < this.layer.ticks) {
      var y = rnd(this.screen.height-16);
      this.addObject(new Pan(this, new Vec2(this.screen.width,y)));
      this.nextadd = this.layer.ticks + rnd(10, 30);
    }
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,0,64)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    this.stars.render(ctx, bx, by);
    this._GameScene_render(ctx, bx, by);
  },

  nom: function () {
    this.score++;
    this.highscore = Math.max(this.highscore, this.score);
    this.update_score();
    playSound(this.app.audios.nom);
  },

  update_score: function () {
    this.text_score.clear();
    this.text_score.putText(['SCORE:'+format(this.score)]);
    this.text_score.putText(['HISCORE:'+format(this.highscore)], 'right');
  },

  set_action: function (action) {
    this._GameScene_set_action(action);
    if (action) {
      this.player.fire();
    }
  },

});
