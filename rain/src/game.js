// game.js

// Drop
function Drop(frame)
{
  Sprite.call(this, null);
  this.frame = frame;
}

Drop.prototype = Object.create(Sprite.prototype);

Drop.prototype.render = function (ctx, bx, by)
{
  var rect = MakeRect(this.frame.rndpt(), rnd(1,2), rnd(5,20));
  ctx.fillStyle = 'white'
  ctx.fillRect(bx+rect.x, by+rect.y, rect.width, rect.height);
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
  var frame = new Rectangle(0, 0, app.screen.width, app.screen.height)
  var textbox = new TextBox(frame);
  textbox.putText(app.font, ['NOVEMBER 14, 2015'], 'center', 'center');
  this.addObject(textbox);
  this.music = app.audios.rain;

  for (var i = 0; i < 100; i++) {
    this.addObject(new Drop(frame));
  }
};

Game.prototype.render = function (ctx, bx, by)
{
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  GameScene.prototype.render.call(this, ctx, bx, by);
};
