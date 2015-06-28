// level.js

// [GAME SPECIFIC CODE]

//  Level
// 
function Level(game)
{
  Scene.call(this, game);
  
  this.tilesize = 32;
  this.window = new Rectangle(0, 0, game.screen.width, game.screen.height);

  this.tasks = [];
  this.sprites = [];
  this.colliders = [];
  this.ticks = 0;

  this.z = 0;
  this.speed = 2;
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
  this.z += this.speed;

  if ((this.ticks % 30) == 0) {
    var rect = new Rectangle(this.window.width, rnd(this.window.height-this.tilesize),
			     this.tilesize, this.tilesize);
    var obj = new Thingy(rect);
    this.addObject(obj);
  }
  
  this.score_node.style.color = COLORS[this.ticks % COLORS.length];
};

Level.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]

  // Fill with the background color.
  ctx.fillStyle = '#000000';
  ctx.fillRect(bx, by, this.window.width, this.window.height);

  var tilesize = this.tilesize;
  var window = this.window;
  var x0 = Math.floor(window.x/tilesize);
  var y0 = Math.floor(window.y/tilesize);
  var x1 = Math.ceil((window.x+window.width)/tilesize);
  var y1 = Math.ceil((window.y+window.height)/tilesize);
  var fx = x0*tilesize-window.x;
  var fy = y0*tilesize-window.y;

  // draw course
  var rw = 120;
  for (var i = 0; ; i++) {
    var x = (i*rw-this.z);
    if (this.window.width < x) break;
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fillRect(x, 0, x+rw, this.window.height);
  }
  
  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds === null) {
      obj.render(ctx, bx, by);
    } else {
      obj.render(ctx, bx+obj.bounds.x, by+obj.bounds.y);
    }
  }
};

Level.prototype.match = function (px, w, color)
{
  var rw = 120;
  for (var i = 0; ; i++) {
    var x = (i*rw-this.z);
    if (this.window.width < x) break;
    if (x < px+w && px < x+rw) {
      if (color == (i % COLORS.length)) return true;
    }
  }
  return false;
}

Level.prototype.init = function ()
{
  // [OVERRIDE]
  this.tasks = [];
  this.sprites = [];
  this.colliders = [];
  this.ticks = 0;

  this.z = 0;
  var game = this.game;
  var scene = this;
  var rect = new Rectangle(10, this.window.height/2, this.tilesize, this.tilesize);
  this.player = new Player(rect);
  this.addObject(this.player);
  
  function player_picked(e, d) {
    scene.score += d;
    if (0 < d) {
      playSound(game.audios.pick);
    } else {
      playSound(game.audios.hurt);
    }
    scene.updateScore();
    
    // count the score.
    if (7 <= scene.score) {
      // delay calling.
      scene.addObject(new Task(function (task) {
	if (task.ticks0+game.framerate < scene.ticks) {
	  scene.changed.signal('WON');
	}
      }));
    }
  }
  this.player.picked.subscribe(player_picked);

  this.score_node = game.addElement(new Rectangle(10, 10, 200, 40));
  this.score_node.align = 'left';
  this.score_node.style['font-weight'] = 'bold';
  this.score_node.style['font-size'] = '200%';
  this.score_node.style.color = 'white';
  this.score = 0;
  this.updateScore();

  // show a banner.
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+game.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, game.framerate/2)) {
      game.renderString(game.images.font_w, 'GET THE THINGIES WITH MATCHING COLOR!', 1,
			x+scene.window.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);
};

Level.prototype.move = function (vx, vy)
{
  // [GAME SPECIFIC CODE]
  this.player.move(vx, vy);
};

Level.prototype.action = function (action)
{
  // [GAME SPECIFIC CODE]
};

Level.prototype.updateScore = function ()
{
  // [GAME SPECIFIC CODE]
  this.score_node.innerHTML = ('Score: '+this.score);
};
