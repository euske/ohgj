// const.js

// [GAME SPECIFIC CODE]

S = {
  PLAYER: 0,
  BLOCK: 1,
  COLLECTIBLE: 2,
  YAY: 3,
};

T = {
  NONE: 0,
  WALL: 1,
  RED: 2,
  BLUE: 3,
  
  isObstacle: function (c) { return (c < 0 || c == T.WALL); },
};
