// game.js

// Player
function Player(bounds)
{
  Actor.call(this, bounds, bounds, 0);
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.render = function (ctx, bx, by)
{
  var sprites = this.scene.app.sprites;
  var w = this.bounds.width;
  var h = this.bounds.height;
  var tw = sprites.height;
  ctx.drawImage(sprites,
		this.tileno*tw, 0, tw, tw,
		bx+this.bounds.x, by+this.bounds.y, w, h);
};


//  Game
// 
function Game(app)
{
  GameScene.call(this, app);
}

Game.prototype = Object.create(GameScene.prototype);
  
Game.prototype.init = function ()
{
  GameScene.prototype.init.call(this);

  var app = this.app;
  this.player = new Player(MakeRect(new Vec2(app.screen.width/2, 80), 160, 160));
  this.addObject(this.player);

  var frame = new Rectangle(8, app.screen.height-80, app.screen.width-16, 64)
  this.frame = frame.inflate(8, 8);
  this.textbox = new TextBoxTT(frame, 2);
  this.addObject(this.textbox);

  this.music = app.audios.music;
};

Game.prototype.render = function (ctx, bx, by)
{
  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.strokeRect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
  ctx.stroke();
  GameScene.prototype.render.call(this, ctx, bx, by);
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);
  if (rnd(20) == 0) {
    this.player.tileno = rnd(2);
  }

  if (this.textbox.isBusy()) {
    if (this.textbox.queue[0] instanceof TextTask &&
	blink(this.ticks, 6)) {
      playSound(this.app.audios.beep);
    }
  } else {
    var text;
    switch (rnd(6)) {
    case 0:
      text = "I AM AN ORPHAN. "
      break;
    case 1:
      text = "MY PARENTS LEFT ME. "
      break;
    case 2:
      text = "I AM BORED. "
      break;
    case 3:
      text = "I AM TIRED. "
      break;
    case 4:
      text = "I AM SAD. "
      break;
    default:
      text = "...\n";
      break;
    }
    this.textbox.addTask(this.app.font, text);
    this.textbox.addPause(rnd(50)+10);
  }
};
