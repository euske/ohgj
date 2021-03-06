// tilemap.js
// TileMap is a generic class that handles a scrollable map.

function TileMap(tilesize, map)
{
  this.tilesize = tilesize;
  this.map = map;
  this.width = map[0].length;
  this.height = map.length;
  this.rangemap = {};
}

TileMap.prototype.get = function (x, y)
{
  if (0 <= x && 0 <= y && x < this.width && y < this.height) {
    return this.map[y][x];
  } else {
    return -1;
  }
};

TileMap.prototype.set = function (x, y, v)
{
  if (0 <= x && 0 <= y && x < this.width && y < this.height) {
    this.map[y][x] = v;
  }
  this.rangemap = {};
};

TileMap.prototype.copy = function ()
{
  return new TileMap(this.tilesize, copyArray(this.map));
};

TileMap.prototype.coord2map = function (rect)
{
  var ts = this.tilesize;
  var x0 = Math.floor(rect.x/ts);
  var y0 = Math.floor(rect.y/ts);
  var x1, y1;
  if (rect instanceof Rectangle) {
    x1 = Math.ceil((rect.x+rect.width)/ts);
    y1 = Math.ceil((rect.y+rect.height)/ts);
  } else {
    x1 = x0+1;
    y1 = y0+1;
  }
  return new Rectangle(x0, y0, x1-x0, y1-y0);
};

TileMap.prototype.map2coord = function (rect)
{
  var ts = this.tilesize;
  if (rect instanceof Rectangle) {
    return new Rectangle(rect.x*ts, rect.y*ts,
			 rect.width*ts, rect.height*ts);
  } else {
    return new Rectangle(rect.x*ts, rect.y*ts, ts, ts);
  }
};

TileMap.prototype.apply = function (rect, f)
{
  if (rect === null) {
    rect = new Rectangle(0, 0, this.width, this.height);
  }
  for (var dy = 0; dy < rect.height; dy++) {
    var y = rect.y+dy;
    for (var dx = 0; dx < rect.width; dx++) {
      var x = rect.x+dx;
      if (f(x, y)) {
	return new Vec2(x,y);
      }
    }
  }
  return null;
};

TileMap.prototype.reduce = function (rect, f, v)
{
  if (rect === null) {
    rect = new Rectangle(0, 0, this.width, this.height);
  }
  for (var dy = 0; dy < rect.height; dy++) {
    var y = rect.y+dy;
    for (var dx = 0; dx < rect.width; dx++) {
      var x = rect.x+dx;
      v = f(x, y, v);
    }
  }
  return v;
};

TileMap.prototype.scroll = function (rect, vx, vy)
{
  if (rect === null) {
    rect = new Rectangle(0, 0, this.width, this.height);
  }
  var src = [];
  for (var dy = 0; dy < rect.height; dy++) {
    var a = [];
    for (var dx = 0; dx < rect.width; dx++) {
      a.push(this.map[rect.y+dy][rect.x+dx]);
    }
    src.push(a);
  }
  for (var dy = 0; dy < rect.height; dy++) {
    for (var dx = 0; dx < rect.width; dx++) {
      var x = (dx+vx + rect.width) % rect.width;
      var y = (dy+vy + rect.height) % rect.height;
      this.map[rect.y+dy][rect.x+dx] = src[y][x];
    }
  }
};

TileMap.prototype.getRangeMap = function (f)
{
  var map = this.rangemap[f];
  if (map === undefined) {
    map = new RangeMap(this, f);
    this.rangemap[f] = map;
  }
  return map;
}

TileMap.prototype.renderFromBottomLeft =
  function (ctx, tiles, ft, 
	    bx, by, x0, y0, w, h)
{
  // Align the pos to the bottom left corner.
  var ts = this.tilesize;
  var tw = tiles.height;
  by = by+ts-tw;
  // Draw tiles from the bottom-left first.
  for (var dy = h-1; 0 <= dy; dy--) {
    for (var dx = 0; dx < w; dx++) {
      var c = ft(x0+dx, y0+dy);
      if (0 <= c) {
	ctx.drawImage(tiles,
		      tw*c, 0, tw, tw,
		      bx+ts*dx, by+ts*dy, tw, tw);
      }
    }
  }
};

TileMap.prototype.renderFromTopRight =
  function (ctx, tiles, ft, 
	    bx, by, x0, y0, w, h)
{
  // Align the pos to the bottom left corner.
  var ts = this.tilesize;
  var tw = tiles.height;
  by = by+ts-tw;
  // Draw tiles from the top-right first.
  for (var dy = 0; dy < h; dy++) {
    for (var dx = w-1; 0 <= dx; dx--) {
      var c = ft(x0+dx, y0+dy);
      if (0 <= c) {
	ctx.drawImage(tiles,
		      tw*c, 0, tw, tw,
		      bx+ts*dx, by+ts*dy, tw, tw);
      }
    }
  }
};
