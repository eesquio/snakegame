const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startBtn = document.getElementById('startBtn');

// Game constants
const GRID_SIZE = 20;
let TILE_COUNT;
let TILE_SIZE;

// Game state
let snake = [];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('neoSnakeHighScore') || 0;
let gameLoop;
let isGameOver = false;
let gameSpeed = 150; // ms per frame
let lastTick = 0;

// Initialize high score display
highScoreElement.textContent = String(highScore).padStart(3, '0');

function init() {
    // Responsive canvas sizing
    const size = Math.min(window.innerWidth * 0.9, 600);
    canvas.width = size;
    canvas.height = size;
    TILE_SIZE = canvas.width / GRID_SIZE;
    TILE_COUNT = GRID_SIZE;

    resetGame();
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    direction = { x: 0, y: -1 };
    nextDirection = { x: 0, y: -1 };
    score = 0;
    gameSpeed = 150;
    isGameOver = false;
    updateScore();
    spawnFood();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Don't spawn food on snake body
    const onSnake = snake.some(segment => segment.x === food.x && segment.y === food.y);
    if (onSnake) spawnFood();
}

function updateScore() {
    scoreElement.textContent = String(score).padStart(3, '0');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neoSnakeHighScore', highScore);
        highScoreElement.textContent = String(highScore).padStart(3, '0');
    }
}

function handleInput(e) {
    const key = e.key.toLowerCase();
    
    if ((key === 'arrowup' || key === 'w') && direction.y === 0) {
        nextDirection = { x: 0, y: -1 };
    } else if ((key === 'arrowdown' || key === 's') && direction.y === 0) {
        nextDirection = { x: 0, y: 1 };
    } else if ((key === 'arrowleft' || key === 'a') && direction.x === 0) {
        nextDirection = { x: -1, y: 0 };
    } else if ((key === 'arrowright' || key === 'd') && direction.x === 0) {
        nextDirection = { x: 1, y: 0 };
    }
}

function moveSnake() {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Body collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food consumption
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        spawnFood();
        // Speed up
        gameSpeed = Math.max(70, 150 - Math.floor(score / 50) * 10);
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(canvas.width, i * TILE_SIZE);
        ctx.stroke();
    }

    // Draw Food (Neon Pulse)
    const pulse = Math.sin(Date.now() / 200) * 2;
    ctx.fillStyle = '#ff007a';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff007a';
    
    ctx.beginPath();
    ctx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        (TILE_SIZE / 2.5) + pulse,
        0, Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const opacity = 1 - (index / snake.length) * 0.6;
        
        ctx.fillStyle = isHead ? '#00f2ff' : `rgba(0, 242, 255, ${opacity})`;
        ctx.shadowBlur = isHead ? 20 : 0;
        ctx.shadowColor = '#00f2ff';

        // Rounded rectangle for segments
        const r = 4; // corner radius
        const x = segment.x * TILE_SIZE + 2;
        const y = segment.y * TILE_SIZE + 2;
        const w = TILE_SIZE - 4;
        const h = TILE_SIZE - 4;

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, isHead ? 8 : 4);
        ctx.fill();
    });
}

function gameOver() {
    isGameOver = true;
    overlayTitle.textContent = "FIM DE JOGO";
    overlayMessage.textContent = `Você marcou ${score} pontos!`;
    startBtn.textContent = "TENTAR NOVAMENTE";
    overlay.classList.remove('hidden');
}

function main(currentTime) {
    if (isGameOver) return;

    window.requestAnimationFrame(main);

    const deltaTime = currentTime - lastTick;
    if (deltaTime < gameSpeed) return;

    lastTick = currentTime;
    moveSnake();
    draw();
}

function startGame() {
    overlay.classList.add('hidden');
    resetGame();
    lastTick = performance.now();
    window.requestAnimationFrame(main);
}

// Event Listeners
window.addEventListener('keydown', handleInput);
startBtn.addEventListener('click', startGame);
window.addEventListener('resize', init);

// Start
init();
draw(); // Initial draw 
