loadSprite("block", "sprites/block.png");
loadSprite("blue-block", "sprites/blue-block.png");
loadSprite("blue-brick", "sprites/blue-brick.png");
loadSprite("blue-goomba", "sprites/blue-goomba.png");
loadSprite("blue-hard-block", "sprites/blue-hard-block.png");
loadSprite("brick", "sprites/brick.png");
loadSprite("coin", "sprites/coin.png");
loadSprite("empty", "sprites/empty.png");
loadSprite("flower", "sprites/flower.png");
loadSprite("goomba-left", "sprites/goomba-left.png");
loadSprite("goomba-right", "sprites/goomba-right.png");
loadSprite("hard-block", "sprites/hard-block.png");
loadSprite("mario", "sprites/mario.png");
loadSprite("mushroom", "sprites/mushroom.png");
loadSprite("pipe-left", "sprites/pipe-left.png");
loadSprite("pipe-right", "sprites/pipe-right.png");
loadSprite("pipe-top-left", "sprites/pipe-top-left.png");
loadSprite("pipe-top-right", "sprites/pipe-top-right.png");
loadSprite("pipe", "sprites/pipe.png");
loadSprite("surprise", "sprites/surprise.png");

const MOVE_SPEED = 120;
const JUMP_FORCE = 620;
const ENEMY_SPEED = 20;

scene("game", ({ score }) => {
  layers(["bg", "game", "ui"], "game");

  const map = [
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                                                                                                                        ",
    "                                                           *****                                                             ****                       ",
    "          %      #?#%#                                    #######                                                            &&&&                       ",
    "                                                                                                                        ****                            ",
    "                                                                                        *                               &&&&       ****               -+",
    "                                       -+                                            *     *     -+              *****             &&&&             -+()",
    "                                       ()           -+                -+    &      *         *   () -+           &&&&&                            -+()()",
    "                             ^    ^    ()           ()           ^    ()    &&            ^      () ()                                            ()()()",
    "=========================================   ============================    ===================================                          ===============",
  ];

  const levelConfig = {
    width: 20,
    height: 20,
    "=": () => [sprite("block"), solid(), area()],
    "*": () => [sprite("coin"), area(), "coin"],
    "%": () => [sprite("surprise"), solid(), area(), "coin-surprise"],
    "?": () => [sprite("surprise"), solid(), area(), "mushroom-surprise"],
    "}": () => [sprite("empty"), solid(), area()],
    "(": () => [sprite("pipe-left"), solid(), scale(0.5), area()],
    ")": () => [sprite("pipe-right"), solid(), scale(0.5), area()],
    "-": () => [sprite("pipe-top-left"), solid(), scale(0.5), area()],
    "+": () => [sprite("pipe-top-right"), solid(), scale(0.5), area()],
    "#": () => [sprite("brick"), solid(), area()],
    "^": () => [sprite("goomba-left"), solid(), area(), "dangerous"],
    "~": () => [sprite("mushroom"), area(), body(), "mushroom"],
    "&": () => [sprite("hard-block"), solid(), scale(0.1), area()],
  };

  const gameLevel = addLevel(map, levelConfig);

  // Add score
  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer("ui"),
    { value: score },
    scale(0.2),
    fixed(),
  ]);

  // add([text("level " + scoreLabel.value), pos(4, 6), scale(0.2)]);

  // Make Mario big
  const big = () => {
    let timer = 0;
    let isBig = false;

    return {
      update() {
        if (isBig) {
          timer -= dt();
          if (timer <= 0) {
            this.smallify();
          }
        }
      },
      isBig() {
        return isBig;
      },
      smallify() {
        this.scale = vec2(1);
        timer = 0;
        isBig = false;
      },
      biggify(time) {
        this.scale = vec2(2);
        timer = time;
        isBig = true;
      },
    };
  };

  // Add Mario
  const mario = add([
    sprite("mario"),
    pos(80, 40),
    area(),
    body(),
    big(),
    origin("bot"),
  ]);

  // Move Mario
  onKeyDown("left", () => {
    mario.move(-MOVE_SPEED, 0);
  });

  onKeyDown("right", () => {
    mario.move(MOVE_SPEED, 0);
  });

  onKeyPress("space", () => {
    if (mario.isGrounded()) {
      mario.jump(JUMP_FORCE);
    }
  });

  // Add scrolling screen
  mario.onUpdate(() => {
    const currCam = camPos();
    if (currCam.x < mario.pos.x) {
      camPos(mario.pos.x, currCam.y);
    }
  });

  // Mario breaking the surprise block
  mario.on("headbutt", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("*", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }

    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("~", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
  });

  // Mushroom moving
  action("mushroom", (m) => {
    m.move(20, 0);
  });

  // Mario eats mushroom
  mario.onCollide("mushroom", (m) => {
    destroy(m);
    mario.biggify(20);
  });

  // Mario takes coin
  mario.onCollide("coin", (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });

  // Mario collides enemy
  mario.onCollide("dangerous", () => {
    go("lose", { score: scoreLabel.value });
  });

  // Enemy moving
  action("dangerous", (d) => {
    d.move(-ENEMY_SPEED, 0);
  });
});

scene("lose", ({ score }) => {
  add([text(score, 32), origin("center"), pos(width() / 2, height() / 2)]);
});

go("game", { score: 0 });
