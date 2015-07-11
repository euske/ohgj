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


// Money
function Money(bounds, speed, tileno)
{
  var hitbox = bounds.inflate(-4, -4);
  Actor.call(this, bounds, hitbox, tileno);
  this.speed = speed;
}

Money.prototype = Object.create(Actor.prototype);

Money.prototype.update = function ()
{
  this.move(-this.speed, 0);
  if (this.bounds.right() < 0) {
    this.alive = false;
  }
}

// Player
function Player(bounds)
{
  var hitbox = bounds.inflate(-4, -4);
  Actor.call(this, bounds, hitbox, S.PLAYER);
  this.speed = 8;
  
  this.picked = new Slot(this);
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.toString = function ()
{
  return '<Player: '+this.bounds+'>';
}

Player.prototype.update = function ()
{
  if (this.scene === null) return;
  var r = this.scene.collide(this);
  for (var i = 0; i < r.length; i++) {
    var a = r[i];
    if (a instanceof Money) {
      this.pick(a);
    }
  }
};

Player.prototype.usermove = function (vx, vy)
{
  this.move(vx*this.speed, vy*this.speed);
  this.bounds.x = Math.max(0, this.bounds.x);
  this.bounds.x = Math.min(this.scene.window.width-this.scene.tilesize, this.bounds.x);
  this.bounds.y = Math.max(0, this.bounds.y);
  this.bounds.y = Math.min(this.scene.window.height-this.scene.tilesize, this.bounds.y);
  this.hitbox = this.bounds.inflate(-4,-4);
}

Player.prototype.pick = function (a)
{
  a.alive = false;
  this.picked.signal(a);
};
