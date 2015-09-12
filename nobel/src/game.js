// game.js

function Player(bounds)
{
  Actor.call(this, bounds, bounds, 0);
  this._jumpt = -1;
  this.maxacctime = 4;
  this.gravity = 1;
  this.maxspeed = 4;
  this.jumpacc = -4;
  this.velocity = new Vec2(0, 0);
  this.landed = false;
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.jump = function (jumping)
{
  if (this.scene === null) return;
  if (jumping) {
    if (this.landed) {
      this._jumpt = 0;
      this.velocity.y = this.jumpacc;
      playSound(this.scene.app.audios.jump);
    }
  } else {
    this._jumpt = -1;
  }
};

Player.prototype.update = function ()
{
  var r = this.scene.collide(this);
  for (var i = 0; i < r.length; i++) {
    var a = r[i];
    if (a instanceof Actor) {
      this.scene.pick(a.tileno);
      a.alive = false;
    }
  }

  if (0 <= this._jumpt && this._jumpt < this.maxacctime) {
    this._jumpt++;
    this.velocity.y -= this.gravity;
  }
  this.velocity.y += this.gravity;
  this.velocity.y = clamp(-this.maxspeed, this.velocity.y, this.maxspeed);
  var v = this.hitbox.collide(this.velocity, this.scene.ground);
  this.landed = (0 < this.velocity.y && v.y === 0);
  this.velocity.y = v.y;
  this.move(this.velocity.x, this.velocity.y);
};

function Thingy(bounds, tileno)
{
  Actor.call(this, bounds, bounds, tileno);
  this.speed = (tileno == 1)? 1 : 2;
}

Thingy.prototype = Object.create(Actor.prototype);

Thingy.prototype.update = function ()
{
  this.move(0, this.speed);
  if (this.scene.ground.overlap(this.hitbox)) {
    switch (this.tileno) {
    case 1:
      playSound(this.scene.app.audios.explosion);
      this.scene.init();
      break;
    case 2:
      playSound(this.scene.app.audios.tonton);
      break;
    case 3:
      playSound(this.scene.app.audios.kitty);
      break;
    } 
    this.alive = false;
  }
};


//  Game
// 
function Game(app)
{
  GameScene.call(this, app);

  this.world = new Rectangle(0, 0, app.screen.width, app.screen.height);
}

Game.prototype = Object.create(GameScene.prototype);
  
Game.prototype.render = function (ctx, bx, by)
{
  // [GAME SPECIFIC CODE]
  ctx.drawImage(this.app.images.background, bx, by);
  GameScene.prototype.render.call(this, ctx, bx, by);
};

Game.prototype.update = function ()
{
  // [GAME SPECIFIC CODE]
  GameScene.prototype.update.call(this);

  if (rnd(15) == 0) {
    var x = rnd(this.world.width);
    var bounds = new Rectangle(x, 0, 8, 8);
    this.addObject(new Thingy(bounds, rnd(1,4)));
  }
};

Game.prototype.init = function ()
{
  // [GAME SPECIFIC CODE]
  GameScene.prototype.init.call(this);

  this.player = new Player(new Rectangle(80, 20, 8, 8));
  this.addObject(this.player);
  this.ground = new Rectangle(-100, 104, 360, 16);
  
  // show a banner.
  var app = this.app;
  var scene = this;
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+app.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, app.framerate/2)) {
      app.renderString(app.images.font_w, 'GET ALL DYNAMITES!', 1,
		       x+app.screen.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);
};

Game.prototype.move = function (vx, vy)
{
  // [GAME SPECIFIC CODE]
  this.player.velocity.x = vx*2;
};

Game.prototype.action = function (action)
{
  // [GAME SPECIFIC CODE]
  this.player.jump(action);
};

Game.prototype.pick = function (n)
{
  if (n == 1) {
    playSound(this.app.audios.pick);
  } else {
    this.init();
  }
};

