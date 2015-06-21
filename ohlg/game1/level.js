// level.js

// [GAME SPECIFIC CODE]

//  Level
// 
function Level(game)
{
  Scene.call(this, game);

  this.clocksize = 32;
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

Level.prototype.find = function (x, y)
{
  var a = [];
  for (var i = 0; i < this.sprites.length; i++) {
    var obj1 = this.sprites[i];
    if (obj1.scene === this && obj1.bounds !== null &&
	obj1.bounds.contains(x, y)) {
      a.push(obj1);
    }
  }
  return a;
};

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
  if (this.ticks % this.game.framerate == 0) {
    this.addClock();
  }
};

Level.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]

  // Fill with the background color.
  ctx.fillStyle = 'black';
  ctx.fillRect(bx, by, this.world.width, this.world.height);

  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    obj.render(ctx, bx, by);
  }
};

Level.prototype.init = function ()
{
  // [OVERRIDE]
  // [GAME SPECIFIC CODE]

  this.tasks = [];
  this.sprites = [];
  this.colliders = [];
  this.ticks = 0;

  this.score_node = this.game.addElement(new Rectangle(10, 10, 100, 20));
  this.score_node.align = 'left';
  this.score_node.style.color = 'white';
  this.score = 0;
  this.updateScore(0);

  // show a banner.
  var scene = this;
  var game = this.game;
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+game.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, game.framerate/2)) {
      game.renderString(game.images.font_w, 'CLICK THE MATCHING CLOCKS!', 1,
			x+scene.world.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);

  // clocks
  var bounds = new Rectangle((this.world.width-this.clocksize)/2, 
			     this.clocksize/2+1,
			     this.clocksize, this.clocksize);
  this.master = new Clock(bounds, 0.4);
  this.master.color = 'red';
  this.master.master = true;
  this.master.offset = this.ticks;
  this.addObject(this.master);
  
  for (var i = 0; i < 5; i++) {
    this.addClock();
  }
};

Level.prototype.addClock = function ()
{
  var x = rnd(this.world.width-this.clocksize);
  var y = rnd(this.clocksize, this.world.height-this.clocksize);
  var bounds = new Rectangle(x, y, this.clocksize, this.clocksize);
  var clock = new Clock(bounds, Math.random()*0.4+0.1);
  clock.offset = this.ticks+rnd(100);
  clock.follow = (rnd(4) == 0);
  if (clock.follow) {
    clock.speed = this.master.speed;
    clock.offset = this.master.offset;
  }
  this.addObject(clock);
};

Level.prototype.updateScore = function (d)
{
  // [GAME SPECIFIC CODE]
  this.score += d;
  if (0 < d) {
    playSound(this.game.audios.good);
  } else if (d < 0) {
    playSound(this.game.audios.bad);
  }
  this.score_node.innerHTML = ('Score: '+this.score);
};

Level.prototype.mousemove = function (x, y)
{
  for (var i = 0; i < this.sprites.length; i++) {
    var obj1 = this.sprites[i];
    if (obj1.scene === this && obj1.bounds !== null) {
      obj1.highlight = obj1.bounds.contains(x, y);
    }
  }
};

Level.prototype.mousedown = function (x, y, b)
{
  var a = this.find(x, y);
  for (var i = 0; i < a.length; i++) {
    var obj1 = a[i];
    obj1.click();
  }
};
