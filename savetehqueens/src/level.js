// level.js

// [GAME SPECIFIC CODE]

// Queen: 
function Queen(bounds, hitbox, tileno)
{
  Actor.call(this, bounds, hitbox, tileno);
  this.affected = 0;
  this.focused = false;
}

Queen.prototype = Object.create(Actor.prototype);
Queen.prototype.affects = function (queen) {
  var x0 = Math.floor(this.hitbox.centerx() / this.scene.tilesize);
  var y0 = Math.floor(this.hitbox.centery() / this.scene.tilesize);
  var x1 = Math.floor(queen.hitbox.centerx() / this.scene.tilesize);
  var y1 = Math.floor(queen.hitbox.centery() / this.scene.tilesize);
  if (x0 == x1) {
    this.affected |= 1;
    queen.affected |= 1;
  }
  if (y0 == y1) {
    this.affected |= 2;
    queen.affected |= 2;
  }
  if (Math.abs(x1-x0) == Math.abs(y1-y0)) {
    if (0 < (x1-x0)*(y1-y0)) {
      this.affected |= 4;
      queen.affected |= 4;
    } else {
      this.affected |= 8;
      queen.affected |= 8;
    }
  }
}
Queen.prototype.update = function () {
  this.tileno = this.affected? S.AFFECTED : S.QUEEN;
  if (this.focused) {
    this.tileno = S.FOCUSED;
  }
  Actor.prototype.update(this);
};
Queen.prototype.renderBackground = function (ctx, x, y)
{
  // [OVERRIDE]
  var w = this.bounds.width;
  var h = this.bounds.height;
  var w0 = this.scene.game.screen.width;
  var h0 = this.scene.game.screen.height;
  var v = w0+h0;
  if (this.affected & 1) {
    ctx.fillStyle = 'rgb(128,0,0)';
    ctx.fillRect(x, 0, w, h0);
  }
  if (this.affected & 2) {
    ctx.fillStyle = 'rgb(0,128,0)';
    ctx.fillRect(0, y, w0, h);
  }
  if (this.affected & 4) {
    ctx.fillStyle = 'rgb(0,0,128)';
    ctx.beginPath();
    ctx.moveTo(x, y+h);
    ctx.lineTo(x-v, y+h-v);
    ctx.lineTo(x-v+w, y-v);
    ctx.lineTo(x+v+w, y+v);
    ctx.lineTo(x+v, y+h+v);
    ctx.closePath();
    ctx.fill();
  }
  if (this.affected & 8) {
    ctx.fillStyle = 'rgb(0,0,128)';
    ctx.beginPath();
    ctx.moveTo(x+w, y+h);
    ctx.lineTo(x+w+v, y+h-v);
    ctx.lineTo(x+v, y-v);
    ctx.lineTo(x-v, y+v);
    ctx.lineTo(x-v+w, y+h+v);
    ctx.closePath();
    ctx.fill();
  }
};


//  Level1
// 
function Level1(game)
{
  Scene.call(this, game);
  
  this.tilesize = 32;
  //this.music = game.audios.music;
}

Level1.prototype = Object.create(Level.prototype);
  
Level1.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]

  // Fill with the background color.
  ctx.fillStyle = 'black';
  ctx.fillRect(bx, by, this.game.screen.width, this.game.screen.height);
  ctx.strokeStyle = 'white';

  var dx = (this.game.screen.width-256)/2;
  for (var x = 0; x < 8; x++) {
    ctx.strokeRect(x*this.tilesize+dx, 0,
		   this.tilesize, this.game.screen.height);
    ctx.strokeRect(dx, x*this.tilesize,
		   this.game.screen.height, this.tilesize);
  }
  // Draw objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds !== null) {
      var bounds = obj.bounds;
      obj.renderBackground(ctx, bx+dx+bounds.x, by+bounds.y);
    }
  }
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds === null) {
      obj.render(ctx, bx, by);
    } else {
      var bounds = obj.bounds;
      obj.render(ctx, bx+dx+bounds.x, by+bounds.y);
    }
  }
};

Level1.prototype.update = function ()
{
  var n = 0;
  for (var i = 0; i < this.colliders.length; i++) {
    var obj = this.colliders[i];
    obj.affected = 0;
  }
  for (var i = 0; i < this.colliders.length; i++) {
    var obj0 = this.colliders[i];
    for (var j = i+1; j < this.colliders.length; j++) {
      var obj1 = this.colliders[j];
      obj0.affects(obj1);
    }
    if (obj0.affected != 0) {
      n++;
    }
  }
  Level.prototype.update.call(this);
  if (this.dragging === null && n == 0) {
    var scene = this;
    scene.addObject(new Task(function (task) {
      if (task.ticks0+scene.game.framerate < scene.ticks) {
	scene.changed.signal('WON');
      }
    }));
  }
};

Level1.prototype.init = function ()
{
  Level.prototype.init.call(this);
  
  // [OVERRIDE]
  // [GAME SPECIFIC CODE]
  var ts = this.tilesize;
  for (var y = 0; y < 8; y++) {
    var x = rnd(8);
    var rect = new Rectangle(x*ts, y*ts, ts, ts);
    this.addObject(new Queen(rect, rect, S.QUEEN));
  }
  
  var game = this.game;
  var scene = this;

  // show a banner.
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+game.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, game.framerate/2)) {
      game.renderString(game.images.font_w, 'LINE UP QUEENS NOT KILLING EACH OTHER!', 1,
			x+game.screen.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);

  this.dragging = null;
  this.x0 = 0;
  this.y0 = 0;
};

Level1.prototype.findObject = function (x, y)
{
  x -= (this.game.screen.width-256)/2;
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.bounds !== null) {
      if (obj.bounds.contains(x, y)) {
	return obj;
      }
    }
  }
  return null;
}

Level1.prototype.mousedown = function (x, y, button)
{
  this.dragging = this.findObject(x, y);
  this.x0 = x;
  this.y0 = y;
  if (this.dragging !== null) {
    this.dragging.focused = true;
  }
};

Level1.prototype.mouseup = function (x, y, button)
{
  if (this.dragging !== null) {
    var obj = this.dragging;
    x = Math.floor(obj.bounds.centerx()/this.tilesize);
    y = Math.floor(obj.bounds.centery()/this.tilesize);
    obj.bounds.x = x*this.tilesize;
    obj.bounds.y = y*this.tilesize;
    obj.hitbox.x = x*this.tilesize;
    obj.hitbox.y = y*this.tilesize;
    this.dragging.focused = false;
    this.dragging = null;
  }
};

Level1.prototype.mousemove = function (x, y)
{
  if (this.dragging !== null) {
    var obj = this.dragging;
    var dx = x-this.x0;
    var dy = y-this.y0;
    obj.bounds.x += dx;
    obj.bounds.y += dy;
    obj.hitbox.x += dx;
    obj.hitbox.y += dy;
    this.x0 = x;
    this.y0 = y;
  } else {
    x -= (this.game.screen.width-256)/2;
    for (var i = 0; i < this.sprites.length; i++) {
      var obj = this.sprites[i];
      if (obj.bounds !== null) {
	obj.focused = obj.bounds.contains(x, y);
      }
    }
  }
};
