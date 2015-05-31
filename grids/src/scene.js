// scene.js
// Scene object takes care of every in-game object and the scrollable map.

// Enemy
function Enemy(bounds)
{
  this.init();
  this.sprite = Sprite.ENEMY;
  this.bounds = bounds;
  this.hitbox = bounds.inset(4, 4);
  this.speed = 2;
  
  this._count = 0;
  this._vx = 0;
  this._vy = 0;
}

Enemy.prototype.init = Actor.prototype.init;

Enemy.prototype.start = Actor.prototype.start;

Enemy.prototype.idle = function ()
{
  if (this.scene == null) return;
  if (this._count == 0) {
    this._vx = rnd(3)-1;
    this._vy = rnd(3)-1;
    this._count = rnd(15)+15;
  }
  this.move(this._vx, this._vy);
  this._count--;
};

Enemy.prototype.render = Actor.prototype.render;

Enemy.prototype.move = function (vx, vy)
{
  if (this.scene == null) return;
  var tilemap = this.scene.tilemap;
  var f = (function (x,y) { return Tile.isObstacle(tilemap.get(x,y)); });
  var v = tilemap.getMove(this.hitbox, new Point(vx*this.speed, vy*this.speed), f);
  this.hitbox = this.hitbox.move(v.x, v.y);
  this.bounds = this.bounds.move(v.x, v.y);
};


function Scene(game)
{
  this.tilesize = 16;
  this.game = game;
  this.window = new Rectangle(0, 0, game.screen.width, game.screen.height);
  this.world = new Rectangle(0, 0, game.screen.width, game.screen.height);

  this.changed = new Slot(this);
}

Scene.prototype.addTask = function (task)
{
  this.tasks.push(task);
};

Scene.prototype.removeTask = function (task)
{
  removeArray(this.tasks, task);
};

Scene.prototype.addActor = function (actor)
{
  this.actors.push(actor);
  this.actors.sort(function (a,b) { return (b.layer-a.layer); });
};

Scene.prototype.removeActor = function (actor)
{
  removeArray(this.actors, actor);
};

Scene.prototype.addParticle = function (particle)
{
  this.particles.push(particle);
};

