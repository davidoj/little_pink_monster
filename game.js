// Little Pink Monster Game
// A fun game where you chase a pink monster!

// Get the canvas and button elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Set up the canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Call resize initially and whenever window resizes
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let gameStarted = false;
let score = 0;

// Player object (the chaser!)
const player = {
    x: 100,
    y: 100,
    size: 30,
    speed: 5,
    color: '#4169E1' // Royal blue
};

// Monster object (the one being chased!)
const monster = {
    x: 300,
    y: 300,
    size: 40,
    speed: 3,
    color: '#FF69B4', // Hot pink
    eyeSize: 8
};

// Handle keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Handle touch/mouse input for mobile
let touchX = null;
let touchY = null;

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0] || e;
    const rect = canvas.getBoundingClientRect();
    touchX = touch.clientX - rect.left;
    touchY = touch.clientY - rect.top;
}

canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', () => {
    touchX = null;
    touchY = null;
});

canvas.addEventListener('mousedown', handleTouch);
canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) handleTouch(e);
});
canvas.addEventListener('mouseup', () => {
    touchX = null;
    touchY = null;
});

// Start the game
startButton.addEventListener('click', () => {
    gameStarted = true;
    startScreen.style.display = 'none';
    gameLoop();
});

// Draw a character (player or monster)
function drawCharacter(character) {
    ctx.fillStyle = character.color;
    ctx.beginPath();
    ctx.arc(character.x, character.y, character.size, 0, Math.PI * 2);
    ctx.fill();
    
    // If it's the monster, draw cute eyes
    if (character === monster) {
        // Left eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(character.x - 10, character.y - 5, character.eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(character.x + 10, character.y - 5, character.eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(character.x - 10, character.y - 5, character.eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(character.x + 10, character.y - 5, character.eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(character.x, character.y + 5, 15, 0, Math.PI);
        ctx.stroke();
    }
}

// Update player position
function updatePlayer() {
    // Keyboard controls
    if (keys['arrowleft'] || keys['a']) player.x -= player.speed;
    if (keys['arrowright'] || keys['d']) player.x += player.speed;
    if (keys['arrowup'] || keys['w']) player.y -= player.speed;
    if (keys['arrowdown'] || keys['s']) player.y += player.speed;
    
    // Touch/mouse controls
    if (touchX !== null && touchY !== null) {
        const dx = touchX - player.x;
        const dy = touchY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            player.x += (dx / distance) * player.speed;
            player.y += (dy / distance) * player.speed;
        }
    }
    
    // Keep player on screen
    player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
}

// Update monster position (runs away from player!)
function updateMonster() {
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If player is close, run away!
    if (distance < 150) {
        monster.x -= (dx / distance) * monster.speed;
        monster.y -= (dy / distance) * monster.speed;
    }
    
    // Add some random movement for fun
    monster.x += (Math.random() - 0.5) * 2;
    monster.y += (Math.random() - 0.5) * 2;
    
    // Keep monster on screen
    monster.x = Math.max(monster.size, Math.min(canvas.width - monster.size, monster.x));
    monster.y = Math.max(monster.size, Math.min(canvas.height - monster.size, monster.y));
}

// Check if player caught the monster
function checkCollision() {
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < player.size + monster.size) {
        score++;
        // Move monster to random position
        monster.x = Math.random() * (canvas.width - monster.size * 2) + monster.size;
        monster.y = Math.random() * (canvas.height - monster.size * 2) + monster.size;
    }
}

// Draw the score
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 20, 40);
}

// Main game loop
function gameLoop() {
    if (!gameStarted) return;
    
    // Clear the canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update game objects
    updatePlayer();
    updateMonster();
    checkCollision();
    
    // Draw everything
    drawCharacter(monster);
    drawCharacter(player);
    drawScore();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Instructions for debugging
console.log('Little Pink Monster Game loaded!');
console.log('Use arrow keys or WASD to move, or touch/click on mobile');
console.log('Chase the pink monster to score points!');