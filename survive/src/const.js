// const.js

Sprite = {
  PLAYER: 0,
  BLOCK: 1,
  COLLECTIBLE: 2,
  DANGER: 1,
};

Tile = {
  NONE: 0,
  BLOCK: 1,
  COLLECTIBLE: 2,
  
  isObstacle: function (c) { return (c < 0 || c == Tile.BLOCK); },
  isCollectible: function (c) { return (c == Tile.COLLECTIBLE); },
};
