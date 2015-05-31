// player.js

// [GAME SPECIFIC CODE]

// Player
function Player(bounds)
{
  Actor.call(this, bounds, Sprite.PLAYERL);
  this.speed = 2;
  this.gravity = 1;
  this.maxspeed = 4;
  this.jumpacc = -4;
  this.maxacctime = 4;
  
  this.hitbox = bounds;
  this.picked = new Slot(this);
  this.jumped = new Slot(this);
  this.goaled = new Slot(this);

  this._gy = 0;
  this._jumpt = -1;
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
    if (a instanceof Actor && Sprite.isCollectible(a.sprite)) {
      this.pick(a);
    }
  }
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return Tile.isGoal(tilemap.get(x,y)); });
  if (tilemap.apply(tilemap.coord2map(this.hitbox), f)) {
    this.goaled.signal();
  }
};

Player.prototype.move = function (vx, vy)
{
  if (this.scene === null) return;
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return Tile.isObstacle(tilemap.get(x,y)); });
  var v = tilemap.getMove(this.hitbox, new Point(vx*this.speed, this._gy), f);
  if (v.x < 0) { this.sprite = Sprite.PLAYERL; }
  else if (0 < v.x) { this.sprite = Sprite.PLAYERR; }
  Actor.prototype.move.call(this, v.x, v.y);
  if (0 <= this._jumpt && this._jumpt < this.maxacctime) {
    this._jumpt++;
  } else {
    this._gy = Math.min(v.y + this.gravity, this.maxspeed);
  }
};

Player.prototype.jump = function (jumping)
{
  if (this.scene === null) return;
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return Tile.isObstacle(tilemap.get(x,y)); });
  if (jumping) {
    var d = tilemap.collide(this.hitbox, new Point(0, this._gy), f);
    if (0 < this._gy && d.y == 0) {
      this._gy = this.jumpacc;
      this._jumpt = 0;
      this.jumped.signal();
    }
  } else {
    this._jumpt = -1;
  }
};

Player.prototype.pick = function (a)
{
  a.alive = false;
  this.picked.signal(a.sprite);
  // show a particle.
  var particle = new SpriteParticle(a.bounds, this.scene.game.framerate/2, Sprite.YAY);
  this.scene.addParticle(particle);
};
