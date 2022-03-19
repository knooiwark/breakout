//---------------------------------------------------------------------
// Project: Breakout
// Coder: Geert Dijkstra
// Last update: 02 March 2019
// Description: Breakout remake using Javascript & HTML5 Canvas
//---------------------------------------------------------------------

// graphics
var canvas;
var canvasCtx;

var ballX = 200;
var ballY = 200;
var ballSpeedX = 0;
var ballSpeedY = -4;
var ballWidth = 10;

var paddleHeight = 10;
var paddleWidth = 50;
var paddleX;
var paddleSpeed = 16;
var paddleVelocity = 0;
var paddleFriction = 0.8;

var rowCount = 8;
var columnCount = 16;
var brickWidth = 30;
var brickHeight = 10;
var brickPadding = 5;
var brickOfssetTop = 20;
var brickOfssetLeft = 20;

var score = 0;
var lives = 10;
var isPlaying = false;
var gameOver = false;
var won = false;
var bricks = [];
var keys = [];

var synth;
var synth2;
var synth3;
var notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'G5'];

// Init
window.addEventListener('load', init, false);

function init() {

  canvas = document.getElementById('breakout');
  canvasCtx = canvas.getContext('2d');
  start = document.getElementById('start');

  paddleX = (canvas.width - paddleWidth) / 2;

  // userinput
  canvas.addEventListener('mousedown', function(){

    if (isPlaying === false){
    startGame();}
  });

  document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
  });
  document.body.addEventListener("keyup", function (e) {
      keys[e.keyCode] = false;
  });

  initBricks();

  // update game
  requestAnimationFrame(update);
}

function update(){

  // Playing loop
  if (isPlaying) {

    drawField();
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionWithBricks();
  }

  // Not playing loop
  else {

    drawField();
    drawBricks();
    drawPaddle();
    drawScore();
    drawLives();

    if (gameOver) {

      canvasCtx.font = '50px Courier';
      canvasCtx.fillStyle = 'grey';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText('Game over!', (canvas.width/2), canvas.height - 160);

    } else if (won) {

      canvasCtx.font = '50px Courier';
      canvasCtx.fillStyle = 'grey';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText('Awesome, you got the all!', (canvas.width/2), canvas.height - 160);
    } else{

      drawIntro();
    }
  }
  requestAnimationFrame(update);
}

// Helper function to create a rect quickly
function createRect(posX, posY, width, height, color) {
  canvasCtx.fillStyle = color;
  canvasCtx.fillRect(posX, posY, width, height);
}

// Init Bricks
function initBricks() {

  for (c = 0; c < columnCount; c++) {
    bricks[c] = [];
    for (r = 0; r < rowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    };
  };
}

// draw Field
function drawField(){

  createRect(0, 0, canvas.width, canvas.height, 'black');
}

// draw Intro textarea
function drawIntro(){

  canvasCtx.font = '15px Courier';
  canvasCtx.fillStyle = 'grey';
  canvasCtx.textAlign ='center';
  canvasCtx.fillText("...Use the left & right arrow keys to move the paddle..", (canvas.width/2), canvas.height - 180);
  canvasCtx.fillText("...And click the screen to start the game...", (canvas.width/2), canvas.height - 165);
}

// draww Bricks
function drawBricks() {

        for (c = 0; c < columnCount; c++) {
            for (r = 0; r < rowCount; r++) {
                if (bricks[c][r].status === 1) {
                    var brickX = (c * (brickWidth + brickPadding)) + brickOfssetLeft;
                    var brickY = (r * (brickHeight + brickPadding)) + brickOfssetTop;

                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;

                    if (r === 0){
                      createRect(brickX, brickY, brickWidth, brickHeight, 'red');
                    }else if (r=== 1 || r===2){
                      createRect(brickX, brickY, brickWidth, brickHeight, 'orange');
                    } else if(r===3){
                      createRect(brickX, brickY, brickWidth, brickHeight, 'yellow');
                    } else if(r===4){
                      createRect(brickX, brickY, brickWidth, brickHeight, 'green');
                    } else if(r===5){
                      createRect(brickX, brickY, brickWidth, brickHeight, 'blue');
                    } else if(r===6 || r===7){
                    createRect(brickX, brickY, brickWidth, brickHeight, 'purple');
                  }
                }
            }
        }
    }

// draw Score
function drawScore() {

  canvasCtx.font = '15px Courier';
  canvasCtx.fillStyle = 'grey';
  canvasCtx.textAlign ='center';
  canvasCtx.fillText("score: " + score, (canvas.width/2), canvas.height - 120);
}

// draw Lives
function drawLives() {

  canvasCtx.font = '15px Courier';
  canvasCtx.fillStyle = 'grey';
  canvasCtx.textAlign ='center';
  canvasCtx.fillText('lives: ' + lives, (canvas.width/2), canvas.height - 100 );
}

