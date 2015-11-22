// game.js

// Bomber
function Bomber(target)
{
  var bounds = new Rectangle(-32, target.y-16, 32, 32)
  Actor.call(this, bounds, bounds, 0);
  this.target = target;
  this.speed = 12;
  this.fired = false;
}

Bomber.prototype = Object.create(Actor.prototype);

Bomber.prototype.start = function (scene) {
  Actor.prototype.start.call(this, scene);
  playSound(this.scene.app.audios.bomber);
};

Bomber.prototype.update = function () {
  Actor.prototype.update.call(this);
  this.move(this.speed, 0);
  if (!this.fired && this.target.x <= this.bounds.x) {
    var explosion = new Explosion(this.target, 0);
    this.scene.addObject(explosion);
    this.fired = true;
  }
  if (this.scene.frame.right() < this.bounds.x) {
    this.die();
  }
}

// Explosion
function Explosion(center, side)
{
  Sprite.call(this, null);
  this.center = center;
  this.side = side;
  this.r0 = 0;
  this.r1 = 0;
}

Explosion.prototype = Object.create(Sprite.prototype);

Explosion.prototype.start = function (scene) {
  Sprite.prototype.start.call(this, scene);
  playSound(this.scene.app.audios.explosion);
};

Explosion.prototype.update = function () {
  Sprite.prototype.update.call(this);
  var t = this.getTime();
  this.r0 = t*t*0.2;
  var r = this.r0 + 10;
  var a = this.scene.findObjects(
    MakeRect(this.center, r, r),
    function (obj) { return (obj instanceof Human); });
  for (var i = 0; i < a.length; i++) {
    var obj = a[i];
    if (obj.hitbox.center().distance(this.center) < r) {
      this.scene.updateScore(obj, (0.5 < this.side));
      obj.die();
    }
  }
  r1 = Math.max(0, this.r0-5);
  if (r1 <= 0) {
    this.r1 = 0;
  } else {
    this.r1 = r1*r1*0.05;
    if (this.r0 <= this.r1) {
      this.die();
    }
  }
};

Explosion.prototype.render = function (ctx, bx, by) {
  var x = bx + this.center.x;
  var y = by + this.center.y;
  var r = this.r0;
  ctx.fillStyle = (this.side == 0)? 'rgb(120,255,255)' : 'rgb(255,128,0)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2*Math.PI);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(x+frnd(-r/4, +r/4), y+frnd(-r/4, +r/4), this.r1, 0, 2*Math.PI);
  ctx.fill();
};

// Human
function Human(bounds, side)
{
  Actor.call(this, bounds, bounds, 'white');
  this.side = side;
  this.speed = 2;
}

Human.prototype = Object.create(Actor.prototype);

Human.prototype.isTerrorist = function ()
{
  return (0.5 < this.side);
};

Human.prototype.update = function ()
{
  var dx = frnd(-this.speed, +this.speed);
  var dy = frnd(-this.speed, +this.speed);
  var bounds = this.bounds.move(dx, dy);
  if (this.scene.bounds.overlap(bounds)) {
    this.move(dx, dy);
  }
  if (5 < this.getTime()) {
    if (this.isTerrorist() && 0 < this.scene.violence) {
      this.side += this.scene.violence;
    } else if (this.scene.state < 2) {
      this.side -= 0.001;
    }
    this.side = clamp(0, this.side, 2);
    
    var v = clamp(0, this.side, 1);
    var r = Math.floor(v*220);
    var g = Math.floor((1.0-v)*220);
    var b = Math.floor((1.0-v)*100+60);
    this.tileno = 'rgb('+r+','+g+','+b+')';
    if (this.scene.state == 1 && 20 < this.getTime()) {
      var p = (this.side-1.0)*0.04;
      if (Math.random() <= p) {
	var a = this.scene.findObjects(
	  this.bounds.inflate(30, 30),
	  function (obj) { return (obj instanceof Human) && !obj.isTerrorist(); });
	if (0 < a.length) {
	  var explosion = new Explosion(this.bounds.center(), 1);
	  this.scene.addObject(explosion);
	  this.die();
	}
      }
    }
  }
};


//  Game
// 
function Game(app)
{
  GameScene.call(this, app);
  this.frame = new Rectangle(0, 0, app.screen.width, app.screen.height);
  this.bounds = this.frame.inflate(-20, -20);
  this.timelimit = 30;
  this.plays = 0;
}

Game.prototype = Object.create(GameScene.prototype);
  
