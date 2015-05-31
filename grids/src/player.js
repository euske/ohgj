// player.js

// [GAME SPECIFIC CODE]

// Player
function Player(bounds)
{
  this.init();
  this.sprite = Sprite.PLAYER;
  
  this.speed = 4;
  this.gravity = 2;
  this.maxspeed = 16;
  this.jumpacc = -16;

  this.health = 5;
  this.invuln = 0;

  this.bounds = bounds;
  this.hitbox = bounds.inset(4, 4);
  this.picked = new Slot(this);
  this.jumped = new Slot(this);
  this.hurt = new Slot(this);
}

Player.prototype.render0 = Actor.prototype.render;

Player.prototype.toString = function ()
{
  return "<Player: "+this.bounds+">";
}

Player.prototype.init = Actor.prototype.init;

Player.prototype.start = Actor.prototype.start;

Player.prototype.idle = function ()
{
  if (this.scene == null) return;
  var r = this.scene.collide(this);
  for (var i = 0; i < r.length; i++) {
    var a = r[i];
    if (a instanceof Enemy) {
      if (this.invuln == 0) {
	this.hurt.signal();
      }
    } else if (a instanceof Actor && a.sprite == Sprite.COLLECTIBLE) {
      this.pick(a);
    }
  }
  if (0 < this.invuln) {
    this.invuln--;
  }
};

Player.prototype.render = function (ctx, x, y) 
{
  if (0 < this.invuln && (this.scene.ticks % 6) < 4) return;
  this.render0(ctx, x, y);
}

Player.prototype.move = function (vx, vy)
{
  if (this.scene == null) return;
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return Tile.isObstacle(tilemap.get(x,y)); });
  var v = tilemap.getMove(this.hitbox, new Point(vx*this.speed, vy*this.speed), f);
  this.hitbox = this.hitbox.move(v.x, v.y);
  this.bounds = this.bounds.move(v.x, v.y);
  //this._gy = Math.min(v.y + this.gravity, this.maxspeed);
};

Player.prototype.jump = function ()
{
  if (this.scene == null) return;
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return Tile.isObstacle(tilemap.get(x,y)); });
  var d = tilemap.collide(this.hitbox, new Point(0, this._gy), f);
  if (0 < this._gy && d.y == 0) {
    this._gy = this.jumpacc;
    this.jumped.signal();
  }
};

Player.prototype.pick = function (a)
{
  a.alive = false;
  this.picked.signal();
  // show a particle.
  var particle = new Particle(a.bounds, Sprite.YAY, this.scene.game.framerate);
  this.scene.addParticle(particle);
};
