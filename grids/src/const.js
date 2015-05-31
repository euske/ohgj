// const.js

// [GAME SPECIFIC CODE]

Sprite = {
  PLAYER: 1,
  COLLECTIBLE: 2,
  ENEMY: 3,
  YAY: 4,
};

Tile = {
  NONE: 0,
  BLOCK: 1,
  COLLECTIBLE: 2,
  ENEMY: 3,
  
  isObstacle: function (c) { return (c < 0 || c == Tile.BLOCK); },
  isCollectible: function (c) { return (c == Tile.COLLECTIBLE); },
  isEnemy: function (c) { return (c == Tile.ENEMY); },
};
