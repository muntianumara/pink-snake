const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Girly Neon Palette
const snakeColors = ['#f06292', '#ba68c8', '#4fc3f7', '#aed581', '#fff176', '#ff8a65'];
let snakeColor = '#f06292';

// Initial snake: an array of coordinates
let snake = [{x: 150, y: 150}, {x: 140, y: 150}, {x: 130, y: 150}, {x: 120, y: 150}, {x: 110, y: 150}];
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
document.getElementById('highScore').innerHTML = highScore;

let dx = 10; // Horizontal velocity
let dy = 0;  // Vertical velocity
let foodX, foodY;
let changingDirection = false;

// Main game loop
function main() {
  if (didGameEnd()) {
    checkHighScore();
    document.getElementById("game-over").style.display = "flex";
    return;
  }

  setTimeout(function onTick() {
    changingDirection = false;
    clearCanvas();
    drawFood();
    advanceSnake();
    drawSnake();
    main();
  }, 100);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() { 
  snake.forEach((part, index) => drawSnakePart(part, index)); 
}

function drawSnakePart(snakePart, index) {
  ctx.fillStyle = (index === 0) ? '#ffffff' : snakeColor; 
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
  ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

function drawFood() {
  ctx.fillStyle = '#ff4081'; // Cute pink food
  ctx.beginPath();
  ctx.arc(foodX + 5, foodY + 5, 5, 0, 2 * Math.PI);
  ctx.fill();
}

function advanceSnake() {
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  snake.unshift(head); // Add new head
  
  const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
  if (didEatFood) {
    score += 10;
    document.getElementById('score').innerHTML = score;
    snakeColor = snakeColors[Math.floor(Math.random() * snakeColors.length)];
    createFood();
  } else { 
    snake.pop(); // Remove tail if no food eaten
  }
}

function didGameEnd() {
  // Check if head hit body
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  // Check if head hit walls
  const hitWall = snake[0].x < 0 || snake[0].x > canvas.width - 10 || 
                   snake[0].y < 0 || snake[0].y > canvas.height - 10;
  return hitWall;
}

function checkHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    document.getElementById('highScore').innerHTML = highScore;
  }
}

function createFood() {
  foodX = Math.round((Math.random() * (canvas.width - 10)) / 10) * 10;
  foodY = Math.round((Math.random() * (canvas.height - 10)) / 10) * 10;
  snake.forEach(function(part) { 
    if (part.x == foodX && part.y == foodY) createFood(); 
  });
}

// --- CONTROLS ---

function changeDirection(event) {
  if (changingDirection) return;
  changingDirection = true;
  const keyPressed = event.keyCode;
  if (keyPressed === 37 && dx !== 10) { dx = -10; dy = 0; } // Left
  if (keyPressed === 38 && dy !== 10) { dx = 0; dy = -10; } // Up
  if (keyPressed === 39 && dx !== -10) { dx = 10; dy = 0; } // Right
  if (keyPressed === 40 && dy !== -10) { dx = 0; dy = 10; } // Down
}
document.addEventListener("keydown", changeDirection);

// --- MOBILE TOUCH (SMART VERSION) ---



let touchstartX = 0;
let touchstartY = 0;

document.addEventListener('touchstart', e => {
    if (e.target.id === "retry-btn") return; // Don't block the button!
    e.preventDefault();
    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
}, { passive: false });

document.addEventListener('touchend', e => {
    if (e.target.id === "retry-btn") return; // Don't block the button!
    e.preventDefault();
    const touchendX = e.changedTouches[0].screenX;
    const touchendY = e.changedTouches[0].screenY;
    handleSwipe(touchstartX, touchstartY, touchendX, touchendY);
}, { passive: false });

function handleSwipe(x1, y1, x2, y2) {
    const swpX = x2 - x1;
    const swpY = y2 - y1;
    if (Math.abs(swpX) > Math.abs(swpY)) {
        if (swpX > 0 && dx !== -10) { dx = 10; dy = 0; }
        else if (swpX < 0 && dx !== 10) { dx = -10; dy = 0; }
    } else {
        if (swpY > 0 && dy !== -10) { dx = 0; dy = 10; }
        else if (swpY < 0 && dy !== 10) { dx = 0; dy = -10; }
    }
}

// --- RESET LOGIC ---

function resetGame() {
  snake = [{x: 150, y: 150}, {x: 140, y: 150}, {x: 130, y: 150}, {x: 120, y: 150}, {x: 110, y: 150}];
  score = 0;
  dx = 10;
  dy = 0;
  snakeColor = '#f06292';
  document.getElementById('score').innerHTML = score;
  document.getElementById("game-over").style.display = "none";
  createFood();
  main();
}

document.getElementById("retry-btn").addEventListener("click", resetGame);
document.getElementById("retry-btn").addEventListener("touchend", (e) => {
  e.preventDefault();
  resetGame();
});

createFood();
main();
