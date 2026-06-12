// Game Constants
const CANVAS = document.getElementById('pongCanvas');
const CTX = CANVAS.getContext('2d');
const GAME_DURATION = 5 * 60; // 5 minutes in seconds
const WIN_SCORE = 7;

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 20,
    y: CANVAS.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: CANVAS.width - 30,
    y: CANVAS.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

const ball = {
    x: CANVAS.width / 2,
    y: CANVAS.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    speed: 5
};

// Game State
let gameState = {
    running: false,
    paused: false,
    gameStarted: false,
    playerScore: 0,
    computerScore: 0,
    timeRemaining: GAME_DURATION,
    difficulty: 1
};

// Input handling
const keys = {};
let mouseY = CANVAS.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

CANVAS.addEventListener('mousemove', (e) => {
    const rect = CANVAS.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Game Functions
function startGame() {
    if (gameState.gameStarted && !gameState.running) {
        gameState.running = true;
        gameState.paused = false;
        updateMessage('اللعبة جارية...', '');
        gameLoop();
        return;
    }
    
    if (!gameState.gameStarted) {
        gameState.gameStarted = true;
        gameState.running = true;
        gameState.paused = false;
        gameState.timeRemaining = GAME_DURATION;
        updateMessage('اللعبة جارية...', '');
        gameLoop();
    }
}

function togglePause() {
    if (!gameState.gameStarted || !gameState.running) return;
    
    gameState.paused = !gameState.paused;
    if (gameState.paused) {
        updateMessage('اللعبة موقوفة مؤقتاً', 'paused');
    } else {
        updateMessage('اللعبة جارية...', '');
        gameLoop();
    }
}

function resetGame() {
    gameState = {
        running: false,
        paused: false,
        gameStarted: false,
        playerScore: 0,
        computerScore: 0,
        timeRemaining: GAME_DURATION,
        difficulty: 1
    };
    
    ball.x = CANVAS.width / 2;
    ball.y = CANVAS.height / 2;
    ball.dx = 5;
    ball.dy = 5;
    
    player.y = CANVAS.height / 2 - paddleHeight / 2;
    computer.y = CANVAS.height / 2 - paddleHeight / 2;
    
    updateScore();
    updateDifficulty();
    updateMessage('', '');
    draw();
}

function updateScore() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('computerScore').textContent = gameState.computerScore;
}

function updateDifficulty() {
    const levels = ['سهل', 'متوسط', 'صعب', 'جداً صعب'];
    gameState.difficulty = Math.floor((GAME_DURATION - gameState.timeRemaining) / 75) + 1;
    gameState.difficulty = Math.min(gameState.difficulty, 4);
    document.getElementById('difficulty').textContent = levels[gameState.difficulty - 1];
}

function updateTimer() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateMessage(text, className) {
    const msgEl = document.getElementById('message');
    msgEl.textContent = text;
    msgEl.className = 'message ' + className;
}

function checkWinner() {
    if (gameState.playerScore >= WIN_SCORE) {
        gameState.running = false;
        updateMessage('🎉 أنت الفائز! مبروك!', 'winner');
        return true;
    }
    if (gameState.computerScore >= WIN_SCORE) {
        gameState.running = false;
        updateMessage('😅 الحاسوب فاز! حاول مرة أخرى', 'game-over');
        return true;
    }
    return false;
}

function checkTimeUp() {
    if (gameState.timeRemaining <= 0) {
        gameState.running = false;
        if (gameState.playerScore > gameState.computerScore) {
            updateMessage('⏰ انتهى الوقت! أنت الفائز!', 'winner');
        } else if (gameState.computerScore > gameState.playerScore) {
            updateMessage('⏰ انتهى الوقت! الحاسوب الفائز!', 'game-over');
        } else {
            updateMessage('⏰ انتهى الوقت! تعادل!', 'game-over');
        }
        return true;
    }
    return false;
}

function updatePlayerPaddle() {
    // Keyboard control
    if (keys['ArrowUp']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown']) {
        player.y += player.speed;
    }
    
    // Mouse control
    const mouseDistance = mouseY - (player.y + paddleHeight / 2);
    if (Math.abs(mouseDistance) > 5) {
        player.y += mouseDistance * 0.15;
    }
    
    // Boundary checking
    if (player.y < 0) player.y = 0;
    if (player.y + paddleHeight > CANVAS.height) {
        player.y = CANVAS.height - paddleHeight;
    }
}

function updateComputerPaddle() {
    const computerCenter = computer.y + paddleHeight / 2;
    const ballDistance = ball.y - computerCenter;
    
    // AI difficulty increases with time
    let speed = computer.speed + (gameState.difficulty - 1) * 1.5;
    
    if (Math.abs(ballDistance) > 10) {
        computer.dy = ballDistance > 0 ? speed : -speed;
        computer.y += computer.dy;
    }
    
    // Boundary checking
    if (computer.y < 0) computer.y = 0;
    if (computer.y + paddleHeight > CANVAS.height) {
        computer.y = CANVAS.height - paddleHeight;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > CANVAS.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : CANVAS.height - ball.size;
    }
    
    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on paddle movement
        const paddleCenter = player.y + paddleHeight / 2;
        const collidePoint = ball.y - paddleCenter;
        ball.dy = (collidePoint / (paddleHeight / 2)) * (ball.speed + gameState.difficulty);
    }
    
    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        const paddleCenter = computer.y + paddleHeight / 2;
        const collidePoint = ball.y - paddleCenter;
        ball.dy = (collidePoint / (paddleHeight / 2)) * (ball.speed + gameState.difficulty);
    }
    
    // Scoring
    if (ball.x < 0) {
        gameState.computerScore++;
        updateScore();
        resetBall();
    }
    if (ball.x > CANVAS.width) {
        gameState.playerScore++;
        updateScore();
        resetBall();
    }
}

function resetBall() {
    ball.x = CANVAS.width / 2;
    ball.y = CANVAS.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * (ball.speed + (gameState.difficulty - 1) * 0.5);
    ball.dy = (Math.random() - 0.5) * (ball.speed + (gameState.difficulty - 1) * 0.5);
}

function draw() {
    // Clear canvas
    CTX.fillStyle = '#000';
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
    
    // Draw center line
    CTX.strokeStyle = '#fff';
    CTX.setLineDash([10, 10]);
    CTX.beginPath();
    CTX.moveTo(CANVAS.width / 2, 0);
    CTX.lineTo(CANVAS.width / 2, CANVAS.height);
    CTX.stroke();
    CTX.setLineDash([]);
    
    // Draw paddles
    CTX.fillStyle = '#fff';
    CTX.fillRect(player.x, player.y, player.width, player.height);
    CTX.fillRect(computer.x, computer.y, computer.width, computer.height);
    
    // Draw ball
    CTX.beginPath();
    CTX.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    CTX.fill();
}

function gameLoop() {
    if (!gameState.running) {
        draw();
        return;
    }
    
    if (gameState.paused) {
        draw();
        return;
    }
    
    // Update game state
    gameState.timeRemaining--;
    updateTimer();
    updateDifficulty();
    
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    
    draw();
    
    // Check win conditions
    if (checkWinner() || checkTimeUp()) {
        gameState.running = false;
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize
updateScore();
updateDifficulty();
updateTimer();
draw();
