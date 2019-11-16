var collidePlayerSound = new Howl({
  src: ["sounds/metal-hit.wav"]
});

var playerPointSound = new Howl({
  src: ["sounds/point-sound.wav"]
});

const scorePlayer1 = document.getElementById("player-1-pont");
const scorePlayer2 = document.getElementById("player-2-pont");

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
  get right() {
    return this.pos.x + this.size.x / 2;
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
    if (
      player.left < ball.right &&
      player.right > ball.left &&
      player.top < ball.bottom &&
      player.bottom > ball.top
    ) {
      collidePlayerSound.play();
      const len = ball.vel.len;
      ball.vel.x = -ball.vel.x;

      //Aumentar a velocidade da bola e alterar o ângulo a cada hit
      ball.vel.y += 300 * (Math.random() - 0.5);
      ball.vel.len = len * 1.05;
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
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
      collidePlayerSound.play();
      this.ball.vel.y = -this.ball.vel.y;
    }

    //Movimento Player 1
    if (top1Pressed == true) {
      this.players[0].pos.y -= 2;
    } else if (down1Pressed == true) {
      this.players[0].pos.y += 2;
    }

    //Movimento Player 2
    if (top2Pressed == true) {
      this.players[1].pos.y -= 2;
    } else if (down2Pressed == true) {
      this.players[1].pos.y += 2;
    }

    this.players.forEach(player => this.collide(player, this.ball));

    this.draw();

    //Update score
    scorePlayer1.textContent = this.players[1].score;
    scorePlayer2.textContent = this.players[0].score;
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

canvas.addEventListener("click", event => {
  pong.start();
});
