// game.js

// Player
function Player(bounds)
{
  Actor.call(this, bounds, bounds, '#00ff00');
  this.velocity = new Vec2(0, 0);
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.update = function ()
{
  var self = this;
  var r = this.hitbox.move(this.velocity.x*4, this.velocity.y*4);
  var f = (function (obj) { return (obj instanceof Wall); });
  if (this.scene.world.containsRect(r) &&
      this.scene.findObjects(r, f).length == 0) {
    this.move(this.velocity.x*4, this.velocity.y*4);
  }
};

Player.prototype.collide = function (obj)
{
  if (obj instanceof Thing) {
    obj.alive = false;
    playSound(this.scene.app.audios.pick);
  }
};


// InvObj
function InvObj(bounds, hitbox, tileno)
{
  Actor.call(this, bounds, hitbox, tileno);
}

InvObj.prototype = Object.create(Actor.prototype);

InvObj.prototype.render = function (ctx, bx, by)
{
  var lights = this.scene.lights;
  for (var i = 0; i < lights.length; i++) {
    var light = lights[i];
    if (light.bounds.containsRect(this.bounds)) {
      Actor.prototype.render.call(this, ctx, bx, by);
      break;
    }
  }
};

// Thing
function Thing(bounds)
{
  InvObj.call(this, bounds, bounds, 'yellow');
}

Thing.prototype = Object.create(InvObj.prototype);

// Wall
function Wall(bounds)
{
  InvObj.call(this, bounds, bounds, 'white');
}

Wall.prototype = Object.create(InvObj.prototype);

// Light
function Light(bounds)
{
  Sprite.call(this, bounds);
  this.move = new Vec2(0, 0);
  this.mdur = 0;
}

Light.prototype = Object.create(Sprite.prototype);

Light.prototype.update = function ()
{
  if (this.mdur == 0) {
    this.move.x = rnd(3)-1;
    this.move.y = rnd(3)-1;
    this.mdur = rnd(20)+5;
  }
  this.bounds = this.bounds.move(this.move.x*4, this.move.y*4).clamp(this.scene.world);
  this.mdur--;
};


//  Game
// 
function Game(app)
{
  GameScene.call(this, app);
}

Game.prototype = Object.create(GameScene.prototype);
  
Game.prototype.init = function ()
{
  GameScene.prototype.init.call(this);

  var app = this.app;
  this.player = new Player(new Rectangle(0,0,16,16));
  this.addObject(this.player);

  this.lights = [];
  for (var i = 0; i < 2; i++) {
    var bounds = RectFromPoint(this.world.center(), 100, 100);
    var light = new Light(bounds);
    this.addObject(light);
    this.lights.push(light);
  }

  for (var i = 0; i < 20; i++) {
    var p = new Vec2(rnd(10)*32+12, rnd(8)*32+12);
    this.addObject(new Thing(RectFromPoint(p, 8, 8)));
  }
  for (var i = 0; i < 20; i++) {
    var p = new Vec2(rnd(10)*32, rnd(8)*32);
    this.addObject(new Wall(new Rect(p.x, p.y, 32, 32)));
  }
  
  // show a banner.
  var scene = this;
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+app.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, app.framerate/2)) {
      app.renderString(app.images.font_w, 'AVOID LIGHTS AND GET COINS!', 1,
		       x+app.screen.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);
};

Game.prototype.render = function (ctx, bx, by)
{
  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  
  ctx.fillStyle = 'gray';
  for (var i = 0; i < this.lights.length; i++) {
    var rect = this.lights[i].bounds;
    ctx.fillRect(bx+rect.x, by+rect.y, rect.width, rect.height);
  }
  GameScene.prototype.render.call(this, ctx, bx, by);
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);
};

Game.prototype.move = function (vx, vy)
{
  this.player.velocity.x = vx;
  this.player.velocity.y = vy;
};

Game.prototype.action = function (action)
{
};
