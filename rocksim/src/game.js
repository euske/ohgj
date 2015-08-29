// game.js

int = Math.floor
// [GAME SPECIFIC CODE]

//  Title
//
function Title(app)
{
  TextScene.call(this, app);
  this.text = '<b>RocKing</b><p>Made for 1HGJ, Aug. 30th, 2015<p>Press Enter to start.';
}

Title.prototype = Object.create(TextScene.prototype);

Title.prototype.change = function ()
{
  this.changeScene(new Level1(this.app));
};


//  GameOver
//
function GameOver(app)
{
  TextScene.call(this, app);
  this.text = '<b>Game Over!</b><p>Press Enter to restart.';
}

GameOver.prototype = Object.create(TextScene.prototype);

GameOver.prototype.change = function ()
{
  this.changeScene(new Level1(this.app));
};


// Rock
function Rock(bounds, size)
{
  Actor.call(this, bounds, bounds.inflate(-bounds.width/8, -bounds.height/8));
  this.size = size;
  this.vx = 0;
  this.vy = 0;
  this.rot = rnd(100)*0.01;
  this.enemy = false;
  this.mass = size*size;
}

Rock.prototype = Object.create(Actor.prototype);

Rock.prototype.update = function ()
{
  if (this.enemy) {
    var vx, vy;
    if (rnd(2) === 0) {
      var p = this.bounds.center();
      vx = (p.x < this.scene.center.x)? +1 : -1;
      vy = (p.y < this.scene.center.y)? +1 : -1;
    } else {
      vx = rnd(3)-1;
      vy = rnd(3)-1;
    }
    this.vx = clamp(-4, this.vx+vx*Math.random(), +4);
    this.vy = clamp(-4, this.vy+vy*Math.random(), +4);
  }
  this.move(this.vx, this.vy);
  this.rot += rnd(100)*0.01-0.5;
};

Rock.prototype.render = function (ctx, x, y)
{
  var sprites = this.scene.app.sprites;
  var tw = 52;
  var th = sprites.height;
  var w = this.bounds.width;
  var h = this.bounds.height;
  ctx.save();
  ctx.translate(x+this.bounds.x+w/2, y+this.bounds.y+h/2);
  ctx.rotate(this.rot);
  ctx.drawImage(sprites, 0, 0, tw, th, -w/2, -h/2, w, h);
  ctx.restore();
};


//  Level1
// 
function Level1(app)
{
  GameScene.call(this, app);
  
  this.window = new Rectangle(0, 0, app.screen.width, app.screen.height);
  this.center = this.window.center();
  //this.music = app.audios.music;
}

Level1.prototype = Object.create(GameScene.prototype);
  
Level1.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]
  var window = this.window;

  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.window.width, this.window.height);

  ctx.fillStyle = 'yellow';
  ctx.fillRect(0, this.window.height/4, this.window.width, this.window.height/2);

  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds === null) {
      obj.render(ctx, bx, by);
    } else {
      var bounds = obj.bounds;
      if (bounds.overlap(window)) {
	obj.render(ctx, bx-window.x, by-window.y);
      }
    }
  }

  if (this.player.alive) {
    var x = this.player.bounds.right();
    var y = this.player.bounds.y;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+30, y-30);
    ctx.stroke();
    this.app.renderString(this.app.images.font_w, 'YOU', 1,
			  x+30, y-40, 'center');
  }
};

Level1.prototype.update = function ()
{
  GameScene.prototype.update.call(this);

  var C = 0.2;
  var collide = false;
  for (var j = 0; j < this.colliders.length; j++) {
    var obj0 = this.colliders[j];
    if (obj0.alive && obj0.scene === this && obj0.hitbox !== null) {
      for (var i = 0; i < j; i++) {
	var obj1 = this.colliders[i];
	if (obj1.alive && obj1.scene === this && obj1.hitbox !== null &&
	    obj1 !== obj0 && obj1.hitbox.overlap(obj0.hitbox)) {
	  var vx0 = obj0.vx;
	  var vy0 = obj0.vy;
	  obj0.vx -= obj1.vx*obj1.mass/obj0.mass*C;
	  obj0.vy -= obj1.vy*obj1.mass/obj0.mass*C;
	  obj1.vx -= vx0*obj0.mass/obj1.mass*C;
	  obj1.vy -= vy0*obj0.mass/obj1.mass*C;
	  if (obj0 === this.player ||
	      obj1 === this.player) {
	    collide = true;
	  }
	}
      }
    }
    if (!obj0.hitbox.overlap(this.bounds)) {
      if (obj0.alive) {
	obj0.alive = false;
	playSound(this.app.audios.thrown);
      }
    }
  }
  if (collide) {
    playSound(this.app.audios.collide);
  }

  if (!this.player.alive) {
    this.change();
  }
};

Level1.prototype.init = function ()
{
  GameScene.prototype.init.call(this);
  
  // [OVERRIDE]
  // [GAME SPECIFIC CODE]
  
  var app = this.app;
  var scene = this;
  
  var x = this.center.x+rnd(this.window.height)-int(this.window.height/2);
  var y = this.center.y+rnd(int(this.window.height/2))-int(this.window.height/4);
  var size = rnd(8, int(this.window.height/8));
  this.player = new Rock(new Rectangle(x-size,y-size,size*2,size*2), size);
  this.addObject(this.player);

  this.bounds = new Rectangle(0, this.window.height/4, this.window.width, this.window.height/2);

  for (var i = 0; i < 10; i++) {
    x = this.center.x+rnd(this.window.height)-int(this.window.height/2);
    y = this.center.y+rnd(int(this.window.height/2))-int(this.window.height/4);
    size = rnd(8, int(this.window.height/8));
    var rock = new Rock(new Rectangle(x-size,y-size,size*2,size*2), size);
    rock.enemy = true;
    this.addObject(rock);
  }
  
  // show a banner.
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+app.framerate*4);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, app.framerate/2)) {
      app.renderString(app.images.font_w, 'KICK OUT ALL TEH ROCKS!', 1,
		       x+scene.window.width/2, y+20, 'center');
    }
  };
  this.addObject(banner);
};

Level1.prototype.move = function (vx, vy)
{
  // [GAME SPECIFIC CODE]
  this.player.vx += vx*Math.random();
  this.player.vy += vy*Math.random();
  this.player.vx *= 0.9;
  this.player.vy *= 0.9;
};

Level1.prototype.change = function (state)
{
  // [GAME SPECIFIC CODE]
  this.changeScene(new GameOver(this.app));
};
