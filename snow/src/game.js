// game.js

// Snow
function Snow(bounds, velocity)
{
  this._Actor(bounds, bounds, 'white');
  this.velocity = velocity;
}

define(Snow, Actor, 'Actor', {
  update: function () {
    this._Actor_update();
    this.move(this.velocity.x, this.velocity.y);
    if (!this.hitbox.overlap(this.scene.world)) {
      this.die();
    }
  },    
});

// Player
function Player(bounds)
{
  this._Actor(bounds, bounds, 'white');
  this.velocity = new Vec2();
  this.speed = 0;
  
  this.gravity = 1;
  this.maxspeed = 4;
  this.jumpacc = -4;
  this.maxacctime = 8;
  this._landed = false;
  this._jumpt = -1;
}

define(Player, Actor, 'Actor', {
  getMoveFor: function (v, rect) {
    var hitbox = this.hitbox.copy();
    if (hitbox.overlap(rect)) {
      // target - current
      var d = rect.center().sub(hitbox.center());
      v = v.copy();
      if (0 < d.x*v.x) {
	v.x = 0;
      }
      if (0 < d.y*v.y) {
	v.y = 0;
      }
      return v;
    }
    var d0 = hitbox.contact(v, rect);
    hitbox.x += d0.x;
    hitbox.y += d0.y;
    v = v.sub(d0);
    var d1 = hitbox.contact(new Vec2(v.x,0), rect);
    hitbox.x += d1.x;
    hitbox.y += d1.y;
    v = v.sub(d1);
    var d2 = hitbox.contact(new Vec2(0,v.y), rect);
    return new Vec2(d0.x+d1.x+d2.x,
		    d0.y+d1.y+d2.y);
  },
  
  getMove: function (v) {
    if (this.hitbox === null) return v;
    var box = this.hitbox.union(this.hitbox.movev(v));
    var f = (function (obj) { return (obj instanceof Snow); });
    var objs = this.scene.findObjects(box, f);
    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];
      v = this.getMoveFor(v, obj.hitbox);
    }
    v = this.getMoveFor(v, this.scene.ground);
    var rect = this.hitbox.movev(v).clamp(this.scene.frame);
    return rect.diff(this.hitbox);
  },
  
  jump: function (jumping) {
    if (jumping) {
      if (this._landed) {
	this._jumpt = 0;
	this.velocity.y = this.jumpacc;
      }
    } else {
      this._jumpt = -1;
    }
  },

  update: function () {
    this._Actor_update();
    var v = this.velocity.copy()
    if (0 <= this._jumpt && this._jumpt < this.maxacctime) {
      this._jumpt++;
      v.y -= this.gravity;
    }
    v.x = this.speed;
    v.y += this.gravity;
    v.y = clamp(-this.maxspeed, v.y, this.maxspeed);
    this.velocity = this.getMove(v);
    this._landed = (0 <= this.velocity.y && this.velocity.y < v.y);
    this.move(this.velocity.x, this.velocity.y);
  },
});


//  Game
// 
function Game(app)
{
  this._GameScene(app);
  this.ground = new Rect(0, this.frame.height-16, this.frame.width, 16);
  this.world = this.frame.inflate(this.frame.width/2, 0);
}

define(Game, GameScene, 'GameScene', {
  init: function () {
    this._GameScene_init();

    var app = this.app;
    this.player = new Player(new Rect(this.frame.centerx(), 0, 10, 10));
    this.addObject(this.player);
  },

  render: function (ctx, bx, by) {
    ctx.fillStyle = 'rgb(32,32,32)';
    ctx.fillRect(bx, by, this.frame.width, this.frame.height);

    ctx.fillStyle = 'rgb(128,128,128)';
    ctx.fillRect(bx+this.ground.x, by+this.ground.y,
		 this.ground.width, this.ground.height);    
    
    this._GameScene_render(ctx, bx, by);
  },

  update: function () {
    this._GameScene_update();
    if (rnd(2) == 0) {
      var s = rnd(6,12);
      var rect = new Rect(this.world.x+rnd(this.world.width), 0, s, s);
      var snow = new Snow(rect, new Vec2((Math.random()-0.5)*2, Math.random()*1+1));
      this.addObject(snow);
    }
  },

  set_dir: function (vx, vy) {
    this._GameScene_set_dir(vx, vy);
    this.player.speed = vx*4;
  },

  set_action: function (action) {
    this._GameScene_set_action(action);
    this.player.jump(action);
  },

});
