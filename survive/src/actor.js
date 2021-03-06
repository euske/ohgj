// actor.js

// Actor
function Actor(rect)
{
  this.scene = null;
  this.start = 0;
  this.alive = true;
  
  this.bounds = rect;
  this.hitbox = rect;
}

Actor.prototype.repaint = function(ctx, x, y)
{
};

Actor.prototype.idle = function()
{
};

// Particle
function Particle(bounds, duration)
{
  this.scene = null;
  this.start = 0;
  this.alive = true;
  
  this.bounds = bounds;
  this.duration = duration;
}

Particle.prototype.repaint = function(ctx, x, y)
{
  var ts = this.scene.tilesize;
  ctx.drawImage(this.scene.game.images.sprites,
		1*ts, 0, ts, ts,
		x, y, this.bounds.width, this.bounds.height);
};

Particle.prototype.idle = function()
{
  this.bounds.y -= 1;
  this.alive = (this.scene.ticks < this.start+this.duration);
};


// Collectible
function Collectible(rect)
{
  this.scene = null;
  this.start = 0;
  this.alive = true;
  
  this.bounds = rect;
  this.hitbox = rect.inset(4, 4);
}

Collectible.prototype.repaint = function(ctx, x, y)
{
  var ts = this.scene.tilesize;
  ctx.drawImage(this.scene.game.images.sprites,
		Sprite.COLLECTIBLE*ts, 0, ts, ts,
		x, y, this.bounds.width, this.bounds.height);
};

Collectible.prototype.idle = Actor.prototype.idle;

// Player
function Player(rect)
{
  this.scene = null;
  this.start = 0;
  this.alive = true;
  
  this.speed = 8;
  this.gravity = 2;
  this.maxspeed = 16;
  this.jumpacc = -16;
  
  this.bounds = rect;
  this.hitbox = rect.inset(4, 4);
  this.picked = new Slot(this);
  this.jumped = new Slot(this);
}

Player.prototype.repaint = function (ctx, x, y)
{
  var ts = this.scene.tilesize;
  ctx.drawImage(this.scene.game.images.sprites,
		Sprite.PLAYER*ts, 0, ts, ts,
		x, y, this.bounds.width, this.bounds.height);
};

Player.prototype.idle = function ()
{
  var r = this.scene.collide(this);
  for (var i = 0; i < r.length; i++) {
    var a = r[i];
    if (a instanceof Danger) {
      this.alive = false;
      this.picked.signal();
      this.scene.addParticle(new Particle(a.bounds, this.scene.game.framerate));
    }
  }
};

Player.prototype.move = function (vx, vy)
{
  var tilemap = this.scene.tilemap;
  var v = new Point(this.speed * vx, this.speed * vy);
  var f = (function (x,y) { return Tile.isObstacle(tilemap.get(x,y)); });
  var d = tilemap.collide(this.hitbox, new Point(v.x, v.y), f);
  d.x = tilemap.collide(this.hitbox, new Point(v.x, d.y), f).x;
  d.y = tilemap.collide(this.hitbox, new Point(d.x, v.y), f).y;
  this.bounds = this.bounds.move(d.x, d.y);
  this.hitbox = this.hitbox.move(d.x, d.y);
};

Player.prototype.pick = function ()
{
  var r = this.scene.collide(this);
  for (var i = 0; i < r.length; i++) {
    var a = r[i];
    if (a instanceof Collectible) {
      a.alive = false;
      this.picked.signal();
      this.scene.addParticle(new Particle(a.bounds, this.scene.game.framerate));
    }
  }
};

Player.prototype.jump = function ()
{
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return Tile.isObstacle(tilemap.get(x,y)); });
  var d = tilemap.collide(this.hitbox, new Point(0, this._gy), f);
  if (0 < this._gy && d.y == 0) {
    this._gy = this.jumpacc;
    this.jumped.signal();
  }
};

// Danger
function Danger(rect, sprite, vx, vy)
{
  this.scene = null;
  this.start = 0;
  this.alive = true;
  
  this.bounds = rect;
  this.hitbox = rect;
  this.sprite = sprite;
  this.vx = vx;
  this.vy = vy;
}

Danger.prototype.repaint = function(ctx, x, y)
{
  var ts = this.scene.tilesize;
  ctx.drawImage(this.scene.game.images.sprites,
		this.sprite*ts, 0, ts, ts,
		x, y, this.bounds.width, this.bounds.height);
};

Danger.prototype.idle = function ()
{
  this.bounds = this.bounds.move(this.vx, this.vy);
  this.hitbox = this.bounds.inset(16, 16);
  if (!this.bounds.overlap(this.scene.window)) {
    this.alive = false;
  }
};
