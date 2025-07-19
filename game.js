// Little Pink Monster Game
// A fun game where you chase monsters!

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
let animationTime = 0;

// Load sprite images
const sprites = {
    girl: new Image(),
    pinkMonster: new Image(),
    greenMonster: new Image()
};

sprites.girl.src = 'images/littlegirl.png';
sprites.pinkMonster.src = 'images/pinkmonster.png';
sprites.greenMonster.src = 'images/greenmonster.png';

// Wait for all images to load
let imagesLoaded = 0;
const totalImages = 3;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        console.log('All sprites loaded!');
        // Enable start button only after images load
        startButton.disabled = false;
        startButton.textContent = 'Start Game!';
    }
}

sprites.girl.onload = imageLoaded;
sprites.pinkMonster.onload = imageLoaded;
sprites.greenMonster.onload = imageLoaded;

// Disable start button until images load
startButton.disabled = true;
startButton.textContent = 'Loading...';

// Sprite scale factor (make sprites bigger!)
const SPRITE_SCALE = 2.5;  // 2.5x bigger

// Player object (the little girl!)
const player = {
    x: 100,
    y: 100,
    width: 64,  // Will be set based on sprite
    height: 64, // Will be set based on sprite
    speed: 5,
    sprite: sprites.girl,
    frameCount: 5,  // 1 still + 4 walking
    currentFrame: 0,
    isMoving: false,
    lastX: 100,
    lastY: 100
};

// Pink Monster object
const pinkMonster = {
    x: 300,
    y: 300,
    width: 64,
    height: 64,
    speed: 3,
    sprite: sprites.pinkMonster,
    frameCount: 2,  // 1 still + 1 walking
    currentFrame: 0,
    isMoving: false,
    lastX: 300,
    lastY: 300
};

// Green Monster object
const greenMonster = {
    x: 500,
    y: 200,
    width: 64,
    height: 64,
    speed: 2.5,
    sprite: sprites.greenMonster,
    frameCount: 5,  // 1 still + 4 walking
    currentFrame: 0,
    isMoving: false,
    lastX: 500,
    lastY: 200
};

// Array of all monsters
const monsters = [pinkMonster, greenMonster];

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
    
    // Set sprite dimensions after images are loaded (with scaling)
    if (sprites.girl.complete && sprites.girl.naturalHeight > 0) {
        player.height = sprites.girl.naturalHeight * SPRITE_SCALE;
        player.width = (sprites.girl.naturalWidth / player.frameCount) * SPRITE_SCALE;
    }
    if (sprites.pinkMonster.complete && sprites.pinkMonster.naturalHeight > 0) {
        pinkMonster.height = sprites.pinkMonster.naturalHeight * SPRITE_SCALE;
        pinkMonster.width = (sprites.pinkMonster.naturalWidth / pinkMonster.frameCount) * SPRITE_SCALE;
    }
    if (sprites.greenMonster.complete && sprites.greenMonster.naturalHeight > 0) {
        greenMonster.height = sprites.greenMonster.naturalHeight * SPRITE_SCALE;
        greenMonster.width = (sprites.greenMonster.naturalWidth / greenMonster.frameCount) * SPRITE_SCALE;
    }
    
    gameLoop();
});

// Draw a sprite character
function drawSprite(character) {
    if (!character.sprite.complete) return;
    
    // Determine which frame to show
    let frameIndex = 0;
    if (character.isMoving) {
        if (character === pinkMonster) {
            // Pink monster alternates between frame 0 and 1
            frameIndex = Math.floor(animationTime / 200) % 2;
        } else {
            // Girl and green monster use frames 1-4 for walking
            frameIndex = 1 + (Math.floor(animationTime / 150) % 4);
        }
    }
    
    // Calculate source position in sprite sheet
    const sourceWidth = character.width / SPRITE_SCALE;  // Original sprite width
    const sourceHeight = character.height / SPRITE_SCALE; // Original sprite height
    const sx = frameIndex * sourceWidth;
    
    // Draw the sprite centered at character position (scaled up)
    ctx.drawImage(
        character.sprite,
        sx, 0, sourceWidth, sourceHeight,  // Source rectangle (original size)
        character.x - character.width/2, 
        character.y - character.height/2, 
        character.width, character.height  // Destination rectangle (scaled size)
    );
}

