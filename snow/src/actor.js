// actor.js

// Task: a single procedure that runs at each frame.
function Task()
{
  this.scene = null;
  this.duration = 0;
  this.died = new Slot(this);
}

define(Task, Object, '', {
  start: function (scene) {
    this.scene = scene;
    this.ticks0 = scene.ticks;
  },

  isAlive: function () {
    return (this.scene !== null);
  },
  
  getTime: function () {
    return (this.scene.ticks - this.ticks0);
  },
  
  die: function () {
    this.scene = null;
    this.died.signal();
  },
  
  update: function () {
    // [OVERRIDE]
    if (0 < this.duration &&
	this.ticks0+this.duration < this.scene.ticks) {
      this.die();
    }
  },
  
});


// Queue: a list of Tasks that runs sequentially.
function Queue(tasks)
{
  this._Task();
  this.tasks = tasks;
}

define(Queue, Task, 'Task', {
  update: function () {
    while (0 < this.tasks.length) {
      var task = this.tasks[0];
      if (task.scene === null) {
	task.start(this.scene);
      }
      task.update();
      if (task.scene !== null) return;
      this.tasks.shift();
    }
    this.die();
  },
  
  add: function (task) {
    this.tasks.push(task);
  },
  
  remove: function (task) {
    removeArray(this.tasks, task);
  },
  
});


// Sprite: a moving object that doesn't interact.
function Sprite(bounds)
{
  this._Task();
  this.visible = true;
  this.zorder = 0;
  this.bounds = (bounds === null)? bounds : bounds.copy();
}

define(Sprite, Task, 'Task', {
  toString: function () {
    return '<Sprite: '+this.bounds+'>';
  },
  
  update: function () {
    // [OVERRIDE]
    this._Task_update();
  },
  
  render: function (ctx, bx, by) {
    // [OVERRIDE]
  },
  
});


// Actor: a character that can interact with other characters.
function Actor(bounds, hitbox, tileno)
{
  this._Sprite(bounds);
  this.hitbox = (hitbox === null)? null : hitbox.copy();
  this.tileno = tileno;
  this.scale = new Vec2(1, 1);
  this.phase = 0;
}

define(Actor, Sprite, 'Sprite', {
  collide: function (actor) {
    // [OVERRIDE]
  },

  render: function (ctx, bx, by) {
    // [OVERRIDE]
    var app = this.scene.app;
    var w = this.bounds.width;
    var h = this.bounds.height;
    if (typeof(this.tileno) === 'string') {
      ctx.fillStyle = this.tileno;
      ctx.fillRect(bx+this.bounds.x, by+this.bounds.y, w, h);
    } else {
      var size = app.sprites_size;
      drawImageScaled(ctx, app.sprites,
		      size.x*this.tileno, size.y*(this.phase+1)-h, w, h,
		      bx+this.bounds.x, by+this.bounds.y,
		      w*this.scale.x, h*this.scale.y);
    }
  },
  
  move: function (dx, dy) {
    // [OVERRIDE]
    this.bounds = this.bounds.move(dx, dy);
    if (this.hitbox !== null) {
      this.hitbox = this.hitbox.move(dx, dy);
    }
  },
  
});