Game.prototype.init = function ()
{
  GameScene.prototype.init.call(this);

  var app = this.app;
  var scene = this;

  var w = app.screen.width;
  var h = app.screen.height;
  for (var i = 0; i < 20; i++) {
    var bounds = MakeRect(
      new Vec2(w*0.3+frnd(-w*.2, +w*.3),
	       h*0.5+frnd(-h*.4, +h*.4)), 10, 10);
    this.addObject(new Human(bounds, 0));
  }
  for (var i = 0; i < 20; i++) {
    var bounds = MakeRect(
      new Vec2(w*0.7+frnd(-w*.3, +w*.2),
	       h*0.5+frnd(-h*.4, +h*.4)), 10, 10);
    this.addObject(new Human(bounds, 1));
  }
  
  // show a banner.
  this.textbox = new TextBoxTT(this.frame.inflate(-100,-150), 8, 'rgb(0,0,160)');
  this.textbox.zorder = 1;
  this.textbox.sound = app.audios.beep;
  this.textbox.interval = 8;
  this.textbox.addTask(app.font, '\n\n KILL ALL THE ')
  this.textbox.addTask(app.redfont, 'TERRORISTS!')
  this.textbox.addTask(app.font, '\n (CLICK THEM TO BOMBARD)');
  this.addObject(this.textbox);

  this.texttime = new TextBox(MakeRect(this.frame.bottomright(), 120, 8, -1, -1));
  this.texttime.zorder = 1;
  this.addObject(this.texttime);
  this.textscore1 = new TextBox(MakeRect(this.frame.topleft(), 100, 20, 1, 1), 4);
  this.textscore1.zorder = 1;
  this.addObject(this.textscore1);
  this.textscore2 = new TextBox(MakeRect(this.frame.topright(), 100, 20, -1, 1), 4);
  this.textscore2.zorder = 1;
  this.addObject(this.textscore2);

  this.state = 0;
  this.prevp = null;
  this.violence = 0;
  this.started = 0;
  this.score1 = 0;
  this.score2 = 0;
  this.timeleft = this.timelimit;
  this.updateStatus();

  if (0 < this.plays) {
    this.music = this.app.audios.agrace;
    playSound(this.music);
  }
  this.plays++;
};

Game.prototype.update = function ()
{
  GameScene.prototype.update.call(this);
  switch (this.state) {
  case 1:
    if (this.timeleft === 0) {
      this.endGame();
    } else {
      this.timeleft = this.timelimit-Math.floor((this.ticks-this.started)/this.app.framerate);
      this.updateStatus();
    }
    break;
  }
  this.violence = 0;
};

Game.prototype.updateScore = function (obj, terror)
{
  if (obj.isTerrorist()) {
    if (!terror) {
      this.score2++;
      var scene = this;
      var n = rnd(2,4);
      for (var i = 0; i < n; i++) {
	var task = new Task();
	task.duration = rnd(2, 5)*this.app.framerate;
	task.died.subscribe(function (obj) {
	  var bounds = MakeRect(scene.bounds.rndpt(), 10, 10);
	  scene.addObject(new Human(bounds, 1.3));
	  playSound(scene.app.audios.spawn);
	});
	this.addObject(task);
      }
    }
  } else {
    this.score1++;
  }
};

Game.prototype.updateStatus = function ()
{
  this.texttime.clear();
  this.texttime.addText(this.app.font, 'TIME LEFT:'+format(this.timeleft));
  this.textscore1.clear();
  this.textscore1.addText(this.app.font, 'CIVILIAN\nCASUALTY:'+format(this.score1));
  this.textscore2.clear();
  this.textscore2.addText(this.app.font, 'TERRORISTS\nKILLED:'+format(this.score2));
};

Game.prototype.render = function (ctx, bx, by)
{
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(bx, by, this.app.screen.width, this.app.screen.height);
  GameScene.prototype.render.call(this, ctx, bx, by);
};

Game.prototype.startGame = function ()
{
  this.textbox.visible = false;
  this.started = this.ticks;
  this.state = 1;
};

Game.prototype.endGame = function ()
{
  this.textbox.visible = true;
  this.textbox.clear();
  this.textbox.addTask(this.app.font,
		       ('\n\n  CIVILIAN CASUALTY: '+format(this.score1)+
			'\n  TERRORISTS KILLED: '+format(this.score2)));
  var total = this.score1+this.score2;
  if (0 < total) {
    this.textbox.addTask(this.app.redfont,
			 ('\n  TOTAL VIOLENCE:    '+format(total)+
			  '\n  YOU FAILED.'));
  } else {
    this.textbox.addTask(this.app.greenfont,
			 ('\n  TOTAL VIOLENCE:    '+format(total)+
			  '\n  YOU WON.'));
  }
  this.state = 2;
  this.ticks = 0;
};

Game.prototype.keydown = function (key)
{
  switch (this.state) {
  case 0:
    this.startGame();
    break;
  case 2:
    this.init();
    break;
  }
};

Game.prototype.mousemove = function (x, y)
{
  var p = new Vec2(x, y);
  if (this.prevp !== null) {
    var d = this.prevp.distance(p);
    if (4 < d) {
      this.violence = 0.02;
    }
  }
  this.prevp = p;
};


Game.prototype.mousedown = function (x, y, b)
{
  switch (this.state) {
  case 0:
    this.startGame();
    break;
  case 1:
    var explosion = new Bomber(new Vec2(x, y));
    this.addObject(explosion);
    this.violence = 0.1;
    break;
  case 2:
    if (this.app.framerate < this.ticks) {
      this.init();
    }
    break;
  }
};
