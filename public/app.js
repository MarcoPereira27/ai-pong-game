var socket;
var numberOfConn;

socket = io.connect("http://localhost:3000");

socket.on("clientNumber", saveClientNumVar);

console.log(socket);

function saveClientNumVar(clientNumber) {
  numberOfConn = clientNumber;
}

var collidePlayerSound = new Howl({
  src: ["./sounds/metal-hit.wav"]
});

var playerPointSound = new Howl({
  src: ["./sounds/point-sound.wav"]
});

var playerGrowingSound = new Howl({
  src: ["./sounds/player-growing.wav"]
});

var playerShrinkingSound = new Howl({
  src: ["./sounds/player-shrinking.wav"]
});

// var playerPopSound = new Howl({
//   scr: ["./sounds/player-pop.wav"]
// });

const scorePlayer1 = document.getElementById("player-1-pont");
const scorePlayer2 = document.getElementById("player-2-pont");
const expandDiv = document.getElementById("expand-player-1");
var i = 0;
var isExpanded = false;
var canExpand = true;

class Vec {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  get len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  set len(value) {
    const fact = value / this.len;
    this.x *= fact;
    this.y *= fact;
  }
}

class Rect {
  constructor(w, h) {
    this.pos = new Vec();
    this.size = new Vec(w, h);
  }

  get left() {
    return this.pos.x - this.size.x / 2;
  }

  get leftTop() {
    return this.pos.x - this.size.x / 2 + this.size.y / 2;
  }

  get leftBottom() {
    return this.pos.x - this.size.x / 2 - this.size.y / 2;
  }

  get right() {
    return this.pos.x + this.size.x / 2;
  }

  get rightTop() {
    return this.pos.x + this.size.x / 2 + this.size.y / 2;
  }

  get rightBottom() {
    return this.pos.x + this.size.x / 2 - this.size.y / 2;
  }

  get top() {
    return this.pos.y - this.size.y / 2;
  }
  get bottom() {
    return this.pos.y + this.size.y / 2;
  }
}

class Ball extends Rect {
  constructor() {
    super(10, 10);
    this.vel = new Vec();
  }
}

class Player extends Rect {
  constructor() {
    super(20, 100);
    this.score = 0;
  }
}

