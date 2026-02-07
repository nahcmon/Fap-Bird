const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');

canvas.width = 400;
canvas.height = 600;

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let frames = 0;

// Bird
const bird = {
    x: 100,
    y: 250,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jumpForce: -9,
    rotation: 0
};

// Pipes
const pipes = [];
const pipeWidth = 60;
const pipeGap = 180;
const pipeSpeed = 2;
let pipeTimer = 0;

// Particles (jizz effect)
const particles = [];

// Sound generation using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playFapSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playScoreSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

function playGameOverSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Create jizz particles
function createParticles() {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: bird.x + bird.width / 2,
            y: bird.y + bird.height / 2,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 6 + 3,
            life: 1,
            decay: Math.random() * 0.02 + 0.02
        });
    }
}

// Update and draw particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= p.decay;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Add slight shading
        ctx.fillStyle = `rgba(240, 240, 255, ${p.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw bird
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);

    // Bird body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bird outline
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.width / 4, -bird.height / 6, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.width / 4 + 2, -bird.height / 6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2, 0);
    ctx.lineTo(bird.width / 2 + 10, -3);
    ctx.lineTo(bird.width / 2 + 10, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Create pipe
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight - 100;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        scored: false
    });
}

// Draw pipes
function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Pipe cap (top)
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);

        // Bottom pipe
        const bottomY = pipe.topHeight + pipeGap;
        const bottomHeight = canvas.height - bottomY;
        ctx.fillRect(pipe.x, bottomY, pipeWidth, bottomHeight);
        ctx.strokeRect(pipe.x, bottomY, pipeWidth, bottomHeight);

        // Pipe cap (bottom)
        ctx.fillRect(pipe.x - 5, bottomY, pipeWidth + 10, 20);
        ctx.strokeRect(pipe.x - 5, bottomY, pipeWidth + 10, 20);
    });
}

// Update pipes
function updatePipes() {
    if (frames % 90 === 0) {
        createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        // Score when passing pipe
        if (!pipes[i].scored && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].scored = true;
            score++;
            scoreDisplay.textContent = score;
            playScoreSound();
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Collision detection
function checkCollision() {
    // Ground and ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        return true;
    }

    // Pipes
    for (let pipe of pipes) {
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + pipeGap) {
                return true;
            }
        }
    }

    return false;
}

// Update bird
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Update rotation based on velocity
    bird.rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.8);
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4ec0ca');
    gradient.addColorStop(0.5, '#87ceeb');
    gradient.addColorStop(0.5, '#deb887');
    gradient.addColorStop(1, '#d2b48c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing') {
        frames++;
        updateBird();
        updatePipes();
        updateParticles();

        if (checkCollision()) {
            gameState = 'gameOver';
            gameOverScreen.classList.remove('hidden');
            finalScoreDisplay.textContent = score;
            playGameOverSound();
        }
    }

    drawPipes();
    drawParticles();
    drawBird();

    requestAnimationFrame(gameLoop);
}

// Handle input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();

        if (gameState === 'start') {
            gameState = 'playing';
            startScreen.classList.add('hidden');
            bird.velocity = bird.jumpForce;
            createParticles();
            playFapSound();
        } else if (gameState === 'playing') {
            bird.velocity = bird.jumpForce;
            createParticles();
            playFapSound();
        } else if (gameState === 'gameOver') {
            // Reset game
            gameState = 'playing';
            gameOverScreen.classList.add('hidden');
            bird.y = 250;
            bird.velocity = 0;
            pipes.length = 0;
            particles.length = 0;
            score = 0;
            frames = 0;
            scoreDisplay.textContent = score;
            bird.velocity = bird.jumpForce;
            createParticles();
            playFapSound();
        }
    }
});

// Start game loop
gameLoop();
