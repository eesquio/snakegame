const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startBtn = document.getElementById('startBtn');

// Game constants
const GRID_SIZE = 32; // Aumentado de 20 para 32
let TILE_COUNT;
let TILE_SIZE;

// Game state
let snake = [];
let food = { x: 16, y: 16 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('neoSnakeHighScore') || 0;
let gameLoop;
let isGameOver = false;
let gameSpeed = 150; // ms per frame
let lastTick = 0;

// Cyberpunk color palette
const colors = {
    primary: '#00f2ff',      // Cyan
    secondary: '#ff007a',    // Hot Pink
    tertiary: '#7000ff',     // Purple
    accent: '#00ff88',       // Neon Green
    dark: '#050508',
    grid: 'rgba(0, 242, 255, 0.08)',
    gridBright: 'rgba(0, 242, 255, 0.15)'
};

// Initialize high score display
highScoreElement.textContent = String(highScore).padStart(3, '0');

function init() {
    // Responsive canvas sizing - mantém proporção quadrada
    const size = Math.min(window.innerWidth * 0.9, 800);
    canvas.width = size;
    canvas.height = size;
    TILE_SIZE = canvas.width / GRID_SIZE;
    TILE_COUNT = GRID_SIZE;

    resetGame();
}

function resetGame() {
    snake = [
        { x: 16, y: 16 },
        { x: 16, y: 17 },
        { x: 16, y: 18 }
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

function drawCyberpunkGrid() {
    // Grid principal com efeito cyberpunk
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= TILE_COUNT; i++) {
        // Linhas verticais
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, canvas.height);
        ctx.stroke();
        
        // Linhas horizontais
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(canvas.width, i * TILE_SIZE);
        ctx.stroke();
    }

    // Grid secundário mais brilhante a cada 4 tiles
    ctx.strokeStyle = colors.gridBright;
    ctx.lineWidth = 1.5;
    
    for (let i = 0; i <= TILE_COUNT; i += 4) {
        // Linhas verticais
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, canvas.height);
        ctx.stroke();
        
        // Linhas horizontais
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(canvas.width, i * TILE_SIZE);
        ctx.stroke();
    }

    // Borda do mapa com efeito neon
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.primary;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;
}

function drawFood() {
    // Comida com efeito de pulsação e glow cyberpunk
    const pulse = Math.sin(Date.now() / 150) * 2;
    const foodSize = (TILE_SIZE / 2.2) + pulse;
    
    // Camadas de glow
    ctx.fillStyle = colors.secondary;
    ctx.shadowBlur = 30;
    ctx.shadowColor = colors.secondary;
    
    ctx.beginPath();
    ctx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        foodSize,
        0, Math.PI * 2
    );
    ctx.fill();

    // Anel externo
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors.secondary;
    ctx.beginPath();
    ctx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        foodSize + 3,
        0, Math.PI * 2
    );
    ctx.stroke();
    
    ctx.shadowBlur = 0;
}

function drawSnake() {
    // Desenha a serpente com efeito de gradiente e glow
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const opacity = 1 - (index / snake.length) * 0.5;
        
        // Cor da cabeça é mais brilhante
        const segmentColor = isHead ? colors.primary : colors.accent;
        
        ctx.fillStyle = isHead ? segmentColor : `rgba(0, 255, 136, ${opacity})`;
        ctx.shadowBlur = isHead ? 25 : 10;
        ctx.shadowColor = isHead ? colors.primary : colors.accent;

        // Posição do segmento
        const x = segment.x * TILE_SIZE + 1;
        const y = segment.y * TILE_SIZE + 1;
        const w = TILE_SIZE - 2;
        const h = TILE_SIZE - 2;
        const radius = isHead ? 6 : 3;

        // Desenha o segmento com bordas arredondadas
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();

        // Borda adicional para a cabeça
        if (isHead) {
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = colors.primary;
            ctx.stroke();
            
            // Olhos da serpente
            const eyeSize = 2;
            const eyeOffset = TILE_SIZE / 3;
            
            ctx.fillStyle = colors.secondary;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.secondary;
            
            // Olho esquerdo
            ctx.beginPath();
            ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Olho direito
            ctx.beginPath();
            ctx.arc(x + w - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    ctx.shadowBlur = 0;
}

function draw() {
    // Fundo escuro
    ctx.fillStyle = colors.dark;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid cyberpunk
    drawCyberpunkGrid();

    // Desenha comida
    drawFood();

    // Desenha serpente
    drawSnake();
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
