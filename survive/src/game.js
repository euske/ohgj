// game.js
// Game class handles the event loop and global state management.
// It also has shared resources (images, audios, etc.)

function Game(framerate, canvas, images, audios, labels)
{
  this.framerate = framerate;
  this.canvas = canvas;
  this.images = images;
  this.audios = audios;
  this.labels = labels;
  this.active = false;
  this.state = 0;
  this._key_left = false;
  this._key_right = false;
  this._key_up = false;
  this._key_down = false;
  this._vx = 0;
  this._vy = 0;

  this.highscore = 0;
}

Game.prototype.init = function ()
{
  var tilesize = 32;
  var window = new Rectangle(0, 0, this.canvas.width, this.canvas.height);
  var game = this;
  this.scene = new Scene(this, tilesize, window);
  this.scene.init();
  var rect = new Rectangle((this.canvas.width-tilesize)/2,
			   (this.canvas.height-tilesize)/2,
			   tilesize, tilesize);
  this.player = new Player(rect);
  this.player.picked.subscribe(function (e) { game.player_picked(e); });
  //this.player.jumped.subscribe(function (e) { game.player_jumped(e); });
  this.scene.addActor(this.player);
  this.score = 0;
};

Game.prototype.keydown = function (ev)
{
  switch (ev.keyCode) {
  case 37:			// LEFT
  case 65:			// A
  case 72:			// H
    this._key_left = true;
    this._vx = -1;
    break;
  case 39:			// RIGHT
  case 68:			// D
  case 76:			// L
    this._key_right = true;
    this._vx = +1;
    break;
  case 38:			// UP
  case 87:			// W
  case 75:			// K
    this._key_up = true;
    this._vy = -1;
    break;
  case 40:			// DOWN
  case 83:			// S
  case 74:			// J
    this._key_down = true;
    this._vy = +1;
    break;
  case 13:			// ENTER
  case 32:			// SPACE
  case 90:			// Z
  case 88:			// X
    this.action();
    break;
  case 112:			// F1
    break;
  }
};

Game.prototype.keyup = function (ev)
{
  switch (ev.keyCode) {
  case 37:			// LEFT
  case 65:			// A
  case 72:			// H
    this._key_left = false;
    this._vx = (this._key_right) ? +1 : 0;
    break;
  case 39:			// RIGHT
  case 68:			// D
  case 76:			// L
    this._key_right = false;
    this._vx = (this._key_left) ? -1 : 0;
    break;
  case 38:			// UP
  case 87:			// W
  case 75:			// K
    this._key_up = false;
    this._vy = (this._key_down) ? +1 : 0;
    break;
  case 40:			// DOWN
  case 83:			// S
  case 74:			// J
    this._key_down = false;
    this._vy = (this._key_up) ? -1 : 0;
    break;
  }
};

Game.prototype.idle = function ()
{
  this.player.move(this._vx, this._vy);
  this.scene.setCenter(this.player.bounds.inset(-200, -100));
  this.scene.idle();
  this.addScore(+1);
};

Game.prototype.action = function ()
{
  this.player.jump();
};

Game.prototype.focus = function (ev)
{
  this.active = true;
};

Game.prototype.blur = function (ev)
{
  this.active = false;
};

Game.prototype.repaint = function (ctx)
{
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  this.scene.repaint(ctx, 0, 0);
  if (!this.active) {
    var size = 50;
    ctx.fillStyle = 'rgba(0,0,64, 0.5)'; // gray out
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = 'lightgray';
    ctx.beginPath();
    ctx.moveTo(this.canvas.width/2-size, this.canvas.height/2-size);
    ctx.lineTo(this.canvas.width/2-size, this.canvas.height/2+size);
    ctx.lineTo(this.canvas.width/2+size, this.canvas.height/2);
    ctx.fill();
  }
  ctx.restore();
};

Game.prototype.renderString = function(ctx, font, text, scale, x, y)
{
  var fs = font.height;
  for (var i = 0; i < text.length; i++) {
    var c = text.charCodeAt(i);
    ctx.drawImage(font,
		  (c-32)*fs, 0, fs, fs,
		  x, y, fs*scale, fs*scale);
    x += fs*scale;
  }
}

Game.prototype.addScore = function (d)
{
  this.score += d;
  this.labels.score.innerHTML = ("Score: "+this.score);
};

Game.prototype.player_jumped = function (e)
{
  this.audios.jump.currentTime = 0;
  this.audios.jump.play();
};

Game.prototype.player_picked = function (e)
{
  this.audios.explosion.currentTime = 0;
  this.audios.explosion.play();

  if (this.highscore < this.score) {
    this.highscore = this.score;
    this.labels.highscore.innerHTML = ("Highscore: "+this.highscore);
  }
  this.init();
};

Game.prototype.addElement = function(bounds)
{
  var e = document.createElement("div");
  e.style.position = "absolute";
  e.style.left = bounds.x+"px";
  e.style.top = bounds.y+"px";
  e.style.width = bounds.width+"px";
  e.style.height = bounds.height+"px";
  this.canvas.parentNode.appendChild(e);
  return e;
}

Game.prototype.removeElement = function(e)
{
  e.parentNode.removeChild(e);
}
