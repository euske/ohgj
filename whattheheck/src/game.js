// game.js
//   requires: utils.js
//   requires: geom.js
//   requires: actor.js
//   requires: scene.js
//   requires: text.js
//   requires: tilemap.js
//   requires: app.js
'use strict';


// Bus
function Bus(scene, road)
{
  var bounds = new Rectangle(road.x-20, road.y+10, 32, 16);
  var hitbox = new Rectangle(bounds.x, bounds.y+8, bounds.width, 8);
  this._Actor(bounds, hitbox, 0);
  this.constraints = new Rectangle(road.x-20, road.y, road.width, 40);
  this.speed = 4;
  this.scene = scene;
  this.movement.x = +1;
}

define(Bus, Actor, 'Actor', {
  setMove: function (v) {
    this.movement.y = v.y*this.speed;
  },

  update: function () {
    if (this.hitbox.x < 10) {
      this.movement.x = +1;
    } else if (100 <= this.hitbox.x) {
      this.movement.x = -1;
    }
    this.phase = blink(this.layer.ticks, 8);
    this._Actor_update();
  },

  getConstraintsFor: function (hitbox, force) {
    return this.constraints;
  },
  
  getSpriteSrc: function (tileno, phase) {
    var size = Sprite.SIZE;
    return new Rectangle(size.x*tileno, size.y*phase, size.x*2, size.y);
  },

});


// Car
function Car(scene, y, speed)
{
  var bounds = new Rectangle(
    ((0 < speed)? -16 : scene.screen.width)+speed,
    y-16, 16, 16);
  var hitbox = new Rectangle(
    bounds.x, bounds.y+8, bounds.width, 8);
  this._Actor(bounds, hitbox, 2);
  this.scene = scene;
  this.movement.x = speed;
  this.scale.x = (speed < 0)? -1 : +1;
}

define(Car, Actor, 'Actor', {
  update: function () {
    this._Actor_update();
    if (!this.hitbox.overlap(this.scene.screen)) {
      this.die();
    }
  },

  collide: function (actor) {
    if (actor instanceof Bus) {
      playSound(this.scene.app.audios.explosion);
      this.die();
    }
  },
});


//  Game
// 
function Game(app)
{
  this._GameScene(app);
  this.cars = new Layer();
  Sprite.SIZE = new Vec2(16, 16);
  Sprite.IMAGE = app.images.sprites;
}

define(Game, GameScene, 'GameScene', {
  init: function () {
    this._GameScene_init();
    this.cars.init();
    
    var app = this.app;
    this.background2 = new TileSprite(this.screen, this.app.images.background2);
    this.addObject(this.background2);
    this.background1 = new TileSprite(this.screen, this.app.images.background1);
    this.addObject(this.background1);
    var img = this.app.images.road;
    this.road = new TileSprite(new Rectangle(0, this.screen.height-img.height,
					     this.screen.width, img.height), img);
    this.addObject(this.road);
    
    this.bus = new Bus(this, this.road.bounds);
    this.cars.addObject(this.bus);
    
    // show a banner.
    var scene = this;
    var tb = new TextBox(this.screen, app.shadowfont);
    tb.putText(["DON'T CRSAH!!1"], 'center', 'center');
    tb.duration = app.framerate*3;
    tb.update = function () {
      tb.visible = blink(tb.layer.ticks, app.framerate/2);
    };
    this.addObject(tb);

    app.set_music(app.audios.music);
    this.nextadd = 30;
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(bx, by, this.screen.width, this.screen.height);
    ctx.fillStyle = 'rgb(128,128,128)';
    this._GameScene_render(ctx, bx, by);
    this.cars.sprites.sort(function (a,b) { return a.bounds.y-b.bounds.y; });
    this.cars.render(ctx, bx, by);
  },

  tick: function () {
    this._GameScene_tick();
    this.cars.tick();
    this.background1.offset.x += 2;
    this.background2.offset.x += 0.5;
    this.road.offset.x += this.bus.speed;
    if (this.nextadd < this.layer.ticks) {
      var y = rnd(50);
      var speed = (y < 40)? -8 : 1;
      if (40 <= y) { y += 10; }
      this.cars.addObject(new Car(this, this.road.bounds.y+y, speed));
      this.nextadd = this.layer.ticks + rnd(10, 30);
    }
  },

  keydown: function (key) {
    this._GameScene_keydown(key);
  },

  set_dir: function (vx, vy) {
    this._GameScene_set_dir(vx, vy);
    this.bus.setMove(new Vec2(vx, vy));
  },

  set_action: function (action) {
    this._GameScene_set_action(action);
  },

});
