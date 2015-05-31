// scene.js
// Scene object takes care of every in-game object and the scrollable map.

function Scene(game)
{
  this.game = game;
  this.changed = new Slot(this);
  
  this.tilesize = 8;
  this.window = new Rectangle(0, 0, game.screen.width, game.screen.height);
  this.world = new Rectangle(0, 0, game.screen.width, game.screen.height);

  this.tasks = [];
  this.sprites = [];
  this.colliders = [];
  this.ticks = 0;
}

Scene.prototype.addTask = function (task)
{
  this.tasks.push(task);
};

Scene.prototype.removeTask = function (task)
{
  removeArray(this.tasks, task);
};

Scene.prototype.addParticle = function (particle)
{
  this.tasks.push(particle);
  this.sprites.push(particle);
};

Scene.prototype.removeParticle = function (particle)
{
  removeArray(this.tasks, particle);
  removeArray(this.sprites, particle);
};

Scene.prototype.addActor = function (actor)
{
  this.tasks.push(actor);
  this.sprites.push(actor);
  this.colliders.push(actor);
};

Scene.prototype.removeActor = function (actor)
{
  removeArray(this.tasks, actor);
  removeArray(this.sprites, actor);
  removeArray(this.colliders, actor);
};

Scene.prototype.setCenter = function (rect)
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

Scene.prototype.collide = function (obj0)
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

Scene.prototype.updateObjects = function (objs)
{
  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    if (obj.scene === null) {
      obj.start(this);
    }
    obj.update();
  }
}

Scene.prototype.cleanObjects = function (objs)
{
  var removed = [];
  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    if (!obj.alive) {
      removed.push(obj);
    }
  }
  removeArray(objs, removed);
}

Scene.prototype.update = function ()
{
  // [OVERRIDE]
  this.updateObjects(this.tasks);
  this.cleanObjects(this.tasks);
  this.cleanObjects(this.sprites);
  this.cleanObjects(this.colliders);
  this.ticks++;
};

Scene.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]

  // Fill with the background color.
  ctx.fillStyle = 'rgb(128,32,128)';
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
  var ft = function (x,y) {
    var k = x+','+y;
    if (objs.hasOwnProperty(k)) {
      var r = objs[k];
      for (var i = 0; i < r.length; i++) {
	var a = r[i];
	var b = a.bounds;
	a.render(ctx, bx+b.x-window.x, by+b.y-window.y);
      }
    }
    var c = tilemap.get(x,y);
    return (c == Tile.NONE? -1 : c);
  };
  tilemap.render(ctx,
		 this.game.tiles, ft, 
		 bx+fx, by+fy,
		 x0, y0, x1-x0+1, y1-y0+1);

  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene != this) continue;
    if (obj.bounds === null) {
      obj.render(ctx, bx, by);
    }
  }
};

Scene.prototype.init = function ()
{
  // [OVERRIDE]
  // [GAME SPECIFIC CODE]
  var map = [];
  for (var y = 0; y < 15; y++) {
    var row = [];
    for (var x = 0; x < 20; x++) {
      var c = 0;
      if (y == 14) {
	c = Tile.BLOCK;
      } else if ((y % 3) == 2 && ((x+y*3) % 6) < 3 && rnd(8) != 0) {
	c = Tile.BLOCK;
      } else if (rnd(8) == 0) {
	c = Tile.BLOCK;
      } else if (rnd(8) == 0) {
	c = Tile.COLLECTIBLE;
      }
      row.push(c);
    }
    map.push(row);
  }
  map[0][19] = Tile.GOAL;
  map[1][19] = Tile.BLOCK;
  //map[13][2] = Tile.GOAL;
  
  this.tilemap = new TileMap(this.tilesize, map);
  this.world.width = this.tilemap.width * this.tilesize;
  this.world.height = this.tilemap.height * this.tilesize;
  this.window.width = Math.min(this.world.width, this.window.width);
  this.window.height = Math.min(this.world.height, this.window.height);
  this.tasks = [];
  this.sprites = [];
  this.colliders = [];
  this.ticks = 0;

  this.collected = {};
  var game = this.game;
  var scene = this;
  var tilemap = this.tilemap;
  var f = function (x,y) {
    if (Tile.isCollectible(tilemap.get(x,y))) {
      var rect = tilemap.map2coord(new Point(x,y));
      scene.addActor(new Actor(rect, rnd(Sprite.FOOD1, Sprite.FOOD5+1)));
      tilemap.set(x, y, Tile.NONE);
    }
  };
  this.tilemap.apply(null, f);

  var rect = new Rectangle(0, 13, 1, 1);
  this.player = new Player(this.tilemap.map2coord(rect));
  this.addActor(this.player);
  
  function player_jumped(e) {
    game.audios.jump.currentTime = 0;
    game.audios.jump.play();
  }
  function player_picked(e, arg) {
    game.audios.pick.currentTime = 0;
    game.audios.pick.play();
    if (scene.collected[arg] === undefined) {
      scene.collected[arg] = 0;
    }
    scene.collected[arg]++;
  }
  function player_goaled(e) {
    game.audios.goal.currentTime = 0;
    game.audios.goal.play();
    scene.changed.signal(scene.collected);
  }
  this.player.picked.subscribe(player_picked);
  this.player.jumped.subscribe(player_jumped);
  this.player.goaled.subscribe(player_goaled);

  var banner = new Particle(null, game.framerate*2);
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, game.framerate/2)) {
      game.renderString(game.images.font_w, 'GET AND GO TO GOAL!', 1,
			x+scene.window.width/2, y+50, 'center');
    }
  };
  this.addParticle(banner);
};

Scene.prototype.move = function (vx, vy)
{
  // [GAME SPECIFIC CODE]
  this.player.move(vx, vy);
  var rect = this.player.bounds.inset(-this.window.width/2, -this.window.height/2);
  this.setCenter(rect);
};

Scene.prototype.action = function (action)
{
  // [GAME SPECIFIC CODE]
  this.player.jump(action);
};
