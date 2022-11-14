loadSprite("block", "sprites/block.png");
loadSprite("blue-block", "sprites/blue-block.png");
loadSprite("blue-brick", "sprites/blue-brick.png");
loadSprite("blue-goomba", "sprites/blue-goomba.png");
loadSprite("blue-hard-block", "sprites/blue-hard-block.png");
loadSprite("blue-surprise", "sprites/blue-surprise.png");
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
const FALL_DEATH = 400;
let CURRENT_ENEMY_SPEED = ENEMY_SPEED;
let isJumping = true;

scene("game", ({ level, score }) => {
  layers(["bg", "game", "ui"], "game");

  const maps = [
    [
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                                                                                                                              ",
      "                                                           *****                                                             ****                             ",
      "          %      #?#%#                                    #######                                                            &&&&                             ",
      "                                                                                                                        ****                                  ",
      "                                                                                        *                               &&&&       ****                     []",
      "                                       -+                                            *     *     -+              *****             &&&&                   -+()",
      "                                       ()           -+                -+    &      *         *   () -+           &&&&&                                  -+()()",
      "                             ^    ^    ()           ()           ^    ()    &&            ^      () ()                                                  ()()()",
      "=========================================   ============================    ===================================                          =====================",
    ],
    [
      "/                                                                                                                                                            /",
      "/                                                                                                                                                            /",
      "/                                                                                                                                                            /",
      "/                                                                                                                                                            /",
      "/                                                                                                                                                            /",
      "/                                                                                                                      ***********                           /",
      "/                                                                                                                     |||||||||||||     |||                  /",
      "/                                                                                                                        |||            |||                  /",
      "/                                                                                                           |||||        |||            |||                  /",
      "/                                                                                                           ||           |||     ||||||||||                  /",
      "/                                                            *****                                          ||      ||||||              |||                  /",
      "/                         !!!!!:                            ///////                                         |||||   ||||||              |||                  /",
      "/                                                                                                                   |||||||||||         |||                  /",
      "/                                                | |                                                -+                |||               |||                []/",
      "/                                              | | | |                           ///////////////////()                |||        !//////                 -+()/",
      "/                                            | | | | | |                   -+    *******************() -+             |||                              -+()()/",
      "/                             ^    ^       | | | | | | | |                 ()                       () ()        ||||||||                              ()()()/",
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   ||||||||||||||||||||||||||||  @@@@@@@@@@@@@@@",
    ],
  ];

  const levelConfig = {
    width: 20,
    height: 20,
    "=": () => [sprite("block"), solid(), area(), "block"],
    "*": () => [sprite("coin"), area(), "coin"],
    "%": () => [sprite("surprise"), solid(), area(), "coin-surprise"],
    "?": () => [sprite("surprise"), solid(), area(), "mushroom-surprise"],
    "}": () => [sprite("empty"), solid(), area()],
    "(": () => [sprite("pipe-left"), solid(), scale(0.5), area(), "block"],
    ")": () => [sprite("pipe-right"), solid(), scale(0.5), area(), "block"],
    "-": () => [sprite("pipe-top-left"), solid(), scale(0.5), area()],
    "+": () => [sprite("pipe-top-right"), solid(), scale(0.5), area()],
    "[": () => [sprite("pipe-top-left"), solid(), scale(0.5), area(), "exit"],
    "]": () => [sprite("pipe-top-right"), solid(), scale(0.5), area(), "exit"],
    "#": () => [sprite("brick"), solid(), area(), "block"],
    "^": () => [sprite("goomba-left"), solid(), area(), "dangerous"],
    "~": () => [sprite("mushroom"), area(), body(), "mushroom"],
    "&": () => [sprite("hard-block"), solid(), scale(0.1), area(), "block"],
    "@": () => [sprite("blue-block"), solid(), area(), scale(0.5), "block"],
    "/": () => [sprite("blue-brick"), solid(), area(), scale(0.5), "block"],
    ";": () => [
      sprite("blue-goomba"),
      solid(),
      area(),
      scale(0.5),
      "dangerous",
    ],
    "|": () => [
      sprite("blue-hard-block"),
      solid(),
      area(),
      scale(0.5),
      "block",
    ],
    "!": () => [
      sprite("blue-surprise"),
      solid(),
      area(),
      scale(0.5),
      "coin-surprise",
    ],
    ":": () => [
      sprite("blue-surprise"),
      solid(),
      area(),
      scale(0.5),
      "mushroom-surprise",
    ],
  };

  const gameLevel = addLevel(maps[level], levelConfig);

  // Add score
  const scoreLabel = add([
    text(score),
    pos(30, 40),
    layer("ui"),
    { value: score },
    scale(0.3),
    fixed(),
  ]);

  add([text("Level " + parseInt(level + 1)), pos(30, 10), scale(0.3), fixed()]);

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
      isJumping = true;
      mario.jump(JUMP_FORCE);
    }
  });

  mario.action(() => {
    if (mario.isGrounded()) {
      isJumping = false;
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
  mario.onCollide("dangerous", (d) => {
    if (isJumping) {
      destroy(d);
    } else {
      go("lose", { score: scoreLabel.value });
    }
  });

  // Enemy moving
  action("dangerous", (d) => {
    d.move(-CURRENT_ENEMY_SPEED, 0);
    // if (d.onCollide("block")) {
    //   CURRENT_ENEMY_SPEED = -ENEMY_SPEED;
    // }
  });

  // onCollide("dangerous", "block", (d) => {
  //   CURRENT_ENEMY_SPEED = -1 * ENEMY_SPEED;
  // });

  // onCollide("dangerous", "block", (d, b) => {
  //   d.dir *= -1;
  // });

  // Mario falling down
  mario.action(() => {
    if (mario.pos.y >= FALL_DEATH) {
      go("lose", { score: scoreLabel.value });
    }
  });

  mario.onCollide("exit", () => {
    onKeyPress("down", () => {
      go("game", {
        level: (level + 1) % maps.length,
        score: scoreLabel.value,
      });
    });
  });
});

scene("lose", ({ score }) => {
  add([text(score, 32), origin("center"), pos(width() / 2, height() / 2)]);
});

go("game", { level: 0, score: 0 });
