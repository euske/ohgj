// game.js

// [GAME SPECIFIC CODE]

function Button()
{
  var bounds = new Rectangle(0, 0, 32, 32);
  Actor.call(this, bounds, bounds.inflate(-4,-4));
  this.pressed = false;
}

Button.prototype = Object.create(Sprite.prototype);

Button.prototype.render = function (ctx, bx, by)
{
  var w = this.bounds.width;
  var h = this.bounds.height;
  var p = this.bounds.center();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bx+p.x+1, bx+p.y+1, w/2, 0, 2*Math.PI);
  ctx.fill();
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(bx+p.x, bx+p.y, w/2, 0, 2*Math.PI);
  ctx.fill();
  ctx.fillStyle = (this.pressed)? '#cc0000' : '#ff0000';
  ctx.beginPath();
  ctx.arc(bx+p.x, bx+p.y, w/2-2, 0, 2*Math.PI);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = (this.pressed)? '#ffffff' : '#cc0000';
  ctx.beginPath();
  ctx.arc(bx+p.x, bx+p.y, w/2-2, 0.1*Math.PI, 0.5*Math.PI);
  ctx.stroke();
  ctx.strokeStyle = (this.pressed)? '#880000' : '#ffffff';
  ctx.beginPath();
  ctx.arc(bx+p.x, bx+p.y, w/2-2, 0.8*Math.PI, 1.7*Math.PI);
  ctx.stroke();
};

Button.prototype.setpos = function (p)
{
  this.bounds.x = p.x-this.bounds.width/2;
  this.bounds.y = p.y-this.bounds.height/2;
  this.hitbox.x = p.x-this.hitbox.width/2;
  this.hitbox.y = p.y-this.hitbox.height/2;
}


//  Title
//
function Title(app)
{
  TextScene.call(this, app);
  this.text = '<b>Sample Game 1</b><p>Made with JSCS<p>Press Enter to start.';
}

Title.prototype = Object.create(TextScene.prototype);

Title.prototype.change = function ()
{
  this.changeScene(new Level1(this.app));
};


//  EndGame
//
function EndGame(app, score)
{
  TextScene.call(this, app);
  this.text = '<b>You Won!</b><p><b>Score: '+score+'</b><p>Press Enter to restart.';
  this.music = app.audios.ending;
}

EndGame.prototype = Object.create(TextScene.prototype);

EndGame.prototype.change = function ()
{
  this.changeScene(new Level1(this.app));
};


//  Game
// 
function Game(app)
{
  GameScene.call(this, app);
  
  this.world = new Rectangle(0, 0, app.screen.width, app.screen.height);
  this.music = null;
}

Game.prototype = Object.create(GameScene.prototype);

Game.prototype.init = function ()
{
  GameScene.prototype.init.call(this);

  var app = this.app;
  var scene = this;
  this.duration = app.framerate * 2;
  this.phase = 0;
  this.refreshButtons();
  
  this.score_node = app.addElement(new Rectangle(10, 10, 160, 32));
  this.score_node.align = 'left';
  this.score_node.style.color = 'white';
  this.score_node.style['font-size'] = '150%';
  this.score_node.style['font-weight'] = 'bold';
  this.score = 0;
  this.updateScore();

  // show a banner.
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+app.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, app.framerate/2)) {
      app.renderString(app.images.font_w, 'PRESS ALL TEH BUTTONS!', 1,
		       x+scene.world.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);
};
  
Game.prototype.refreshButtons = function ()
{
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj instanceof Button) {
      obj.alive = false;
    }
  }

  var A1 = 33+this.phase, B1 = 123+this.phase, C1 = 44+this.phase*this.phase;
  var A2 = 77+this.phase, B2 = 456+this.phase, C2 = 99+this.phase*this.phase;
  this.phase = (this.phase+1) % 8;

  var w = this.world.width-40;
  var h = this.world.height-40;
  for (var i = 0; i < 10; i++) {
    var b = new Button();
    var x = ((i*A1+B1)*C1) % w;
    var y = ((i*A2+B2)*C2) % h;
    b.setpos(new Vec2(x+20, y+20));
    this.addObject(b);
  }

  playSound(this.app.audios.beep);
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);

  if ((this.ticks % this.duration) == 0) {
    this.refreshButtons();
  }
};

Game.prototype.render = function (ctx, bx, by)
{
  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,128)';
  ctx.fillRect(bx, by, this.world.width, this.world.height);

  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    obj.render(ctx, bx, by);
  }
};

Game.prototype.mousedown = function (x, y, button)
{
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj instanceof Button) {
      obj.pressed = obj.hitbox.contains(x, y);
      if (obj.pressed) {
	this.score++;
	this.updateScore();
	playSound(this.app.audios.pressed);
      }
    }
  }
};

Scene.prototype.mouseup = function (x, y, button)
{
  var p = new Vec2(x, y);
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj instanceof Button) {
      obj.pressed = false;
    }
  }
};

Game.prototype.updateScore = function ()
{
  // [GAME SPECIFIC CODE]
  this.score_node.innerHTML = ('Score: '+this.score);
  this.duration = Math.max(1, this.app.framerate * 2 - this.score);
};

Game.prototype.change = function (state, score)
{
  // [GAME SPECIFIC CODE]
  this.changeScene(new EndGame(this.app, score));
};
