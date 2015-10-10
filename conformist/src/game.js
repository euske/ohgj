// game.js

// Player
function Player(path)
{
  Actor.call(this, null, null, 0);
  this.path = path;
  this.goal = new Slot();
  this.bomb = new Slot();
  this.reset();
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.reset = function ()
{
  this.index = 0;
  this.p = this.path[this.index];
  this.bounds = new Rectangle(this.p.x*8, this.p.y*8, 8, 8);
  this.hitbox = this.bounds;
};

Player.prototype.move = function (vx, vy)
{
  var x = clamp(0, this.p.x+vx, this.scene.maprect.width-1);
  var y = clamp(0, this.p.y+vy, this.scene.maprect.height-1);
  this.bounds = new Rectangle(x*8, y*8, 8, 8);
  this.hitbox = this.bounds;
  this.index++;
  if (this.path.length <= this.index) {
    this.goal.signal();
    log("goal");
  } else {
    this.p = this.path[this.index];
    if (this.p.x != x || this.p.y != y) {
      this.bomb.signal();
      log("bomb");
    } else {
      playSound(this.scene.app.audios.beep);
    }
  }
};

function Animal(p)
{
  var bounds = new Rectangle(p.x*8, p.y*8, 8, 8);
  Actor.call(this, bounds, bounds, rnd(1, 4));
}

Animal.prototype = Object.create(Actor.prototype);

Animal.prototype.update = function ()
{
  if (rnd(4) == 0) {
    this.move(rnd(3)-1, rnd(3)-1);
  }
};


//  EndGame
//
function EndGame(app)
{
  TextScene.call(this, app);
  this.text = '<b>You Conformed!</b><p>Press Enter to restart.';
  this.music = app.audios.ending;
}

EndGame.prototype = Object.create(TextScene.prototype);

EndGame.prototype.change = function ()
{
  this.changeScene(new Game(this.app));
};


//  Game
// 
function Game(app)
{
  GameScene.call(this, app);
  
  this.tilesize = 8;
}

Game.prototype = Object.create(GameScene.prototype);
  
Game.prototype.init = function ()
{
  GameScene.prototype.init.call(this);

  this.maprect = new Rectangle(0, 0, 20, 15);
  var map = new Array(this.maprect.height);
  for (var y = 0; y < map.length; y++) {
    var row = new Array(this.maprect.width);
    for (var x = 0; x < row.length; x++) {
      row[x] = 3;
    }
    map[y] = row;
  }
  var tilemap = new TileMap(this.tilesize, map);
  for (var i = 0; i < 50; i++) {
    var r = RandRect(this.maprect);
    var c = rnd(2, 6);
    for (var dy = 0; dy < r.height; dy++) {
      for (var dx = 0; dx < r.width; dx++) {
	tilemap.set(r.x+dx, r.y+dy, c);
      }
    }
  }

  this.path = [];
  var p = new Point(0, 0);
  for (var i = 0; i < 7; i++) {
    var p1 = this.maprect.rndpt();
    if ((i % 2) == 0) {
      while (p.x != p1.x) {
	tilemap.set(p.x, p.y, 1);
	this.path.push(p.copy());
	p.x += (p.x < p1.x)? +1 : -1;
      }
    } else {
      while (p.y != p1.y) {
	tilemap.set(p.x, p.y, 1);
	this.path.push(p.copy());
	p.y += (p.y < p1.y)? +1 : -1;
      }
    }
  }
  tilemap.set(p.x, p.y, 6);
  
  this.tilemap = tilemap;
  var app = this.app;
  this.player = new Player(this.path);
  this.addObject(this.player);

  var scene = this;
  var player = this.player;
  function player_goal(e) {
    scene.changeScene(new EndGame(app));
  }
  function player_bomb(e) {
    playSound(app.audios.explosion);
    player.reset();
  }
  player.goal.subscribe(player_goal);
  player.bomb.subscribe(player_bomb);

  for (var i = 0; i < 20; i++) {
    var animal = new Animal(this.maprect.rndpt());
    this.addObject(animal);
  }
  
  // show a banner.
  var scene = this;
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+app.framerate*3);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, app.framerate/2)) {
      app.renderString(app.images.font_w, 'FOLLOW TEH PATH.', 1,
		       x+app.screen.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);
};

Game.prototype.render = function (ctx, bx, by)
{
  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  var tilemap = this.tilemap;
  tilemap.renderFromBottomLeft(
    ctx, this.app.tiles, function (x,y) { return tilemap.get(x,y); },
    bx, by, 0, 0, tilemap.width, tilemap.height);
  GameScene.prototype.render.call(this, ctx, bx, by);
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);
};

Game.prototype.move = function (vx, vy)
{
  this.player.move(vx, vy);
};
