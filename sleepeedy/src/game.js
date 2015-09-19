// game.js

// Player
function Player(p)
{
  var bounds = new Rectangle(p.x, p.y).inflate(8, 8);
  Actor.call(this, bounds, bounds, 0);
  this.velocity = new Vec2(0, 0);
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.update = function ()
{
  var speed = this.scene.speed;
  this.move(this.velocity.x*speed, this.velocity.y*speed);
  this.bounds = this.bounds.clamp(this.scene.world);
  this.hitbox = this.bounds.copy();
};

Player.prototype.shoot = function ()
{
  var b = new Bullet(this.bounds.center())
  this.scene.addObject(b);
};

Player.prototype.collide = function (actor)
{
  if (actor instanceof Sheep) {
    this.scene.sleepy++;
    playSound(this.scene.app.audios.hurt);
  }
};


// Bullet
function Bullet(p)
{
  var bounds = new Rectangle(p.x, p.y).inflate(4, 4);
  Actor.call(this, bounds, bounds, 1);
}

Bullet.prototype = Object.create(Actor.prototype);

Bullet.prototype.update = function ()
{
  var speed = this.scene.speed*2;
  this.move(speed, 0);
  if (this.scene.world.width <= this.bounds.x) {
    this.alive = false;
  }
};


// Sheep
function Sheep(p)
{
  var bounds = new Rectangle(p.x, p.y).inflate(8, 8);
  Actor.call(this, bounds, bounds, 2);
}

Sheep.prototype = Object.create(Actor.prototype);

Sheep.prototype.collide = function (actor)
{
  if (actor instanceof Bullet) {
    this.alive = false;
    this.scene.speed++;
    playSound(this.scene.app.audios.hit);
  }
};

Sheep.prototype.update = function ()
{
  var speed = this.scene.speed;
  this.move(-speed, 0);
  if (this.bounds.right() <= 0) {
    this.alive = false;
  }
};


//  GameOver
//
function GameOver(app, score)
{
  TextScene.call(this, app);
  this.text = '<b>Too Sleepy!</b><p><b>Score: '+score+'</b><p>Press Enter to restart.';
  this.music = app.audios.naptime;
}

GameOver.prototype = Object.create(TextScene.prototype);

GameOver.prototype.change = function ()
{
  this.changeScene(new Game(this.app));
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
  this.player = new Player(new Vec2(32,50));
  this.addObject(this.player);

  this.speed = 1;
  this.sleepy = 0;
  this.score = 0;
  
  // show a banner.
  var scene = this;
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+app.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, app.framerate/2)) {
      app.renderString(app.images.font_w, 'GAME!!!', 1,
		       x+app.screen.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);

  if (rnd(Math.floor(10/(this.sleepy+1))) == 0) {
    var a = new Sheep(new Vec2(this.world.right(), rnd(this.world.height)));
    this.addObject(a);
  }

  if (20 <= this.sleepy) {
    this.changeScene(new GameOver(this.app, this.speed-1));
  }
};

Game.prototype.move = function (vx, vy)
{
  this.player.velocity.x = vx;
  this.player.velocity.y = vy;
};

Game.prototype.action = function (action)
{
  if (action) {
    this.player.shoot();
    playSound(this.app.audios.shoot);
  }
};
