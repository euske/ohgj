// game.js

function Thing(p, type)
{
  var bounds = new Rect(p.x*8, p.y*8, 8, 8);
  Actor.call(this, bounds, bounds, type+1);
  this.p = p;
  this.type = type;
  this.active = false;
  this.score = 0;
}

Thing.prototype = Object.create(Actor.prototype);

Thing.prototype.activate = function (score)
{
  if (this.active) return;
  this.active = true;
  this.score = score;
  switch (this.type) {
  case 0:			// neko
    this.v = new Vec2(0, -1);
    playSound(this.scene.app.audios.kitty);
    break;
  case 1:			// tonton
    this.v = new Vec2(1, 0);
    playSound(this.scene.app.audios.tonton);
    break;
  case 2:			// kaeru
    this.v = new Vec2(-1, +1);
    playSound(this.scene.app.audios.kero);
    break;
  }
};

Thing.prototype.update = function ()
{
  if (this.active) {
    var x = this.p.x+this.v.x;
    var y = this.p.y+this.v.y;
    if (x < 0 || y < 0 || 40 <= x || 30 <= y) {
      this.alive = false;
      this.scene.addScore(this.score*this.score);
    } else {
      this.p.x += this.v.x;
      this.p.y += this.v.y;
      this.bounds = new Rect(this.p.x*8, this.p.y*8, 8, 8);
      this.hitbox = this.bounds;
    }
  }
};

Thing.prototype.collide = function (obj)
{
  if (this.active && !obj.active) {
    this.alive = false;
    var score = this.score+1;
    obj.activate(score);
    var scene = this.scene;
    var app = scene.app;
    var particle = new Sprite(null);
    particle.update = function () {
      particle.alive = (scene.ticks < particle.ticks0+10);
    };
    particle.render = function (ctx, x, y) {
      app.renderString(app.images.font_w, ''+score, 2,
		       x+obj.bounds.x-10, y+obj.bounds.y-10, 'center');
    }
    scene.addObject(particle);
  }
}


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
  var d = {};
  for (var i = 0; i < 100; i++) {
    var p = new Vec2(rnd(40), rnd(30));
    var k = p.x+","+p.y;
    if (d[k] === undefined) {
      var obj = new Thing(p, rnd(3));
      this.addObject(obj);
      d[k] = 1;
    }
  }

  this.score=0;

  // show a banner.
  var scene = this;
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+app.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, app.framerate/2)) {
      app.renderString(app.images.font_w, 'CLICK ANIMALS!', 1,
		       x+app.screen.width/2, y+app.screen.height/2-10, 'center');
    }
  };
  this.addObject(banner);
};

Game.prototype.render = function (ctx, bx, by)
{
  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,128,255)';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  GameScene.prototype.render.call(this, ctx, bx, by);
  var app = this.app;
  app.renderString(app.images.font_w, ''+this.score, 1, 4, 4, 'left');
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);
};

Game.prototype.mousedown = function (x, y, b)
{
  x = Math.floor(x/8);
  y = Math.floor(y/8);
  var rect = new Rect(x*8, y*8, 8, 8);
  var objs = this.findObjects(rect, (function (obj) { return true; }));
  for (var i = 0; i < objs.length; i++) {
    objs[i].activate(0);
  }
};

Game.prototype.addScore = function (score)
{
  this.score += score;
};
