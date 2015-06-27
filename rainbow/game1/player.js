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


// Thingy
function Thingy(bounds)
{
  Actor.call(this, bounds, bounds, S.COLLECTIBLE);
  this.speed = rnd(4, 10);
  this.color = rnd(COLORS.length);
}

Thingy.prototype = Object.create(Actor.prototype);

Thingy.prototype.update = function ()
{
  if (this.scene === null) return;
  if (this.bounds.x < 0) {
    this.alive = false;
  } else {
    this.move(-this.speed, 0);
  }
};

Thingy.prototype.render = function (ctx, x, y)
{
  var w = this.bounds.width;
  var h = this.bounds.height;
  ctx.fillStyle = COLORS[this.color];
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x, y, w, h);
};

// Player
function Player(bounds)
{
  Actor.call(this, bounds, bounds, S.PLAYER);
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
  var r = this.scene.collide(this);
  for (var i = 0; i < r.length; i++) {
    var a = r[i];
    if (a instanceof Actor && a.tileno == S.COLLECTIBLE) {
      this.pick(a);
    }
  }
};

Player.prototype.move = function (vx, vy)
{
  if (this.scene === null) return;
  Actor.prototype.move.call(this, vx*this.speed, vy*this.speed);
  this.bounds.x = Math.max(0, this.bounds.x);
  this.bounds.x = Math.min(this.scene.window.width-this.bounds.width, this.bounds.x);
  this.bounds.y = Math.max(0, this.bounds.y);
  this.bounds.y = Math.min(this.scene.window.height-this.bounds.height, this.bounds.y);
  this.hitbox = this.bounds;
};

Player.prototype.jump = function (jumping)
{
  if (this.scene === null) return;
};

Player.prototype.pick = function (a)
{
  a.alive = false;
  if (this.scene.match(a.bounds.x, a.bounds.width, a.color)) {
    this.picked.signal(+1);
    // show a particle.
    var particle = new FixedSprite(a.bounds, this.scene.game.framerate, S.YAY);
    this.scene.addObject(particle);
  } else {
    this.picked.signal(-1);
  }
};
