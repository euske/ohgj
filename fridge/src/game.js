// game.js

function isObstacle(c) { return (c != 0); }
function isFridge(c) { return (c == 7); }

// Fridge
function Fridge(bounds)
{
  Actor.call(this, bounds, bounds, 4);
}

Fridge.prototype = Object.create(Actor.prototype);

// Animal
function Animal(bounds)
{
  Actor.call(this, bounds, bounds, rnd(1,3));
}

Animal.prototype = Object.create(Actor.prototype);

// Player
function Player(bounds)
{
  Actor.call(this, bounds, bounds, 0);
  this.gravity = 1;
  this.speed = 4;
  this.maxspeed = 4;
  this.jumpacc = -4;
  this.maxacctime = 4;
  this.velocity = new Vec2(0, 0);
  this._landed = false;
  this._jumpt = -1;
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.jump = function (jumping)
{
  if (jumping) {
    if (this._landed) {
      this._jumpt = 0;
      this.velocity.y = this.jumpacc;
      playSound(this.scene.app.audios.jump);
    }
  } else {
    this._jumpt = -1;
  }
};

Player.prototype.usermove = function (v)
{
  this.velocity.x = v.x*this.speed;
}

Player.prototype.update = function ()
{
  if (0 <= this._jumpt && this._jumpt < this.maxacctime) {
    this._jumpt++;
    this.velocity.y -= this.gravity;
  }
  this.velocity.y += this.gravity;
  this.velocity.y = clamp(-this.maxspeed, this.velocity.y, this.maxspeed);
  var v = this.getMove(this.velocity);
  this._landed = (0 < this.velocity.y && v.y === 0);
  this.velocity = v;
  this.move(this.velocity.x, this.velocity.y);
};

Player.prototype.collide = function (actor)
{
  if (actor instanceof Fridge) {
    playSound(this.scene.app.audios.pick);
    actor.die();
    this.scene.addObject(new Animal(actor.bounds));
  }
}

Player.prototype.contactTile = function (rect, v0)
{
  var tilemap = this.scene.tilemap;
  var ts = tilemap.tilesize;
  function f(x, y, v) {
    if (isObstacle(tilemap.get(x, y))) {
      var bounds = new Rectangle(x*ts, y*ts, ts, ts);
      v = rect.contact(v, bounds);
    }
    return v;
  }
  var r = rect.move(v0.x, v0.y).union(rect);
  return tilemap.reduce(tilemap.coord2map(r), f, v0);
};

Player.prototype.getMove = function (v)
{
  var rect = this.hitbox;
  var d0 = this.contactTile(rect, v);
  rect = rect.move(d0.x, d0.y);
  v = v.sub(d0);
  var d1 = this.contactTile(rect, new Vec2(v.x, 0));
  rect = rect.move(d1.x, d1.y);
  v = v.sub(d1);
  var d2 = this.contactTile(rect, new Vec2(0, v.y));
  return new Vec2(d0.x+d1.x+d2.x,
		  d0.y+d1.y+d2.y);
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

  var map = copyArray([
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,7,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,1,1,1],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    [0,0,0,0, 0,0,7,0, 0,0,0,0, 0,1,0,0, 0,0,0,0],
    
    [0,0,0,0, 0,0,1,1, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,1,1, 0,0,0,0, 0,0,0,0],
    [0,0,1,1, 0,0,0,0, 1,1,0,0, 0,0,0,0, 1,1,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 1,1,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    
    [0,0,0,0, 0,0,0,7, 0,0,0,0, 7,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,1,1, 1,1,0,0, 1,1,0,0, 0,0,0,0],
    [0,0,1,1, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,1,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [1,1,1,1, 1,1,1,1, 1,2,2,1, 1,1,1,1, 1,1,1,1],
  ]);
  var app = this.app;
  var scene = this;
  this.player = new Player(new Rectangle(0,0,8,8));
  this.addObject(this.player);

  this.tilemap = new TileMap(8, map);
  var tilemap = this.tilemap;
  var f = function (x,y) {
    if (isFridge(tilemap.get(x,y))) {
      var rect = tilemap.map2coord(new Vec2(x,y));
      scene.addObject(new Fridge(rect));
      tilemap.set(x, y, 0);
    }
  };
  this.tilemap.apply(null, f);
  
  // show a banner.
  this.textbox = new TextBoxTT(new Rectangle(8, 8, app.screen.width-16, app.screen.height-16));
  this.addObject(this.textbox);

  this.textbox.addTask(app.font, 'IT WAS A DARK AND STORMY NIGHT.', app.audios.beep, 8);
  this.textbox.duration = 80;

  this._lightning = false;
};

Game.prototype.render = function (ctx, bx, by)
{
  // Fill with the background color.
  ctx.fillStyle = this._lightning? 'yellow' : '#000020';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  var tilemap = this.tilemap;
  var ft = function (x,y) { return tilemap.get(x,y); }
  tilemap.renderFromBottomLeft(
    ctx, this.app.tiles, ft, 
    bx, by, 0, 0, 20, 15);
  GameScene.prototype.render.call(this, ctx, bx, by);
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);
  this.player.usermove(this.app.key_dir);
  if (rnd(30) == 0) {
    this._lightning = true;
    playSound(this.app.audios.explosion);
  } else {
    this._lightning = false;
  }
};

Game.prototype.set_action = function (action)
{
  GameScene.prototype.set_action(this, action);
  this.player.jump(action);
}