Scene.prototype.removeParticle = function (particle)
{
  removeArray(this.particles, particle);
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

Scene.prototype.collide = function (actor0)
{
  var a = [];
  if (actor0.alive && actor0.scene == this && actor0.hitbox != null) {
    for (var i = 0; i < this.actors.length; i++) {
      var actor1 = this.actors[i];
      if (actor1.alive && actor1.scene == this && actor1.hitbox != null &&
	  actor1 !== actor0 && actor1.hitbox.overlap(actor0.hitbox)) {
	a.push(actor1);
      }
    }
  }
  return a;
};

Scene.prototype.moveObjects = function (objs)
{
  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    if (obj.scene == null) {
      obj.start(this);
    }
    obj.idle();
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

Scene.prototype.idle = function ()
{
  // [OVERRIDE]
  this.moveObjects(this.tasks);
  this.moveObjects(this.actors);
  this.moveObjects(this.particles);
  this.cleanObjects(this.tasks);
  this.cleanObjects(this.actors);
  this.cleanObjects(this.particles);
  this.ticks++;
};

Scene.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]

  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,128)';
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
  var actors = [];
  for (var i = 0; i < this.actors.length; i++) {
    var actor = this.actors[i];
    var bounds = actor.bounds;
    if (actor.scene == this && bounds.overlap(window)) {
      var x = Math.floor((bounds.x+bounds.width/2)/tilesize);
      var y = Math.floor((bounds.y+bounds.height/2)/tilesize);
      var k = x+","+y;
      if (!actors.hasOwnProperty(k)) {
	actors[k] = [];
      }
      actors[k].push(actor);
    }
  }

  // Draw the tilemap.
  var ft = function (x,y) {
    var k = x+","+y;
    if (actors.hasOwnProperty(k)) {
      var r = actors[k];
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

  // Draw the particles.
  for (var i = 0; i < this.particles.length; i++) {
    var particle = this.particles[i];
    if (particle.scene != this) continue;
    particle.render(ctx,
		    bx-window.x+particle.bounds.x,
		    by-window.y+particle.bounds.y);
  }

};

Scene.prototype.init = function ()
{
  // [OVERRIDE]
  // [GAME SPECIFIC CODE]
  var ngrids = 5;
  var gridSize = 4;
  var mapSize = gridSize*ngrids+1;
  var start = new Point(0, 0);
  var map = [];
  for (var y = 0; y < mapSize; y++) {
    var a = new Array();
    if ((y % gridSize) == 0) {
      for (var x = 0; x < mapSize; x++) { a[x] = Tile.BLOCK; }
    } else {
      for (var x = 0; x < mapSize; x++) {
	a[x] = ((x % gridSize) == 0)? Tile.BLOCK : Tile.NONE;
      }
    }
    map[y] = a;
  }
  for (var i = 0; i < ngrids; i++) {
    for (var j = 0; j < ngrids; j++) {
      var x = i*gridSize;
      var y = j*gridSize;
      if (0 < i) {
	map[y+rnd(1,gridSize)][x] = Tile.NONE;
      }
      if (0 < j) {
	map[y][x+rnd(1,gridSize)] = Tile.NONE;
      }

      if (i == start.x && j == start.y) continue;
      // add ice cream.
      map[y+rnd(1,gridSize)][x+rnd(1,gridSize)] = Tile.COLLECTIBLE;
      // add enemy.
      while (true) {
	var x1 = x+rnd(1,gridSize);
	var y1 = y+rnd(1,gridSize);
	if (map[y1][x1] == Tile.NONE) {
	  map[y1][x1] = Tile.ENEMY;
	  break;
	}
      }
    }
  }
  
  this.tilemap = new TileMap(this.tilesize, map);
  this.world.width = this.tilemap.width * this.tilesize;
  this.world.height = this.tilemap.height * this.tilesize;
  this.window.width = Math.min(this.world.width, this.window.width);
  this.window.height = Math.min(this.world.height, this.window.height);
  this.tasks = [];
  this.actors = [];
  this.particles = [];
  this.ticks = 0;

  this.collectibles = 0;
  var game = this.game;
  var scene = this;
  var tilemap = this.tilemap;
  var f = function (x,y) {
    var c = tilemap.get(x,y);
    if (Tile.isCollectible(c)) {
      var rect = tilemap.map2coord(new Point(x,y));
      scene.addActor(new Actor(rect, Sprite.COLLECTIBLE));
      scene.collectibles++;
      tilemap.set(x, y, Tile.NONE);
    } else if (Tile.isEnemy(c)) {
      var rect = tilemap.map2coord(new Point(x,y));
      scene.addActor(new Enemy(rect));
      tilemap.set(x, y, Tile.NONE);
    }
  };
  this.tilemap.apply(null, f);

  var rect = new Rectangle(start.x*gridSize+gridSize/2, start.y*gridSize+gridSize/2, 1, 1);
  this.player = new Player(this.tilemap.map2coord(rect));
  this.addActor(this.player);

  this.game.updateLeft(this.collectibles);
  this.game.updateHealth(this.player.health);
  
  var player = this.player;
  function player_jumped(e) {
    game.audios.jump.currentTime = 0;
    game.audios.jump.play();
  }
  function player_picked(e) {
    game.audios.pick.currentTime = 0;
    game.audios.pick.play();
    // count the score.
    scene.collectibles--;
    game.updateLeft(scene.collectibles);
    if (scene.collectibles == 0) {
      scene.changed.signal('WON');
    }
  }
  function player_hurt(e) {
    game.audios.hurt.currentTime = 0;
    game.audios.hurt.play();
    player.health--;
    player.invuln = game.framerate*2;
    game.updateHealth(player.health);
    if (player.health == 0) {
      scene.changed.signal('DIED');
    }
  }
  this.player.hurt.subscribe(player_hurt);
  this.player.picked.subscribe(player_picked);
  this.player.jumped.subscribe(player_jumped);
};

Scene.prototype.move = function(vx, vy)
{
  // [GAME SPECIFIC CODE]
  this.player.move(vx, vy);
  var rect = this.player.bounds.inset(-this.window.width/2, -this.window.height/2);
  this.setCenter(rect);
};

Scene.prototype.action = function()
{
  // [GAME SPECIFIC CODE]
  this.player.jump();
};
