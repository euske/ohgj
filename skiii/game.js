// game.js

var playerx = 320;
var playery = 240;
var knockback = 0;
var distance = 100;
var movespeed = 10;
var speed = 0;
var blink = 0;
var maxspeed = -40;
var currentkey = null;
var canvas = null;
var ctx = null;
var obstacles = [];
var sprites = null;
var hitSound = null;
var maximumSound = null;

function Obstacle() {
  this.alive = true;
  this.posx = Math.floor(Math.random()*640);
  this.posy = 480;
  this.type = Math.floor(Math.random()*2);
}

function loop() {
  switch (currentkey) {
  case 'ArrowUp':
    playery -= movespeed;
    break;
  case 'ArrowDown':
    playery += movespeed;
    break;
  case 'ArrowLeft':
    playerx -= movespeed;
    break;
  case 'ArrowRight':
    playerx += movespeed;
    break;
  }

  var proceed = Math.abs(speed); // number of pixels to proceed PER FRAME.
  var prob = proceed / distance;
  // if proceed > 200, prob > 1.0
  // if proceed = 20, prob = 0.1
  if (Math.random() < prob) {
    obstacles.push(new Obstacle());
  }
  for (obj of obstacles) {
    obj.posy += speed;
    if (obj.posy < -40) {
      obj.alive = false;
    }
  }
  obstacles = obstacles.filter((obj) => { return obj.alive; });

  for (obj of obstacles) {
    if (obj.posx <= playerx+40 && playerx <= obj.posx+40 &&
	obj.posy <= playery+40 && playery <= obj.posy+40) {
      speed = Math.floor(speed/2);
      knockback = 20;
      hitSound.play();
    }
  }
  if (0 < knockback) {
    playery -= knockback;
    knockback = Math.floor(knockback/2);
  }

  if (playerx < 0) {
    playerx = 0;
  } else if (600 < playerx) {
    playerx = 600;
  }
  if (playery < 0) {
    playery = 0;
  } else if (400 < playery) {
    playery = 400;
  }

  if (100 < playery) {
    speed = Math.max(speed-1, maxspeed);
  }

  //console.log(playerx+','+playery);

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 640, 480);
  ctx.drawImage(sprites, 0, 0, 40, 40, playerx, playery, 40, 40);

  for (obj of obstacles) {
    ctx.drawImage(sprites, 40*(obj.type+1), 0, 40, 40, obj.posx, obj.posy, 40, 40);
  }

  if (speed == maxspeed) {
    if (blink) {
      ctx.font = '48px serif';
      ctx.fillStyle = 'red';
      var text = 'MAXIMUM SPEED!';
      var metric = ctx.measureText(text);
      ctx.fillText(text, (640-metric.width)/2, 200);
      maximumSound.play();
    }
    blink = (blink+1) % 2;
  }
}

function keydown(e) {
  //console.log('keydown '+e.code);
  currentkey = e.code;
}

function keyup(e) {
  //console.log('keyup '+e.code);
  currentkey = null;
}

function main() {
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  sprites = document.getElementById('sprites');
  canvas = document.getElementById('game');
  hitSound = document.getElementById('hit');
  maximumSound = document.getElementById('maximum');
  ctx = canvas.getContext('2d');
  setInterval(loop, 50);
}
