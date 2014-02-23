var DEBUG, GAME_HEIGHT, GRAVITY, GROUND_HEIGHT, GROUND_Y, HARD, HEIGHT, SPAWN_RATE, SPEED, WIDTH, avoidText, bestScore, bestText, bg, smashroom, mashrooms, mushrooms, mashroomsTimer, blood, bloods, board, dieRate, fallSnd, flapSnd, floor, gameOver, gameOverText, gameStart, gameStartText, ground, hurtSnd, instText, main, resetText, score, scoreSnd, scoreText, swooshSnd, mario;

DEBUG = false;

SPEED = 160;

GRAVITY = 600;

SPAWN_RATE = 1 / 1200;

HEIGHT = 480;

WIDTH = 320;

GAME_HEIGHT = 336;

GROUND_HEIGHT = 64;

GROUND_Y = HEIGHT - GROUND_HEIGHT;

HARD = 250;

mario = null;

mashrooms = null;

mushrooms = null;

smashroom = null;

ground = null;

bg = null;

blood = null;

bloods = null;

gameStart = false;

gameOver = false;

mashroomsTimer = null;

dieRate = null;

score = null;

bestScore = 0;

bestText = null;

scoreText = null;

instText = null;

gameOverText = null;

resetText = null;

gameStartText = null;

avoidText = null;

board = null;

flapSnd = null;

scoreSnd = null;

hurtSnd = null;

fallSnd = null;

swooshSnd = null;

floor = Math.floor;

