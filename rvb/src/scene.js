// scene.js
// Scene object takes care of every in-game object and the scrollable map.

function Scene(game)
{
  this.game = game;
  this.changed = new Slot(this);
}

Scene.prototype.init = function ()
{
};

Scene.prototype.update = function ()
{
};

Scene.prototype.render = function (ctx, bx, by)
{
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.game.screen.width, this.game.screen.height);
};

Scene.prototype.move = function (vx, vy)
{
};

Scene.prototype.action = function (action)
{
};


//  Level
// 
function Level(game)
{
  Scene.call(this, game);
  
  this.tilesize = 16;
  this.window = new Rectangle(0, 0, game.screen.width, game.screen.height);
  this.world = new Rectangle(0, 0, game.screen.width, game.screen.height);

  this.tasks = [];
  this.sprites = [];
  this.colliders = [];
  this.ticks = 0;
}

Level.prototype = Object.create(Scene.prototype);
  
Level.prototype.addObject = function (obj)
{
  if (obj.update !== undefined) {
    this.tasks.push(obj);
  }
  if (obj.render !== undefined) {
    this.sprites.push(obj);
  }
  if (obj.hitbox !== undefined) {
    this.colliders.push(obj);
  }
};

Level.prototype.removeObject = function (obj)
{
  if (obj.update !== undefined) {
    removeArray(this.tasks, obj);
  }
  if (obj.render !== undefined) {
    removeArray(this.sprites, obj);
  }
  if (obj.hitbox !== undefined) {
    removeArray(this.colliders, obj);
  }
};

Level.prototype.setCenter = function (rect)
{
  if (this.window.width < rect.width) {
    this.window.x = (rect.width-this.window.width)/2;
  } else if (rect.x < this.window.x) {
    this.window.x = rect.x;
  } else if (this.window.x+this.window.width < rect.x+rect.width) {
    this.window.x = rect.x+rect.width - this.window.width;
  }
  if (this.window.height < rect.height) {
    this.window.y = (rect.height-this.window.height)/2;
  } else if (rect.y < this.window.y) {
    this.window.y = rect.y;
  } else if (this.window.y+this.window.height < rect.y+rect.height) {
    this.window.y = rect.y+rect.height - this.window.height;
  }
  this.window.x = clamp(0, this.window.x, this.world.width-this.window.width);
  this.window.y = clamp(0, this.window.y, this.world.height-this.window.height);
};

Level.prototype.updateObjects = function (objs)
{
  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    if (obj.scene === null) {
      obj.start(this);
    }
    obj.update();
  }
}

Level.prototype.cleanObjects = function (objs)
{
  function f(obj) { return !obj.alive; }
  removeArray(objs, f);
}

Level.prototype.collide = function (obj0)
{
  var a = [];
  if (obj0.alive && obj0.scene === this && obj0.hitbox !== null) {
    for (var i = 0; i < this.colliders.length; i++) {
      var obj1 = this.colliders[i];
      if (obj1.alive && obj1.scene === this && obj1.hitbox !== null &&
	  obj1 !== obj0 && obj1.hitbox.overlap(obj0.hitbox)) {
	a.push(obj1);
      }
    }
  }
  return a;
};

Level.prototype.update = function ()
{
  // [OVERRIDE]
  this.updateObjects(this.tasks);
  this.cleanObjects(this.tasks);
  this.cleanObjects(this.sprites);
  this.cleanObjects(this.colliders);
  this.ticks++;
  var timeleft = 30-Math.floor(this.ticks/this.game.framerate);
  this.time_node.innerHTML = ("TIME: <b>"+timeleft+"</b>s");
  if (timeleft <= 0) {
    this.judge();
  }
};