// draw Ball
function drawBall() {

  // drawloop only when game is not over
  if (!gameOver) {

    // create ball
    createRect(ballX, ballY, ballWidth, ballWidth, 'white');

    // set ball position
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // ball hitting left/right side of the field
    if (ballX < 0 || ballX > canvas.width - ballWidth) {
        ballSpeedX = -ballSpeedX;
    }

    if (ballY < 0){
      ballSpeedY = -ballSpeedY;
    }

    // ball hitting bottom of the field on player level
    if (ballY > (canvas.height - (ballWidth + paddleHeight + 10))) {

      ballCenter = ballX + (ballWidth/2);

      // center of ball hits paddle between: 0 - 2
      if (ballX + ballWidth > paddleX && ballCenter <= paddleX + 2){
        paddleHit(-6);
      }
      // center of ball hits paddle between: 2 - 10
      else if (ballCenter > paddleX + 2 && ballCenter <= paddleX + 10){
        paddleHit(-3);
      }
      // center of ball hits paddle between: 11 - 20
      else if (ballCenter > paddleX + 10 && ballCenter <= paddleX + 20){
        paddleHit(-1);
      }
      // center of ball hits paddle between: 21 - 30
      else if (ballCenter > paddleX + 20 && ballCenter <= paddleX + 30 ){
        paddleHit(0);
      }
      // center of ball hits paddle between: 31 - 40
      else if (ballCenter > paddleX + 30 && ballCenter <= paddleX + 40){
        paddleHit(1);
      }
      // center of ball hits paddle between: 41 - 48
      else if (ballCenter > paddleX + 40 && ballCenter <= paddleX + 48){
        paddleHit(3);
      }
      // center of ball hits paddle between: 48 - 55
      else if (ballCenter > paddleX + 48 && ballCenter + (ballWidth/2) <= paddleX + 50 + (ballWidth)){
        paddleHit(6);
      }

    // ball missed by paddle
      else {
        if (lives > 1) {

          // A minor
          synth3.triggerAttackRelease("A2", "4n");
          synth2.triggerAttackRelease("E2", "4n");
          synth.triggerAttackRelease("C3", "4n");

          ballX = paddleX - (ballWidth/2) + (paddleWidth/2);  //canvas.width / 2;
          ballY = canvas.height - 30;
          ballSpeedX = 0;
          ballSpeedY = -4;
          //paddleX = (canvas.width - paddleWidth) / 2;
          lives--;
        }
        else {
          synth.triggerAttackRelease("C2", "4n");
          lives = 0;
          gameOver = true;
          isPlaying = false;
        }
      }
    }
  }
}

// paddle hits ball
function paddleHit(s){

  synth.triggerAttackRelease("C3", "32n");
  ballSpeedY = -ballSpeedY;
  ballSpeedX = s;

}

// draw Paddle
function drawPaddle() {

  createRect(paddleX, canvas.height - (paddleHeight + 10), paddleWidth, paddleHeight, 'white');

  // key Left
  if (keys[37]) {
      if (paddleVelocity > -paddleSpeed) {
          paddleVelocity = paddleVelocity - 2;
      }
  }
  // key Right
  if (keys[39]) {
      if (paddleVelocity < paddleSpeed) {
          paddleVelocity = paddleVelocity + 2;
      }
  }

  paddleVelocity *= paddleFriction;
  paddleX += paddleVelocity;

  // borders
  if (paddleX >= canvas.width - paddleWidth) {
      paddleX = canvas.width - paddleWidth;
  }
  else if (paddleX <= 0) {
      paddleX = 0;
  }
}

// check collision ball and bricks
function collisionWithBricks() {

  for (c = 0; c < columnCount; c++) {

    for (r = 0; r < rowCount; r++) {

      var b = bricks[c][r];

      // if brick exists
      if (b.status === 1) {

        // bottom hit
        if (ballX + ballWidth > b.x && ballX < b.x + brickWidth && ballY < b.y + brickHeight && ballY > b.y){
          brickHit(c,r);
        }
        // top hit
        else if(ballX + ballWidth > b.x && ballX < b.x + brickWidth && ballY + ballWidth > b.y && ballY + ballWidth < b.y + brickHeight){
          brickHit(c,r);
        }
        // left hit
        else if (ballY + ballWidth > b.y && ballY < b.y + brickHeight && ballX + ballWidth > b.x && ballX + ballWidth < b.x + brickWidth){
            brickHit(c,r);
        }
        // right hit
        else if (ballY + ballWidth > b.y && ballY < b.y + brickHeight && ballX < b.x && ballX + ballWidth > b.x){
          brickHit(c,r);
        }
      }
    }
  }
}

// ball hits brick
function brickHit(c, r){

  var note = Math.floor(Math.random() * notes.length);
  //alert(notes[note]);

  synth2.triggerAttackRelease(notes[note], '64n');
  ballSpeedY = -ballSpeedY;
  bricks[c][r].status = 0;
  score++;

}

// called from eventlistener
function startGame() {

  if (isPlaying === false) {

    synth = new Tone.Synth().toMaster();
    synth2 = new Tone.Synth().toMaster();
    synth3 = new Tone.Synth().toMaster();

    synth.triggerAttackRelease("C3", "32n");

    initBricks();

    isPlaying = true;
    gameOver = false;
    won = false;

    score = 0;
    lives = 10;

    ballSpeedX = 0;
    ballSpeedY = -4;

    ballX = paddleX + (paddleWidth/2);  //canvas.width / 2;
    ballY = canvas.height - 30;
    //ballDX = 2;  //Math.floor((Math.random() * -2) + 2);
    //ballDY = -2; //Math.floor((Math.random() * -2) - 2);
    //paddleX = (canvas.width - paddleWidth) / 2;

  } else {

      isPlaying = false;
  }
}
