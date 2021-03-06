// level.js

// [GAME SPECIFIC CODE]

//  Level1
// 
function Level1(game)
{
  Scene.call(this, game);
  
  this.tilesize = 32;
  //this.music = game.audios.music;
}

Level1.prototype = Object.create(Level.prototype);
  
Level1.prototype.render = function (ctx, bx, by)
{
  // [OVERRIDE]
  var tilesize = this.tilesize;
  var window = this.window;
  var tilemap = this.tilemap;
  bx -= tilesize;
  by += (this.game.screen.height-this.window.height)/2;

  // Fill with the background color.
  var t = this.score*this.ticks*0.03;
  var r = Math.floor(255*Math.sin(t));
  var g = Math.floor(255*Math.sin(t+1.0));
  var b = Math.floor(255*Math.sin(t+2.0));
  ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
  ctx.fillRect(bx, by, this.window.width, this.window.height);

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
  var fb = function (x,y) {
    var c = tilemap.get(x,y);
    return (c == T.LAVA? c : -1);
  };
  tilemap.renderFromTopRight(
    ctx, this.game.tiles, fb, 
    bx+fx, by+fy, x0, y0, x1-x0+1, y1-y0+1);
  var ft = function (x,y) {
    var k = x+','+y;
    if (objs.hasOwnProperty(k)) {
      var r = objs[k];
      for (var i = 0; i < r.length; i++) {
	var a = r[i];
	var b = a.bounds;
	if (a instanceof FixedSprite) {
	  ;
	} else if (a instanceof Player) {
	  a.render(ctx, bx-window.x, by-window.y, false);
	} else {
	  a.render(ctx, bx-window.x, by-window.y);
	}
      }
    }
    var c = tilemap.get(x,y);
    return ((c == T.NONE || c == T.LAVA)? -1 : c);
  };
  tilemap.renderFromTopRight(
    ctx, this.game.tiles, ft, 
    bx+fx, by+fy, x0, y0, x1-x0+1, y1-y0+1);

  // Draw floating objects.
  for (var i = 0; i < this.sprites.length; i++) {
    var obj = this.sprites[i];
    if (obj.scene !== this) continue;
    if (obj.bounds === null) {
      obj.render(ctx, bx, by);
    } else if (obj instanceof FixedSprite) {
      var bounds = obj.bounds;
      if (bounds.overlap(window)) {
	obj.render(ctx, bx-window.x, by-window.y);
      }
    } else if (obj instanceof Player) {
      var bounds = obj.bounds;
      if (bounds.overlap(window)) {
	obj.render(ctx, bx-window.x, by-window.y, true);
      }
    }
  }
};

Level1.prototype.scrollTile = function (vx, vy)
{
  // generate tiles for horizontal scrolling.
  var ratio = Math.floor(this.score/2)+1;
  for (var x = 0; x < vx; x++) {
    for (var y = 1; y < this.tilemap.height-1; y++) {
      this.tilemap.set(x, y, (rnd(ratio) < 2)? T.NONE : T.LAVA);
    }
    if (rnd(3) == 0) {
      var y = rnd(1, this.tilemap.height-1);
      this.tilemap.set(x, y, T.FLOOR);
    }
    if (rnd(3) == 0) {
      var y = rnd(1, this.tilemap.height-1);
      var rect = new Rectangle(x+this.tilemap.width, y, 1, 1);
      rect = this.tilemap.map2coord(rect);
      this.addObject(new Actor(rect, rect, S.THINGY));
      this.tilemap.set(x, y, T.NONE);
    }
  }
  this.tilemap.scroll(null, vx, vy);
};

Level1.prototype.moveAll = function (vx, vy)
{
  var tilesize = this.tilesize;
  var window = this.window;
  window.x += vx;
  window.y += vy;
  this.player.move(vx, vy);
  
  var x0 = Math.floor(window.x/tilesize);
  var y0 = Math.floor(window.y/tilesize);
  if (x0 != 0 || y0 != 0) {
    // warp all the tiles and characters.
    this.scrollTile(x0, y0);
    var wx = -x0*tilesize;
    var wy = -y0*tilesize;
    window.x += wx;
    window.y += wy;
    for (var i = 0; i < this.sprites.length; i++) {
      var obj = this.sprites[i];
      if (obj.scene !== this) continue;
      if (obj.bounds === null) continue;
      obj.bounds.x += wx;
      obj.bounds.y += wy;
    }
    for (var i = 0; i < this.colliders.length; i++) {
      var obj = this.colliders[i];
      if (obj.scene !== this) continue;
      if (obj.hitbox === null) continue;
      obj.hitbox.x += wx;
      obj.hitbox.y += wy;
    }
  }
};

Level1.prototype.update = function ()
{
  Level.prototype.update.call(this);
  this.moveAll(this.speed.x, this.speed.y);
  if (this.player.hitbox.right() < this.tilesize) {
    this.die();
  }
};

Level1.prototype.die = function ()
{
  this.changed.signal('LOST', this.score);
};

Level1.prototype.init = function ()
{
  Level.prototype.init.call(this);
  
  // [OVERRIDE]
  // [GAME SPECIFIC CODE]
  var map = new Array(7);
  for (var y = 0; y < map.length; y++) {
    var row = new Array(12);
    for (var x = 0; x < row.length; x++) {
      row[x] = (y == 0 || y == map.length-1)? T.WALL : T.NONE;
    }
    map[y] = row;
  }
  this.tilemap = new TileMap(this.tilesize, map);

  this.speed = new Vec2(2, 0);
  this.window = new Rectangle(0, 0, this.tilemap.width*this.tilesize, this.tilemap.height*this.tilesize);
  
  var game = this.game;
  var scene = this;
  var rect = new Rectangle(2, 3, 1, 1);
  this.player = new Player(this.tilemap.map2coord(rect));
  this.addObject(this.player);
  
  function player_jumped(e) {
    playSound(game.audios.jump);
  }
  function player_picked(e) {
    playSound(game.audios.pick);
    scene.score++;
    scene.updateScore();
    if (rnd(3) == 0) {
      scene.speed.x++;
    }
  }
  this.player.picked.subscribe(player_picked);
  this.player.jumped.subscribe(player_jumped);

  this.score_node = game.addElement(new Rectangle(10, 10, 160, 32));
  this.score_node.align = 'left';
  this.score_node.style.color = 'white';
  this.score_node.style['font-size'] = '150%';
  this.score_node.style['font-weight'] = 'bold';
  this.score = 0;
  this.updateScore();

  // show a banner.
  var banner = new Sprite(null);
  banner.update = function () {
    banner.alive = (scene.ticks < banner.ticks0+game.framerate*2);
  };
  banner.render = function (ctx, x, y) {
    if (blink(scene.ticks, game.framerate/2)) {
      game.renderString(game.images.font_w, 'GET ALL TEH DAMN THINGIES!', 1,
			x+scene.window.width/2, y+50, 'center');
    }
  };
  this.addObject(banner);
};

Level1.prototype.move = function (vx, vy)
{
  // [GAME SPECIFIC CODE]
  this.player.usermove(vx, vy);
};

Level1.prototype.action = function (action)
{
  // [GAME SPECIFIC CODE]
  this.player.jump(action);
};

Level1.prototype.updateScore = function ()
{
  // [GAME SPECIFIC CODE]
  this.score_node.innerHTML = ('Score: '+this.score);
};
