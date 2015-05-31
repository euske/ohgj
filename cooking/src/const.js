// const.js

// [GAME SPECIFIC CODE]

Sprite = {
  PLAYERR: 0,
  PLAYERL: 1,
  YAY: 2,
  FOOD1: 3,
  FOOD2: 4,
  FOOD3: 5,
  FOOD4: 6,
  FOOD5: 7,

  isCollectible: function (c) { return (Sprite.FOOD1 <= c && c <= Sprite.FOOD5); }
};

Tile = {
  NONE: 0,
  BLOCK: 1,
  GOAL: 2,
  COLLECTIBLE: 3,
  
  isObstacle: function (c) { return (c < 0 || c == Tile.BLOCK); },
  isCollectible: function (c) { return (c == Tile.COLLECTIBLE); },
  isGoal: function (c) { return c == Tile.GOAL; },
};
