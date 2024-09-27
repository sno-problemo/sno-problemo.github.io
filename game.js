const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load Cessna airplane image
const cessnaImg = new Image();
cessnaImg.src = 'cessna.png';  // Add the Cessna airplane image here

let cessna = { 
  x: 50, 
  y: 150, 
  width: 60,  
  height: 40, 
  gravity: 0.5, 
  lift: -9, 
  velocity: 0 
};

let pipes = [];
let frame = 0;
let score = 0;
let pipeGap = 200;  // Starting gap between pipes

// Add event listener for mouse click
canvas.addEventListener('mousedown', function() {
  cessna.velocity = cessna.lift;  // Make the Cessna fly upwards when mouse is clicked
});

// Add event listener for spacebar
document.addEventListener('keydown', function(event) {
  if (event.code === 'Space') {  // Check if spacebar is pressed
    cessna.velocity = cessna.lift;  // Make the Cessna fly upwards when spacebar is pressed
  }
});

function update() {
  // Gravity effect
  cessna.velocity += cessna.gravity;
  cessna.y += cessna.velocity;

  // Generate pipes at intervals
  if (frame % 90 === 0) {
    let pipeHeight = Math.random() * (canvas.height / 2) + 50; // Random initial pipe height
    pipes.push({ 
      x: canvas.width, 
      y: pipeHeight, 
      width: 50, 
      height: pipeHeight 
    });
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= 2;

    // Increase the pipe size and decrease the gap as the score increases
    if (score > 5) {  // After score of 5, increase the challenge
      pipe.height += 0.1 * score;  // Make the pipes taller as score increases
      pipeGap -= 0.1 * score;      // Gradually decrease the gap size
    }

    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1);
      score++;
    }
  });

  // Check for collisions
  pipes.forEach(pipe => {
    if (cessna.x < pipe.x + pipe.width && cessna.x + cessna.width > pipe.x &&
        (cessna.y < pipe.y || cessna.y + cessna.height > pipe.y + pipeGap)) {
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
  pipeGap = 200;  // Reset gap size
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Cessna airplane
  ctx.drawImage(cessnaImg, cessna.x, cessna.y, cessna.width, cessna.height);  // Render the image

  // Draw pipes
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
    ctx.fillRect(pipe.x, pipe.y + pipeGap, pipe.width, canvas.height - pipe.y - pipeGap);
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