class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");

    this.ball = new Ball();

    this.players = [new Player(), new Player()];

    this.players[0].pos.x = 40;
    this.players[1].pos.x = this._canvas.width - 40;
    this.players.forEach(player => {
      player.pos.y = this._canvas.height / 2;
    });

    let lastTime;
    const callback = millis => {
      if (lastTime) {
        this.update((millis - lastTime) / 1000);
      }

      lastTime = millis;
      requestAnimationFrame(callback);
    };

    callback();

    this.reset();
  }

  collide(player, ball) {
    if (player.left < ball.right && player.right > ball.left) {
      if (player.top + 5 <= ball.bottom && player.bottom - 5 >= ball.top) {
        const len = ball.vel.len;
        ball.vel.x = -ball.vel.x + 5;
        collidePlayerSound.play();

        //Aumentar a velocidade da bola e alterar o ângulo a cada hit
        ball.vel.y += 300 * (Math.random() - 0.5);
        ball.vel.len = len * 1.05;
        console.log("tá fixe a colisão");
      } else if (
        // Colisão em cima
        ball.bottom >= player.top &&
        ball.bottom <= player.bottom + 5
      ) {
        ball.pos.y -= 5;
        collidePlayerSound.play();
        ball.vel.x = ball.vel.x;
        ball.vel.y = -ball.vel.y;
      } else if (ball.top >= player.bottom - 5 && ball.top <= player.bottom) {
        //Colisão em baixo
        ball.pos.y += 5;
        collidePlayerSound.play();
        ball.vel.x = ball.vel.x;
        ball.vel.y = -ball.vel.y;
      }
    }
  }

  draw() {
    this._context.fillStyle = "#000";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    this.drawRect(this.ball);
    this.players.forEach(player => this.drawRect(player));
  }

  drawRect(rect) {
    //this.ball
    this._context.fillStyle = "#fff";
    this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
  }

  reset() {
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
  }

  start() {
    if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
      this.ball.vel.x = 150 * (Math.random() > 0.5 ? 1 : -1);
      this.ball.vel.y = 150 * (Math.random() * 2 - 1);
      this.ball.vel.len = 150;
    }
  }

  expand() {
    //Expandir jogador
    playerGrowingSound.play();
    canExpand = false;
    for (let i = 1; i < 100; i++) {
      setTimeout(function timer() {
        pong.players[0].size.y += 1;
      }, i * 5);
    }

    //Shrink jogador
    setTimeout(() => {
      for (let i = 100; i > 1; i--) {
        setTimeout(function timer() {
          pong.players[0].size.y -= 1;
        }, i * 5);
      }
      isExpanded = false;
      playerShrinkingSound.play();
    }, 7000);

    //Cooldown
    setTimeout(() => {
      canExpand = true;
    }, 17000);

    isExpanded = true;
  }

  update(dt) {
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;

    if (this.ball.left < 0) {
      playerPointSound.play();
      const playerId = (this.ball.vel.x < 0) | 0;
      this.players[0].score++;
      this.reset();
      console.log(this.players[0].score);
    } else if (this.ball.right > this._canvas.width) {
      playerPointSound.play();
      this.players[1].score++;
      this.reset();
      console.log(this.players[1].score);
    }
    if (this.ball.top <= 0 || this.ball.bottom >= this._canvas.height) {
      collidePlayerSound.play();
      this.ball.vel.y = -this.ball.vel.y;
    }

    //Movimento Player 1
    if (top1Pressed == true) {
      this.players[0].pos.y -= 3;
    } else if (down1Pressed == true) {
      this.players[0].pos.y += 3;
    }

    //Movimento Player 2
    // if (top2Pressed == true) {
    //   this.players[1].pos.y -= 3;
    // } else if (down2Pressed == true) {
    //   this.players[1].pos.y += 3;
    // }

    this.players[1].pos.y = this.ball.pos.y;

    this.players.forEach(player => this.collide(player, this.ball));

    this.draw();

    //Update score
    scorePlayer1.textContent = this.players[1].score;
    scorePlayer2.textContent = this.players[0].score;

    //Display Cooldowns
    if (canExpand == false) {
      expandDiv.classList.add("cooldown");
    } else if (canExpand == true) {
      expandDiv.classList.remove("cooldown");
    }

    //Socket Data Emit

    var playerData = {
      player1Y: this.players[0].pos.y,
      player2Y: this.players[1].pos.y
    };

    socket.emit("playerpos", playerData);
  }
}

const canvas = document.getElementById("pong");
const pong = new Pong(canvas);

var top1Pressed;
var down1Pressed;
var top2Pressed;
var down2Pressed;

window.addEventListener("keydown", function(e) {
  if (e.key == "w") {
    top1Pressed = true;
    down1Pressed = false;
  } else if (e.key == "s") {
    down1Pressed = true;
    top1Pressed = false;
  } else if (e.keyCode == 38) {
    top2Pressed = true;
    down2Pressed = false;
  } else if (e.keyCode == 40) {
    down2Pressed = true;
    top2Pressed = false;
  } else if (e.key == "e") {
    if (isExpanded == false && canExpand == true) {
      pong.expand();
    } else {
    }
  }
});

window.addEventListener("keyup", function(e) {
  if (e.key == "w") {
    top1Pressed = false;
  } else if (e.key == "s") {
    down1Pressed = false;
  } else if (e.keyCode == 38) {
    top2Pressed = false;
  } else if (e.keyCode == 40) {
    down2Pressed = false;
  }
});

canvas.addEventListener("click", () => {
  pong.start();
});

setInterval(function() {
  console.log(pong.ball.vel.y);
}, 500);