// Update player position
function updatePlayer() {
    // Store last position
    player.lastX = player.x;
    player.lastY = player.y;
    
    let moved = false;
    
    // Keyboard controls
    if (keys['arrowleft'] || keys['a']) {
        player.x -= player.speed;
        moved = true;
    }
    if (keys['arrowright'] || keys['d']) {
        player.x += player.speed;
        moved = true;
    }
    if (keys['arrowup'] || keys['w']) {
        player.y -= player.speed;
        moved = true;
    }
    if (keys['arrowdown'] || keys['s']) {
        player.y += player.speed;
        moved = true;
    }
    
    // Touch/mouse controls
    if (touchX !== null && touchY !== null) {
        const dx = touchX - player.x;
        const dy = touchY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            player.x += (dx / distance) * player.speed;
            player.y += (dy / distance) * player.speed;
            moved = true;
        }
    }
    
    // Keep player on screen
    player.x = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.x));
    player.y = Math.max(player.height/2, Math.min(canvas.height - player.height/2, player.y));
    
    // Update moving state
    player.isMoving = moved;
}

// Update monster position
function updateMonster(monster) {
    // Store last position
    monster.lastX = monster.x;
    monster.lastY = monster.y;
    
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let targetMoveX = 0;
    let targetMoveY = 0;
    
    // If player is close, run away!
    if (distance < 150) {
        targetMoveX -= (dx / distance) * monster.speed;
        targetMoveY -= (dy / distance) * monster.speed;
    }
    
    // Add some random movement for fun (but less jerky)
    if (!monster.randomTargetX || Math.random() < 0.02) { // Change direction occasionally
        monster.randomTargetX = (Math.random() - 0.5) * 1.5;
        monster.randomTargetY = (Math.random() - 0.5) * 1.5;
    }
    targetMoveX += monster.randomTargetX;
    targetMoveY += monster.randomTargetY;
    
    // Apply movement
    monster.x += targetMoveX;
    monster.y += targetMoveY;
    
    // Keep monster on screen
    monster.x = Math.max(monster.width/2, Math.min(canvas.width - monster.width/2, monster.x));
    monster.y = Math.max(monster.height/2, Math.min(canvas.height - monster.height/2, monster.y));
    
    // Update moving state with hysteresis to prevent rapid switching
    const moveDistance = Math.sqrt(
        Math.pow(targetMoveX, 2) + 
        Math.pow(targetMoveY, 2)
    );
    
    // Use different thresholds for starting and stopping movement
    if (!monster.isMoving && moveDistance > 1.5) {
        monster.isMoving = true;
    } else if (monster.isMoving && moveDistance < 0.3) {
        monster.isMoving = false;
    }
}

// Check if player caught a monster
function checkCollisions() {
    monsters.forEach(monster => {
        const dx = player.x - monster.x;
        const dy = player.y - monster.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (player.width + monster.width) / 3) {
            score++;
            // Move monster to random position
            monster.x = Math.random() * (canvas.width - monster.width) + monster.width/2;
            monster.y = Math.random() * (canvas.height - monster.height) + monster.height/2;
        }
    });
}

// Draw the score
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('Score: ' + score, 20, 40);
}

// Draw loading message if images aren't ready
function drawLoading() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Loading sprites...', canvas.width/2, canvas.height/2);
    ctx.textAlign = 'left';
}

// Main game loop
function gameLoop(timestamp) {
    if (!gameStarted) return;
    
    // Update animation time
    if (timestamp) {
        animationTime = timestamp;
    }
    
    // Clear the canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Check if all images are loaded
    if (imagesLoaded < totalImages) {
        drawLoading();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Update game objects
    updatePlayer();
    monsters.forEach(updateMonster);
    checkCollisions();
    
    // Draw everything
    monsters.forEach(drawSprite);
    drawSprite(player);  // Draw player on top
    drawScore();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Instructions for debugging
console.log('Little Pink Monster Game loaded!');
console.log('Use arrow keys or WASD to move, or touch/click on mobile');
console.log('Chase the monsters to score points!');