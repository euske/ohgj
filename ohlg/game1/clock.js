// clock.js

// [GAME SPECIFIC CODE]

// Clock
function Clock(bounds, speed)
{
  Sprite.call(this, bounds);
  this.speed = speed;
  this.offset = 0;
  this.color = 'white';
  this.master = false;
  this.follow = false;
  this.highlight = false;
}

Clock.prototype = Object.create(Sprite.prototype);

Clock.prototype.update = function ()
{
  Sprite.prototype.update.call(this);
  this.rot = (this.scene.ticks-this.offset)*this.speed/this.scene.game.framerate*Math.PI;
  var dt = (this.scene.ticks-this.ticks0)*this.speed/this.scene.game.framerate;
  if (!this.master) {
    if (1.0 <= dt) {
      this.alive = false;
      if (this.follow) {
	this.scene.updateScore(-1);
      }
    }
  }
};

Clock.prototype.render = function (ctx, x, y)
{
  x += this.bounds.centerx();
  y += this.bounds.centery(),
  ctx.lineWidth = 1;
  ctx.strokeStyle = this.color;
  if (!this.master && this.highlight) {
    ctx.strokeStyle = 'yellow';
  }
  ctx.beginPath();
  ctx.arc(x, y, this.bounds.width/2, 0, 2*Math.PI);
  ctx.closePath();
  ctx.stroke();
  var r = this.rot;
  ctx.moveTo(x, y);
  ctx.lineTo(x+this.bounds.width/2*Math.cos(r), y-this.bounds.height/2*Math.sin(r));
  ctx.stroke();
  ctx.moveTo(x, y);
  ctx.lineTo(x+this.bounds.width/3*Math.cos(r/12), y-this.bounds.height/3*Math.sin(r/12));
  ctx.stroke();
};

Clock.prototype.click = function ()
{
  if (!this.master) {
    this.scene.updateScore(this.follow? +1 : -1);
    this.alive = false;
  }
};