main = function() {
  var create, createmashrooms, flap, game, hitmashrooms, hitmushrooms, over, preload, render, reset, start, state, update;
  hitmashrooms = function(mario, mashroom) {
    var b;
    mashroom.kill();
    score += 1;
    bestScore = score > bestScore ? score : bestScore;
    scoreText.setText(score);
    b = bloods.getFirstDead();
    b.reset(mashroom.body.x, mashroom.body.y);
    b.play('blood', 20, false, true);
    hurtSnd.play();
  };
  hitmushrooms = function(mario, mashroom) {
    var b;
    mashroom.kill();
    score += 5;
    bestScore = score > bestScore ? score : bestScore;
    scoreText.setText(score);
    b = bloods.getFirstDead();
    b.reset(mashroom.body.x, mashroom.body.y);
    b.play('blood', 20, false, true);
    hurtSnd.play();
  };
  createmashrooms = function() {
    var mashroom, i, race, raceName, _i, _ref;
    dieRate = score / HARD;
    mashrooms.forEachAlive(function(mashroom) {
      if (mashroom.x + mashroom.width < game.world.bounds.left) {
        mashroom.kill();
      }
    });
    mushrooms.forEachAlive(function(mashroom) {
      if (mashroom.x + mashroom.width < game.world.bounds.left) {
        mashroom.kill();
      }
    });
    smashroom.forEachAlive(function(mashroom) {
      if (mashroom.x + mashroom.width < game.world.bounds.left) {
        mashroom.kill();
      }
    });
    for (i = _i = _ref = parseInt(Math.random() * 10) % 4 + 8; _ref <= 0 ? _i < 0 : _i > 0; i = _ref <= 0 ? ++_i : --_i) {
      raceName = Math.random() > dieRate ? 'mashroom' : 'smashroom';
      race = raceName === 'mashroom' ? mashrooms : smashroom;
      if (Math.random() > 0.9)
        mashroom = mushrooms.create(game.world.width - (Math.random() - 0.5) * 120, i * (35 - (Math.random() - 0.5) * 5), 'mushroom');
      else
        mashroom = race.create(game.world.width - (Math.random() - 0.5) * 120, i * (35 - (Math.random() - 0.5) * 5), raceName);
      mashroom.anchor.setTo(0.5, 0.5);
      mashroom.body.velocity.x = -SPEED * 1.5;
    }
  };
  flap = function() {
    var tween;
    if (!gameStart) {
      start();
    }
    if (!gameOver) {
      mario.body.velocity.y = -200;
      mario.body.gravity.y = 0;
      tween = game.add.tween(mario.body.velocity).to({
        y: -280
      }, 25, Phaser.Easing.Bounce.In, true);
      tween.onComplete.add(function() {
        return mario.body.gravity.y = GRAVITY;
      });
      flapSnd.play();
    }
  };
  start = function() {
    gameStart = true;
    gameStartText.renderable = false;
    mashroomsTimer = game.time.events.loop(1 / SPAWN_RATE, createmashrooms);
    scoreText.setText(score);
    avoidText.renderable = false;
  };
  over = function() {
    gameOver = true;
    gameOverText.renderable = true;
    resetText.renderable = true;
    board.renderable = true;
    bestText.renderable = true;
    bestText.setText(bestScore);
    bestText.x = 210;
    bestText.y = 240;
    scoreText.x = 210;
    scoreText.y = 195;
    game.time.events.remove(mashroomsTimer);
    game.time.events.add(1000, function() {
      return game.input.onTap.addOnce(function() {
        return reset();
      });
    });
    fallSnd.play();
  };
  preload = function() {
    var assets;
    assets = {
      image: {
        "bg": 'res/bg.png',
        "mashroom": 'res/mashroom.png',
        "mushroom": 'res/mushroom.png',
        "smashroom": 'res/smashroom.png',
        "g": 'res/g.png',
        "mario": 'res/mario.png',
        "start": 'res/start.png',
        "reset": 'res/reset.png',
        "over": 'res/over.png',
        "board": 'res/board.png'
      },
      audio: {
        "die": 'res/sfx_die.mp3',
        "hit": 'res/sfx_hit.mp3',
        "point": 'res/sfx_point.mp3',
        "flap": 'res/sfx_wing.mp3'
      },
      spritesheet: {
        "blood": ['res/blood.png', 64, 64]
      }
    };
    Object.keys(assets).forEach(function(type) {
      Object.keys(assets[type]).forEach(function(id) {
        game.load[type].apply(game.load, [id].concat(assets[type][id]));
      });
    });
  };
  create = function() {
    Phaser.Canvas.setSmoothingEnabled(game.context, false);
    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
    game.stage.scale.setScreenSize(true);
    game.world.width = WIDTH;
    game.world.height = HEIGHT;
    bg = game.add.tileSprite(0, 0, WIDTH, HEIGHT, 'bg');
    ground = game.add.tileSprite(0, GROUND_Y, WIDTH, GROUND_HEIGHT, 'g');
    mashrooms = game.add.group();
    mushrooms = game.add.group();
    smashroom = game.add.group();
    mario = game.add.sprite(0, 0, "mario");
    mario.anchor.setTo(0.5, 0.5);
    flapSnd = game.add.audio("flap");
    scoreSnd = game.add.audio("point");
    hurtSnd = game.add.audio("hit");
    fallSnd = game.add.audio("die");
    bloods = game.add.group();
    bloods.createMultiple(20, 'blood');
    bloods.forEach(function(x) {
      x.anchor.x = 0.5;
      x.anchor.y = 0.5;
      x.animations.add('blood');
      return;
    });
    board = game.add.sprite(game.world.width / 2, game.world.height / 2.3, 'board');
    board.anchor.setTo(0.5, 0.5);
    board.scale.setTo(1, 1);
    board.renderable = false;
    scoreText = game.add.text(game.world.width / 2, game.world.height / 6, "", {
      font: "20px \"sans\"",
      fill: "#fff",
      stroke: "#111",
      strokeThickness: 4,
      align: "center"
    });
    scoreText.anchor.setTo(0.5, 0.5);
    bestText = game.add.text(game.world.width / 2, game.world.height / 6, "", {
      font: "20px \"sans\"",
      fill: "#fff",
      stroke: "#111",
      strokeThickness: 4,
      align: "center"
    });
    bestText.anchor.setTo(0.5, 0.5);
    bestText.renderable = false;
    avoidText = game.add.text(game.world.width / 2, game.world.height / 2.7, "", {
      font: "14px \"sans\"",
      fill: "#fff",
      stroke: "#111",
      strokeThickness: 4,
      align: "center"
    });
    avoidText.anchor.setTo(0.5, 0.5);
    avoidText.setText("Avoid this");
    gameStartText = game.add.sprite(game.world.width / 2, game.world.height / 2, 'start');
    gameStartText.anchor.setTo(0.5, 0.5);
    gameStartText.scale.setTo(1, 1);
    gameOverText = game.add.sprite(game.world.width / 2, game.world.height / 4, 'over');
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(1, 1);
    gameOverText.renderable = false;
    resetText = game.add.sprite(game.world.width / 2, game.world.height / 1.5, 'reset');
    resetText.anchor.setTo(0.5, 0.5);
    resetText.scale.setTo(1, 1);
    resetText.renderable = false;
    game.input.onDown.add(flap);
    reset();
  };
  update = function() {
    if (gameStart) {
      if (!gameOver) {
        game.physics.overlap(mario, smashroom, function() {
          over();
          return fallSnd.play();
        });
        if (!gameOver && mario.body.bottom >= GROUND_Y) {
          over();
        }
        game.physics.overlap(mario, mashrooms, hitmashrooms, null, this);
        game.physics.overlap(mario, mushrooms, hitmushrooms, null, this);
        if (!gameOver) {
          ground.tilePosition.x -= game.time.physicsElapsed * SPEED / 2;
        }
        if (!gameOver) {
          bg.tilePosition.x -= game.time.physicsElapsed * SPEED;
        }
      } else {
        if (mario.body.bottom >= GROUND_Y + 3) {
          mario.y = GROUND_Y - 13;
          mario.body.velocity.y = 0;
          mario.body.allowGravity = false;
          mario.body.gravity.y = 0;
        }
      }
    }
  };
  render = function() {};
  reset = function() {
    gameStart = false;
    gameOver = false;
    gameOverText.renderable = false;
    resetText.renderable = false;
    gameStartText.renderable = true;
    board.renderable = false;
    bestText.renderable = false;
    avoidText.renderable = true;
    score = 0;
    scoreText.setText('Flappy Mario');
    scoreText.x = game.world.width / 2;
    scoreText.y = game.world.height / 6;
    mashrooms.removeAll();
    mushrooms.removeAll();
    mario.reset(game.world.width * 0.25, game.world.height / 2.3);
  };
  state = {
    preload: preload,
    create: create,
    update: update,
    render: render
  };
  return game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'screen', state, false);
};

main();
