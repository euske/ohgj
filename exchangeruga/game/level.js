// level.js

// [GAME SPECIFIC CODE]

//  Level1
// 
function Level1(game)
{
  Scene.call(this, game);
  
  this.tilesize = 16;
  this.window = new Rectangle(0, 0, this.game.screen.width, this.game.screen.height);
  //this.music = game.audios.music;
}

Level1.prototype = Object.create(Level.prototype);
  
Level1.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]
  var tilesize = this.tilesize;
  var window = this.window;
  by += (this.game.screen.height-this.window.height)/2;

  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.window.width, this.window.height);

  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds === null) {
      obj.render(ctx, bx, by);
    } else {
      var bounds = obj.bounds;
      if (bounds.overlap(window)) {
	obj.render(ctx, bx+bounds.x-window.x, by+bounds.y-window.y);
      }
    }
  }
};

Level1.prototype.update = function ()
{
  Level.prototype.update.call(this);
  for (var x = 0; x < this.speed.x/2; x++) {
    if (rnd(10) == 0) {
      var y = rnd(this.window.height-this.tilesize);
      var rect = new Rectangle(this.window.width, y, this.tilesize, this.tilesize);
      this.addObject(new Money(rect, rnd(this.speed.x/2+1),
			       (rnd(2) == 0)? S.MONEY1 : S.MONEY2));
    }
  }

  this.usd_rate += (rnd(this.speed.x*2+1)-this.speed.x);
  this.usd_rate = Math.max(1, Math.min(1000, this.usd_rate));
  this.updateRate();
  
  if (this.usd < 0 || this.jpy < 0) {
    this.changed.signal('LOST', this.jpy, this.usd, this.usd_rate);
  }
};

Level1.prototype.init = function ()
{
  Level.prototype.init.call(this);
  
  // [OVERRIDE]
  // [GAME SPECIFIC CODE]

  this.speed = new Vec2(2, 0);
  
  var game = this.game;
  var scene = this;

  this.player = new Player(new Rectangle(this.tilesize, (this.window.height-this.tilesize)/2,
					 this.tilesize, this.tilesize));
  this.addObject(this.player);
  
  function player_picked(e, a) {
    playSound(game.audios.pick);
    // show a particle.
    var particle = new FixedSprite(a.bounds, scene.game.framerate, S.YAY);
    scene.addObject(particle);
    switch (a.tileno) {
    case S.MONEY1:
      scene.usd++;
      scene.jpy -= scene.usd_rate;
      break;
    case S.MONEY2:
      scene.jpy += 100;
      scene.usd -= 100/scene.usd_rate;
      break;      
    }
    scene.updateRate();
    scene.speed.x++;
  }
  this.player.picked.subscribe(player_picked);

  this.jpy_node = game.addElement(new Rectangle(10, 10, 150, 32));
  this.jpy_node.align = 'left';
  this.jpy_node.style.color = 'red';
  this.jpy_node.style['font-size'] = '150%';
  this.jpy_node.style['font-weight'] = 'bold';
  this.jpy = 1000;
  this.usd_node = game.addElement(new Rectangle(240, 10, 150, 32));
  this.usd_node.align = 'left';
  this.usd_node.style.color = 'blue';
  this.usd_node.style['font-size'] = '150%';
  this.usd_node.style['font-weight'] = 'bold';
  this.usd = 10;
  this.jpyrate_node = game.addElement(new Rectangle(10, 35, 260, 32));
  this.jpyrate_node.align = 'left';
  this.jpyrate_node.style.color = 'white';
  this.jpyrate_node.style['font-size'] = '150%';
  this.jpyrate_node.style['font-weight'] = 'bold';
  this.usdrate_node = game.addElement(new Rectangle(240, 35, 260, 32));
  this.usdrate_node.align = 'left';
  this.usdrate_node.style.color = 'white';
  this.usdrate_node.style['font-size'] = '150%';
  this.usdrate_node.style['font-weight'] = 'bold';
  
  this.usd_rate = 100;
  this.updateRate();
  
  // show a banner.
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+game.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, game.framerate/2)) {
      game.renderString(game.images.font_w, "KEEP BOTH CURRENCIES!", 1,
			x+scene.window.width/2, y+scene.window.height/2, 'center');
    }
  };
  this.addObject(banner);
};

Level1.prototype.move = function (vx, vy)
{
  // [GAME SPECIFIC CODE]
  this.player.usermove(vx, vy);
};

Level1.prototype.action = function (action)
{
  // [GAME SPECIFIC CODE]
};

Level1.prototype.updateRate = function ()
{
  // [GAME SPECIFIC CODE]
  this.jpy_node.innerHTML = ('JPY: '+this.jpy);
  this.usd_node.innerHTML = ('USD: '+Math.floor(this.usd*100)/100);
  this.jpyrate_node.innerHTML = ('100JPY='+Math.floor(10000/this.usd_rate)/100+'USD');
  this.usdrate_node.innerHTML = ('1USD='+this.usd_rate+'JPY');
};
