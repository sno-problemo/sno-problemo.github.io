const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load Cessna airplane image
const cessnaImg = new Image();
cessnaImg.src = 'cessna.png';  // Add the Cessna airplane image here

let cessna = { 
  x: 50, 
  y: 150, 
  width: 60,  // Adjust size based on airplane image
  height: 40, // Adjust size based on airplane image
  gravity: 0.6, 
  lift: -5, 
  velocity: 0 
};

let pipes = [];
let frame = 0;
let score = 0;

document.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    cessna.velocity = cessna.lift;  // Control Cessna like the bird
  }
});

function update() {
  // Gravity effect
  cessna.velocity += cessna.gravity;
  cessna.y += cessna.velocity;

  // Generate pipes at intervals
  if (frame % 90 === 0) {
    pipes.push({ 
      x: canvas.width, 
      y: Math.random() * canvas.height / 2 + 50, 
      width: 50, 
      height: 200 
    });
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= 2;
    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1);
      score++;
    }
  });

  // Check for collisions
  pipes.forEach(pipe => {
    if (cessna.x < pipe.x + pipe.width && cessna.x + cessna.width > pipe.x &&
        (cessna.y < pipe.y || cessna.y + cessna.height > pipe.y + pipe.height)) {
      resetGame();
    }
  });

  // Prevent going off screen
  if (cessna.y + cessna.height > canvas.height || cessna.y < 0) {
    resetGame();
  }

  frame++;
}

function resetGame() {
  cessna.y = 150;
  cessna.velocity = 0;
  pipes = [];
  score = 0;
  frame = 0;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Cessna airplane
  ctx.drawImage(cessnaImg, cessna.x, cessna.y, cessna.width, cessna.height);  // Render the image

  // Draw pipes
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
    ctx.fillRect(pipe.x, pipe.y + pipe.height, pipe.width, canvas.height - pipe.y - pipe.height);
  });

  // Draw score
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
