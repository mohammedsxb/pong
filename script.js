// Game Constants
const GAME_DURATION = 5 * 60; // 5 minutes in seconds
const WIN_SCORE = 7;

let canvas, ctx;
let gameState = {
    running: false,
    paused: false,
    gameStarted: false,
    playerScore: 0,
    computerScore: 0,
    timeRemaining: GAME_DURATION,
    difficulty: 1
};

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

let player = {
    x: 20,
    y: 0,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

let computer = {
    x: 0,
    y: 0,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

let ball = {
    x: 0,
    y: 0,
    dx: 5,
    dy: 5,
    size: ballSize,
    speed: 5
};

const keys = {};
let mouseY = 0;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('pongCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize positions
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.x = canvas.width - 30;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Setup event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Initial draw
    updateScore();
    updateDifficulty();
    updateTimer();
    draw();
});

function handleKeyDown(e) {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        togglePause();
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

function handleMouseMove(e) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
}

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
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5;
    ball.dy = 5;
    
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    
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
    if (keys['ArrowUp']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown']) {
        player.y += player.speed;
    }
    
    const mouseDistance = mouseY - (player.y + paddleHeight / 2);
    if (Math.abs(mouseDistance) > 5) {
        player.y += mouseDistance * 0.15;
    }
    
    if (player.y < 0) player.y = 0;
    if (player.y + paddleHeight > canvas.height) {
        player.y = canvas.height - paddleHeight;
    }
}

function updateComputerPaddle() {
    const computerCenter = computer.y + paddleHeight / 2;
    const ballDistance = ball.y - computerCenter;
    
    let speed = computer.speed + (gameState.difficulty - 1) * 1.5;
    
    if (Math.abs(ballDistance) > 10) {
        computer.dy = ballDistance > 0 ? speed : -speed;
        computer.y += computer.dy;
    }
    
    if (computer.y < 0) computer.y = 0;
    if (computer.y + paddleHeight > canvas.height) {
        computer.y = canvas.height - paddleHeight;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }
    
    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = Math.abs(ball.dx);
        ball.x = player.x + player.width + ball.size;
        
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
        ball.dx = -Math.abs(ball.dx);
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
    if (ball.x > canvas.width) {
        gameState.playerScore++;
        updateScore();
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * (ball.speed + (gameState.difficulty - 1) * 0.5);
    ball.dy = (Math.random() - 0.5) * (ball.speed + (gameState.difficulty - 1) * 0.5);
}

function draw() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
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