Level.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]

  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.window.width, this.window.height);

  var tilesize = this.tilesize;
  var window = this.window;
  var tilemap = this.tilemap;
  var x0 = Math.floor(window.x/tilesize);
  var y0 = Math.floor(window.y/tilesize);
  var x1 = Math.ceil((window.x+window.width)/tilesize);
  var y1 = Math.ceil((window.y+window.height)/tilesize);
  var fx = x0*tilesize-window.x;
  var fy = y0*tilesize-window.y;

  // Set the drawing order.
  var objs = [];
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds === null) continue;
    var bounds = obj.bounds;
    if (bounds.overlap(window)) {
      var x = Math.floor((bounds.x+bounds.width/2)/tilesize);
      var y = Math.floor((bounds.y+bounds.height/2)/tilesize);
      var k = x+','+y;
      if (!objs.hasOwnProperty(k)) {
	objs[k] = [];
      }
      objs[k].push(obj);
    }
  }

  // Draw the tilemap.
  tilemap.render(ctx, function (x,y) { return tilemap.get(x,y); },
		 bx+fx, by+fy,
		 x0, y0, x1-x0+1, y1-y0+1);

  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene != this) continue;
    if (obj.bounds === null) {
      obj.render(ctx, bx, by);
    } else {
      var b = obj.bounds;
      obj.render(ctx, bx+b.x-window.x, by+b.y-window.y);
    }
  }
};

Level.prototype.init = function ()
{
  // [OVERRIDE]
  // [GAME SPECIFIC CODE]
  var map = [];
  this.left = 0;
  this.red = 0;
  this.blue = 0;
  for (var y = 0; y < 15; y++) {
    var a = [];
    for (var x = 0; x < 20; x++) {
      var c = (rnd(8) == 0)? T.WALL : 0;
      a.push(c);
      if (c == 0) this.left++;
    }
    map.push(a);
  }
  this.tilemap = new TileMap(this.tilesize, map);
  this.world.width = this.tilemap.width * this.tilesize;
  this.world.height = this.tilemap.height * this.tilesize;
  this.window.width = Math.min(this.world.width, this.window.width);
  this.window.height = Math.min(this.world.height, this.window.height);
  this.tasks = [];
  this.sprites = [];
  this.colliders = [];
  this.ticks = 0;

  this.player = new Player(this.tilemap.map2coord(new Rectangle(0, 0, 1, 1)));
  this.addObject(this.player);
  this.enemy = new Enemy(this.tilemap.map2coord(new Rectangle(19, 14, 1, 1)));
  this.addObject(this.enemy);
  
  this.score_node = this.game.addElement(new Rectangle(1, 1, 400, 20));
  this.score_node.align = 'left';
  this.score_node.style.color = 'white';
  this.time_node = this.game.addElement(new Rectangle(500, 1, 100, 20));
  this.time_node.align = 'right';
  this.time_node.style.color = 'rgb(128,255,128)';
  
  var game = this.game;
  var scene = this;
  var tilemap = this.tilemap;
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+game.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, game.framerate/2)) {
      game.renderString(game.images.font_w, 'PAINT ALL TEH DAMN TILES!', 1,
			x+scene.window.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);
};

Level.prototype.move = function (vx, vy)
{
  // [GAME SPECIFIC CODE]
  this.player.move(vx, vy);
  var rect = this.player.bounds.inset(-this.window.width/2, -this.window.height/2);
  this.setCenter(rect);
};

Level.prototype.action = function (action)
{
};

Level.prototype.judge = function ()
{
  if (this.blue < this.red) {
    this.changed.signal('RED');
  } else if (this.red < this.blue) {
    this.changed.signal('BLUE');
  } else {
    this.changed.signal('DRAW');
  }      
}

Level.prototype.paint = function (p, t)
{
  var scene = this;
  var tilemap = scene.tilemap;
  var r = tilemap.coord2map(p);
  function f(x,y) {
    var c = tilemap.get(x, y);
    if (c == 0) {
      scene.left--;
    } else if (c == T.RED) {
      scene.red--;
    } else if (c == T.BLUE) {
      scene.blue--;
    }
    if (t == T.RED) {
      scene.red++;
    } else if (t == T.BLUE) {
      scene.blue++;
    }
    tilemap.set(x, y, t);
  }
  tilemap.apply(r, f);

  this.score_node.innerHTML = ("RED: <span class=red>"+this.red+"</span>, "+
			       "BLUE: <span class=blue>"+this.blue+"</span>, "+
			       "LEFT: <b>"+this.left+"</b>");
  if (this.left == 0) {
    this.judge();
  }
};
