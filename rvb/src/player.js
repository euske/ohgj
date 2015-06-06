// player.js

// [GAME SPECIFIC CODE]

// FixedSprite
function FixedSprite(bounds, duration, tileno)
{
  Sprite.call(this, bounds);
  this.duration = duration;
  this.tileno = tileno;
}

FixedSprite.prototype = Object.create(Sprite.prototype);

FixedSprite.prototype.update = function ()
{
  Sprite.prototype.update.call(this);
  this.alive = (this.scene.ticks < this.ticks0+this.duration);
  this.bounds.y -= 1;
};

FixedSprite.prototype.render = function (ctx, x, y)
{
  var sprites = this.scene.game.sprites;
  var tw = sprites.height;
  var w = this.bounds.width;
  var h = this.bounds.height;
  ctx.drawImage(sprites,
		this.tileno*tw, tw-h, w, h,
		x, y, w, h);
};


// Player
function Player(bounds)
{
  var hitbox = bounds;
  Actor.call(this, bounds, hitbox, S.PLAYER);
  this.color = 'red';
  this.tile = T.RED;
  this.speed = 8;
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.toString = function ()
{
  return '<Player: '+this.bounds+'>';
}

Player.prototype.move = function (vx, vy)
{
  if (this.scene === null) return;
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return T.isObstacle(tilemap.get(x,y)); });
  var v = tilemap.getMove(this.hitbox, new Point(vx*this.speed, vy*this.speed), f);
  Actor.prototype.move.call(this, v.x, v.y);
};

// Enemy
function Enemy(bounds)
{
  var hitbox = bounds;
  Actor.call(this, bounds, hitbox, S.PLAYER);
  this.color = 'blue';
  this.tile = T.BLUE;
  this.speed = 8;

  this._vx = -1;
  this._vy = 0;
}

Enemy.prototype = Object.create(Actor.prototype);

Enemy.prototype.update = function (vx, vy)
{
  if (this.scene === null) return;
  Actor.prototype.update.call(this);
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return T.isObstacle(tilemap.get(x,y)); });
  var v = tilemap.getMove(this.hitbox, new Point(this._vx*this.speed, this._vy*this.speed), f);
  if (v.x != this._vx*this.speed ||
      v.y != this._vy*this.speed ||
      rnd(8) == 0) {
    this._vx = rnd(3)-1;
    this._vy = rnd(3)-1;
  }
  Actor.prototype.move.call(this, v.x, v.y);
};
