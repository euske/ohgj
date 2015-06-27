// title.js

function Title(game, won)
{
  Scene.call(this, game);
  this.e = null;
  this.i = 0;
  this.won = won;
}

Title.prototype = Object.create(Scene.prototype);

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
  this.e = e;
};

Title.prototype.update = function ()
{
  if (this.won) {
    this.e.style.background = COLORS[Math.floor(this.i/4) % COLORS.length];
    this.i++;
  }
};

Title.prototype.action = function (action)
{
  if (action) {
    this.changed.signal();
  }
};
