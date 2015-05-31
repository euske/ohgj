// title.js

function Title(game)
{
  this.game = game;
  this.changed = new Slot(this);
}

Title.prototype.init = function (text)
{
  var frame = this.game.frame;
  var e = this.game.addElement(
    new Rectangle(frame.width/8, frame.height/4,
		  3*frame.width/4, frame.height/2));
  e.align = 'left';
  e.style.padding = '10px';
  e.style.color = 'black';
  e.style.background = 'white';
  e.style.border = 'solid black 2px';
  e.innerHTML = text;
};

Title.prototype.update = function ()
{
};

Title.prototype.render = function (ctx, bx, by)
{
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.game.screen.width, this.game.screen.height);
};

Title.prototype.move = function (vx, vy)
{
};

Title.prototype.action = function (action)
{
  if (action) {
    this.changed.signal();
  }
};



function Ending(game)
{
  this.game = game;
  this.changed = new Slot(this);
}

Ending.prototype.init = function (foods)
{
  this.foods = foods;
};

Ending.prototype.update = function ()
{
};

Ending.prototype.render = function (ctx, bx, by)
{
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.game.screen.width, this.game.screen.height);
  var width = this.game.screen.width;
  var height = this.game.screen.height;
  var sprites = this.game.sprites;
  var tw = sprites.height;
  var scale = 12;
  
  this.foods = {3:1, 4:1, 5:1, 6:1, 7:1};
  for (var k in this.foods) {
    var n = this.foods[k];
    for (var i = 0; i < n; i++) {
      ctx.drawImage(sprites, k*tw, 0, tw, tw,
		    bx+(width-tw*scale)/2+rnd(tw),
		    by+(height-tw*scale)/2+rnd(tw),
		    tw*scale, tw*scale);
    }
  }
  this.game.renderString(this.game.images.font_w, 'FINISHED!!1', 1,
			 bx+width/2, by+10, 'center');
};

Ending.prototype.move = function (vx, vy)
{
};

Ending.prototype.action = function (action)
{
  if (action) {
    this.changed.signal();
  }
};
