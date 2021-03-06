// game.js
// Game class handles the event loop and global state management.
// It also has shared resources (images, audios, etc.)

function Game(framerate, screen, buffer, images, audios, labels)
{
  this.framerate = framerate;
  this.screen = screen;
  this.buffer = buffer;
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
}

Game.prototype.init = function ()
{
  var tilesize = 16;
  var window = new Rectangle(0, 0, this.buffer.width, this.buffer.height);
  var game = this;
  removeChildren(this.screen.parentNode, 'div');
  this.scene = new Scene(this, tilesize, window);
  this.scene.init();
  this.player = new Player(new Rectangle(0, 0, tilesize, tilesize*2));
  this.scene.addActor(this.player);
  this.score_node = this.addElement(new Rectangle(10, 10, 100, 20));
  this.score_node.align = 'left';
  this.score_node.style.color = 'white';
  this.score = 0;
  this.addScore(0);
  //this.scene.setCenter(new Rectangle(0, 0, this.scene.mapWidth, this.scene.mapHeight));
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
    this.player.jump();
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
  if (rnd(10) == 0) {
    this.scene.addParticle(new Particle(1, this.player.bounds, 10));
  }
  this.scene.idle();
};

Game.prototype.focus = function (ev)
{
  this.active = true;
  //this.audios.music.play();
};

Game.prototype.blur = function (ev)
{
  //this.audios.music.pause();
  this.active = false;
};

Game.prototype.repaint = function (ctx)
{
  ctx.clearRect(0, 0, this.buffer.width, this.buffer.height);
  ctx.save();
  this.scene.repaint(ctx,
		     (this.buffer.width-this.scene.window.width)/2,
		     (this.buffer.height-this.scene.window.height)/2);		     
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

Game.prototype.addElement = function(bounds)
{
  var e = document.createElement('div');
  e.style.position = 'absolute';
  e.style.left = bounds.x+'px';
  e.style.top = bounds.y+'px';
  e.style.width = bounds.width+'px';
  e.style.height = bounds.height+'px';
  e.style.padding = '0px';
  this.screen.parentNode.appendChild(e);
  return e;
}

Game.prototype.removeElement = function(e)
{
  e.parentNode.removeChild(e);
}

Game.prototype.addScore = function (d)
{
  this.score += d;
  this.score_node.innerHTML = ('Score: '+this.score);
};
