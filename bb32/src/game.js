// game.js

// Cake
function Cake(bounds)
{
  Actor.call(this, bounds, bounds.inflate(-4,-4), 0);
  this.orig = bounds.center();
}

Cake.prototype = Object.create(Actor.prototype);

Cake.prototype.update = function ()
{
  var vx, vy;
  var p = this.bounds.center();
  if (this.orig.x == p.x || rnd(2) == 0) {
    vx = rnd(3)-1;
  } else {
    vx = (p.x < this.orig.x)? +1 : -1;
  }
  if (this.orig.y == p.y || rnd(2) == 0) {
    vy = rnd(3)-1;
  } else {
    vy = (p.y < this.orig.y)? +1 : -1;
  }
  this.move(vx, vy);
};

// Animal
function Animal(bounds)
{
  Actor.call(this, bounds, bounds.inflate(-8,-8), rnd(3)+5);
  this.velocity = new Vec2(-2, 0);
}

Animal.prototype = Object.create(Actor.prototype);

Animal.prototype.update = function ()
{
  this.move(this.velocity.x, this.velocity.y);
  if (!this.bounds.overlap(this.scene.frame)) {
    this.die();
  }
}


// Player
function Player(bounds)
{
  Actor.call(this, bounds, bounds.inflate(-4,-4), 4);
  this.speed = 4;
  this.gravity = 2;
  this.maxspeed = 8;
  this.jumpacc = -8;
  this.maxacctime = 12;
  this.velocity = new Vec2(0, 0);
  this._phase = 0;
  this._jumpt = -1;
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.grow = function (size)
{
  this.bounds = this.bounds.inflate(size, size);
  this.hitbox = this.bounds.inflate(-4,-4);
};

Player.prototype.jump = function (jumping)
{
  if (jumping) {
    this._jumpt = 0;
    this.velocity.y = this.jumpacc;
    this.velocity.x = (rnd(2) == 0)? +1 : -1;
    this.velocity.x *= (rnd(this.speed)+1);
    this.velocity
  } else {
    this._jumpt = -1;
  }
};

Player.prototype.collide = function (actor)
{
  if (this.scene.running) {
    if (actor instanceof Cake || actor instanceof Animal) {
      this.scene.pick(actor);
    }
  }
};

Player.prototype.update = function ()
{
  if (this.scene.running) {
    if (0 <= this._jumpt && this._jumpt < this.maxacctime) {
      this._jumpt++;
      this.velocity.y -= this.gravity;
    }
    this.velocity.y += this.gravity;
    this.velocity.y = clamp(-this.maxspeed, this.velocity.y, this.maxspeed);
    this.move(this.velocity.x, this.velocity.y);
    this._phase = (this._phase+1) % 8;
    this.tileno = 1 + ((this._phase < 4)? 2 : 0) + ((this.velocity.x < 0)? 1 : 0);
    if (!this.hitbox.overlap(this.scene.frame)) {
      this.die();
    }
  } else {
    var p = this.bounds.center();
    var q = this.scene.frame.center();
    this.velocity.x = (q.x-p.x)/8;
    this.velocity.y = (q.y-p.y)/8;
    this.move(this.velocity.x, this.velocity.y);
  }
};


//  Stars
//
function Stars(bounds, nstars, color, speed, maxdepth)
{
  Sprite.call(this, bounds);
  this.color = (color !== undefined)? color : 'white';
  this.speed = (speed !== undefined)? speed : -10;
  this.maxdepth = (maxdepth !== undefined)? maxdepth : 3;
  this.objs = [];
  for (var i = 0; i < nstars; i++) {
    this.objs.push(this.initStar({}));
  }
}

Stars.prototype = Object.create(Sprite.prototype);

Stars.prototype.initStar = function (obj)
{
  obj.s = Math.random()*2+1;
  obj.z = Math.random()*this.maxdepth+1;
  obj.x = rnd(this.bounds.width);
  obj.y = rnd(this.bounds.height);
  return obj;
}

Stars.prototype.update = function ()
{
  Task.prototype.update.call(this);
  for (var i = 0; i < this.objs.length; i++) {
    var obj = this.objs[i];
    obj.x += this.speed/obj.z;
    if (obj.x+(obj.s/obj.z) < 0) {
      this.initStar(obj);
      obj.x = this.bounds.width;
    } else if (this.bounds.width < obj.x) {
      this.initStar(obj);
      obj.x = 0;
    }
  }
};

Sprite.prototype.render = function (ctx, bx, by)
{
  ctx.fillStyle = this.color;
  bx += this.bounds.x;
  by += this.bounds.y;
  for (var i = 0; i < this.objs.length; i++) {
    var obj = this.objs[i];
    var s = obj.s/obj.z;
    ctx.fillRect(bx+obj.x, by+obj.y, s, s);
  }
};


//  TextBoxTTFrame
// 
function TextBoxTTFrame(frame, linespace)
{
  TextBoxTT.call(this, frame, linespace);
}

TextBoxTTFrame.prototype = Object.create(TextBoxTT.prototype);

TextBoxTTFrame.prototype.render = function (ctx, bx, by)
{
  if (this.bounds !== null) {
    ctx.fillStyle = 'black';
    ctx.fillRect(bx+this.bounds.x, by+this.bounds.y,
		 this.bounds.width, this.bounds.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(bx+this.bounds.x+2, by+this.bounds.y+2,
		   this.bounds.width-4, this.bounds.height-4);
  }  
  TextBoxTT.prototype.render.call(this, ctx, bx, by);
};


//  Intro
// 
function Intro(app)
{
  Scene.call(this, app);
  this.music = app.audios.intro;
  this.frame = new Rectangle(0, 0, app.screen.width, app.screen.height)
  this.stars = new Stars(this.frame, 100);
}

Intro.prototype = Object.create(Scene.prototype);

Intro.prototype.init = function ()
{
  Scene.prototype.init.call(this);
  var scene = this;
  var frame = this.frame;
  var app = this.app;
  this.stars.start(this);
  this.textbox = new TextBoxTT(frame.inflate(-200,-200));
  this.textbox.start(this);
  this.textbox.addTask(this.app.font, '32 YEARS AGO...',
		       this.app.audios.beep, 8);
  var task = this.textbox.addPause(30);
  task.died.subscribe(function (t) {
    scene.textbox.die();
    scene.textbox = new TextBoxTT(frame.inflate(-100,-150), 8);
    scene.textbox.start(scene);
    scene.textbox.addTask(app.font, '"WHAT A CUTE LITTLE BABY!"\n\n',
			  app.audios.beep, 8);
    scene.textbox.addPause(30);
    scene.textbox.addTask(app.font, '"INDEED!"\n\n',
			  app.audios.beep, 8);
    scene.textbox.addPause(30);
    scene.textbox.addTask(app.font, '"HONEY, WHAT DO YOU THINK\n HE IS GOING TO BE?"\n\n',
			  app.audios.beep, 8);
    scene.textbox.addPause(30);
    scene.textbox.addTask(app.font, '"A SCIENTIST OR MUSICIAN?"\n\n',
			  app.audios.beep, 8);    
    scene.textbox.addPause(40);
    scene.textbox.addTask(app.font, 'Well, how about...',
			  app.audios.beep, 8);    
    scene.textbox.addPause(30);
    scene.textbox.addTask(app.font_bold, '\n  A GREAT INDIE GAME DEV??',
			  app.audios.beep, 8);    
  });
};

Intro.prototype.update = function ()
{
  Scene.prototype.update.call(this);
  this.stars.update();
  this.textbox.update();
};

Intro.prototype.render = function (ctx, bx, by)
{
  ctx.fillStyle = 'rgb(0,0,16)';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  this.stars.render(ctx, bx, by);
  this.textbox.render(ctx, bx, by);
};

Intro.prototype.keydown = function (keyCode)
{
  this.changeScene(new Game(this.app));
};


//  Game
// 
function Game(app)
{
  GameScene.call(this, app);
  this.frame = new Rectangle(0, 0, app.screen.width, app.screen.height)
}

Game.prototype = Object.create(GameScene.prototype);
  
Game.prototype.init = function ()
{
  GameScene.prototype.init.call(this);
  var scene = this;

  var app = this.app;

  this.stars = new Stars(this.frame, 20);
  this.addObject(this.stars);

  this.animals = 0;
  this.cakeleft = 32;
  this.running = true;
  this.app.audios.music.pause();
  var rect = this.frame.inflate(-100, -100).move(0,40);
  for (var i = 0; i < this.cakeleft; i++) {
    var p = rect.rndpt();
    this.addObject(new Cake(MakeRect(p, 16, 16)));
  }

  this.player = null;

  // show a banner.
  var textbox = new TextBox(this.frame.inflate(0, -80).move(0, -80));
  textbox.putText(app.font, ['ONE KEY TO JUMP!!'], 'center', 'center');
  textbox.duration = app.framerate*2;
  textbox.update = function () {
    TextBox.prototype.update.call(textbox);
    textbox.visible = blink(scene.ticks, app.framerate/3);
  };
  this.addObject(textbox);

  this.scorebox = new TextBox(this.frame);
  this.addObject(this.scorebox);

  this.updateScore();
};

Game.prototype.render = function (ctx, bx, by)
{
  // Fill with the background color.
  ctx.fillStyle = 'rgb(0,0,16)';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  GameScene.prototype.render.call(this, ctx, bx, by);
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);
  if (0 < this.cakeleft && rnd(20) == 0) {
    var rect = new Rectangle(this.frame.width, rnd(this.frame.height-40)+20, 16, 16);
    this.addObject(new Animal(rect));
  }
};

Game.prototype.set_action = function (action)
{
  GameScene.prototype.set_action(this, action);
  if (!this.running) return;
  if (this.player != null) {
    this.player.jump(action);
    if (action) {
      playSound(this.app.audios.jump);
    }
  } else if (action) {
    var scene = this;
    this.player = new Player(new Rectangle((this.frame.width-16)/2, 0, 16, 16));
    this.player.died.subscribe(function (obj) {
      playSound(scene.app.audios.explosion);
      scene.init();
    });
    this.addObject(this.player);
    playSound(this.app.audios.powerup);
    playSound(this.app.audios.music);
  }
}

Game.prototype.pick = function (actor)
{
  playSound(this.app.audios.pick);
  actor.die();
  if (actor instanceof Cake) {
    this.player.grow(4);
    this.cakeleft--;
  } else if (actor instanceof Animal) {
    this.animals++;
  }
  if (this.cakeleft == 0) {
    var app = this.app;
    this.running = false;
    this.app.audios.music.pause();
    var textbox = new TextBoxTTFrame(new Rectangle(8, 8, this.app.screen.width-150, 64), 8);
    textbox.zorder = 1;
    textbox.bounds = MakeRect(this.frame.center(), textbox.frame.width+16,
			      textbox.frame.height+16).move(0, 80);
    textbox.addPause(30);
    textbox.addTask(this.app.font, 'BITSLAP -\n  KEEP GROWING\n  SINCE 1983.11.11',
		    this.app.audios.beep, 8);
    var task = textbox.addTask(this.app.font_bold, '\n    HAPPY BIRTHDAY');
    task.died.subscribe(function (t) {
      playSound(app.audios.ending);
    });
    this.addObject(textbox);
  }
  this.updateScore();
}

Game.prototype.updateScore = function ()
{
  this.scorebox.clear();
  this.scorebox.putText(this.app.font, ['CAKE LEFT:'+format(this.cakeleft)], 'left', 'top');
  this.scorebox.putText(this.app.font, ['ANIMALS:'+format(this.animals)], 'right', 'top');
};
