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
let debugMode = true; // Toggle with 'B' key to show collision boundaries

// Platformer physics
const GRAVITY = 0.8;
const JUMP_STRENGTH = -35;
const MAX_FALL_SPEED = 12;

// World and camera
let worldWidth = 0;
let worldHeight = 0;
let cameraX = 0;
let platforms = [];

// Load sprite images and background
const sprites = {
    girl: new Image(),
    pinkMonster: new Image(),
    greenMonster: new Image()
};

const background = new Image();
background.src = 'images/background.png';

sprites.girl.src = 'images/littlegirl.png';
sprites.pinkMonster.src = 'images/pinkmonster.png';
sprites.greenMonster.src = 'images/greenmonster.png';

// Wait for all images to load
let imagesLoaded = 0;
const totalImages = 4; // sprites + background

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
background.onload = imageLoaded;

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
    speed: 8,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
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
    speed: 7,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
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
    speed: 6,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
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
    const key = e.key.toLowerCase();
    keys[key] = true;
    
    // Toggle debug mode with 'B' key
    if (key === 'b') {
        debugMode = !debugMode;
        console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
    }
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

// Auto-detected platforms from background image
function detectPlatforms() {
    console.log('Loading and scaling pre-computed platforms...');
    
    // Original platforms detected from background image
    const originalPlatforms = [
        {x: 0, y: 62, width: 1130, height: 62},
        {x: 3540, y: 256, width: 520, height: 64},
        {x: 1469, y: 260, width: 819, height: 74},
        {x: 4384, y: 335, width: 312, height: 19},
        {x: 0, y: 359, width: 454, height: 45},
        {x: 4880, y: 359, width: 703, height: 32},
        {x: 3580, y: 440, width: 544, height: 62},
        {x: 2448, y: 519, width: 819, height: 45},
        {x: 4777, y: 619, width: 859, height: 21},
        {x: 0, y: 1004, width: 5760, height: 76}
    ];
    
    // Calculate the same scale factor used for drawing the background
    const backgroundScale = canvas.height / background.naturalHeight;
    console.log(`Background scale factor: ${backgroundScale} (canvas: ${canvas.height}, image: ${background.naturalHeight})`);
    
    // Scale all platform coordinates to match the drawn background
    platforms = originalPlatforms.map(platform => ({
        x: platform.x * backgroundScale,
        y: platform.y * backgroundScale,
        width: platform.width * backgroundScale,
        height: platform.height * backgroundScale
    }));
    
    console.log(`Loaded and scaled ${platforms.length} platforms`);
    console.log('First platform:', platforms[0]);
}

// Start the game
startButton.addEventListener('click', () => {
    gameStarted = true;
    startScreen.style.display = 'none';
    
    // Set world dimensions based on scaled background
    if (background.complete) {
        const backgroundScale = canvas.height / background.naturalHeight;
        worldWidth = background.naturalWidth * backgroundScale;
        worldHeight = canvas.height; // Use canvas height since background is scaled to fit
        detectPlatforms();
    }
    
    // Set sprite dimensions after images are loaded (with scaling)
    if (sprites.girl.complete && sprites.girl.naturalHeight > 0) {
        player.height = sprites.girl.naturalHeight * SPRITE_SCALE; // Full height
        player.width = (sprites.girl.naturalWidth / player.frameCount) * SPRITE_SCALE * 0.7; // Narrower width
        player.visualWidth = (sprites.girl.naturalWidth / player.frameCount) * SPRITE_SCALE; // Full visual width
    }
    if (sprites.pinkMonster.complete && sprites.pinkMonster.naturalHeight > 0) {
        pinkMonster.height = sprites.pinkMonster.naturalHeight * SPRITE_SCALE; // Full height
        pinkMonster.width = (sprites.pinkMonster.naturalWidth / pinkMonster.frameCount) * SPRITE_SCALE * 0.7; // Narrower width
        pinkMonster.visualWidth = (sprites.pinkMonster.naturalWidth / pinkMonster.frameCount) * SPRITE_SCALE; // Full visual width
    }
    if (sprites.greenMonster.complete && sprites.greenMonster.naturalHeight > 0) {
        greenMonster.height = sprites.greenMonster.naturalHeight * SPRITE_SCALE; // Full height
        greenMonster.width = (sprites.greenMonster.naturalWidth / greenMonster.frameCount) * SPRITE_SCALE * 0.7; // Narrower width
        greenMonster.visualWidth = (sprites.greenMonster.naturalWidth / greenMonster.frameCount) * SPRITE_SCALE; // Full visual width
    }
    
    // Position characters on the ground
    player.y = worldHeight - 100; // Start near ground
    pinkMonster.y = worldHeight - 200;
    greenMonster.y = worldHeight - 150;
    
    gameLoop();
});

// Check collision between character and platforms
function checkPlatformCollision(character) {
    const characterRect = {
        x: character.x - character.width/2,
        y: character.y - character.height/2,
        width: character.width,
        height: character.height
    };
    
    character.onGround = false;
    
    for (const platform of platforms) {
        // Check if character overlaps with platform
        if (characterRect.x < platform.x + platform.width &&
            characterRect.x + characterRect.width > platform.x &&
            characterRect.y < platform.y + platform.height &&
            characterRect.y + characterRect.height > platform.y) {
            
            // Determine collision direction
            const overlapLeft = (characterRect.x + characterRect.width) - platform.x;
            const overlapRight = (platform.x + platform.width) - characterRect.x;
            const overlapTop = (characterRect.y + characterRect.height) - platform.y;
            const overlapBottom = (platform.y + platform.height) - characterRect.y;
            
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            
            if (minOverlap === overlapTop && character.velocityY >= 0) {
                // Landing on top of platform
                character.y = platform.y - character.height/2;
                character.velocityY = 0;
                character.onGround = true;
            } else if (minOverlap === overlapBottom && character.velocityY <= 0) {
                // Hitting platform from below
                character.y = platform.y + platform.height + character.height/2;
                character.velocityY = 0;
            } else if (minOverlap === overlapLeft && character.velocityX >= 0) {
                // Hitting platform from the left
                character.x = platform.x - character.width/2;
                character.velocityX = 0;
            } else if (minOverlap === overlapRight && character.velocityX <= 0) {
                // Hitting platform from the right
                character.x = platform.x + platform.width + character.width/2;
                character.velocityX = 0;
            }
        }
    }
}

// Apply physics to a character
function applyPhysics(character) {
    // Apply gravity
    if (!character.onGround) {
        character.velocityY += GRAVITY;
        if (character.velocityY > MAX_FALL_SPEED) {
            character.velocityY = MAX_FALL_SPEED;
        }
    }
    
    // Apply velocity
    character.x += character.velocityX;
    character.y += character.velocityY;
    
    // Check platform collisions
    checkPlatformCollision(character);
    
    // Keep character in world bounds
    character.x = Math.max(character.width/2, Math.min(worldWidth - character.width/2, character.x));
    
    // Ground collision (bottom of world)
    if (character.y + character.height/2 >= worldHeight) {
        character.y = worldHeight - character.height/2;
        character.velocityY = 0;
        character.onGround = true;
    }
    
    // Apply friction when on ground
    if (character.onGround) {
        character.velocityX *= 0.8;
    }
}

// Draw a sprite character (with camera offset)
function drawSprite(character) {
    if (!character.sprite.complete) return;
    
    // Calculate screen position relative to camera
    const screenX = character.x - cameraX;
    const screenY = character.y;
    
    // Only draw if character is on screen
    if (screenX > -character.width && screenX < canvas.width + character.width) {
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
        
        // Calculate source position in sprite sheet - use actual sprite dimensions
        const actualFrameWidth = character.sprite.naturalWidth / character.frameCount;
        const actualFrameHeight = character.sprite.naturalHeight;
        const sx = frameIndex * actualFrameWidth;
        
        // Use visual width if available (the full-size sprite display width)
        const visualWidth = character.visualWidth || (actualFrameWidth * SPRITE_SCALE);
        const visualHeight = character.height; // Already at correct scale
        
        // Draw the sprite centered at screen position
        ctx.drawImage(
            character.sprite,
            sx, 0, actualFrameWidth, actualFrameHeight,  // Source rectangle from sprite sheet
            screenX - visualWidth/2, 
            screenY - visualHeight/2, 
            visualWidth, visualHeight  // Destination rectangle (visual size)
        );
    }
}

// Update player position (platformer controls)
function updatePlayer() {
    // Store last position
    player.lastX = player.x;
    player.lastY = player.y;
    
    let horizontalMovement = false;
    
    // Horizontal movement (keyboard)
    if (keys['arrowleft'] || keys['a']) {
        player.velocityX = -player.speed;
        horizontalMovement = true;
    } else if (keys['arrowright'] || keys['d']) {
        player.velocityX = player.speed;
        horizontalMovement = true;
    }
    
    // Jumping (keyboard)
    if ((keys['arrowup'] || keys['w'] || keys[' ']) && player.onGround) {
        player.velocityY = JUMP_STRENGTH;
        player.onGround = false;
    }
    
    // Touch/mouse controls for mobile
    if (touchX !== null && touchY !== null) {
        const screenTouchX = touchX + cameraX; // Convert screen touch to world coordinates
        const dx = screenTouchX - player.x;
        
        if (Math.abs(dx) > 20) {
            player.velocityX = dx > 0 ? player.speed : -player.speed;
            horizontalMovement = true;
        }
        
        // Touch above player to jump
        if (touchY < player.y - 50 && player.onGround) {
            player.velocityY = JUMP_STRENGTH;
            player.onGround = false;
        }
    }
    
    // Apply physics
    applyPhysics(player);
    
    // Update camera to follow player
    const targetCameraX = player.x - canvas.width / 2;
    cameraX = Math.max(0, Math.min(worldWidth - canvas.width, targetCameraX));
    
    // Update moving state
    player.isMoving = horizontalMovement;
}

// Check if monster is approaching a platform edge
function detectPlatformEdge(monster) {
    if (!monster.onGround) return null;
    
    // Find current platform
    let currentPlatform = null;
    const monsterBottom = monster.y + monster.height/2;
    
    for (const platform of platforms) {
        if (monster.x >= platform.x && 
            monster.x <= platform.x + platform.width &&
            Math.abs(monsterBottom - platform.y) < 10) {
            currentPlatform = platform;
            break;
        }
    }
    
    if (!currentPlatform) return null;
    
    // Check if approaching edge based on velocity direction
    const movingRight = monster.velocityX > 0;
    const movingLeft = monster.velocityX < 0;
    
    if (movingRight) {
        const distanceToEdge = (currentPlatform.x + currentPlatform.width) - monster.x;
        // Look for platform to jump to on the right
        for (const platform of platforms) {
            if (platform === currentPlatform) continue;
            const gap = platform.x - (currentPlatform.x + currentPlatform.width);
            const heightDiff = currentPlatform.y - platform.y;
            
            // Platform is to the right, within jump distance, and not too high
            if (gap > 0 && gap < 300 && Math.abs(heightDiff) < 200) {
                // Calculate buffer based on speed and height difference
                const buffer = Math.max(80, Math.min(200, monster.speed * 15 + Math.abs(heightDiff) * 0.5));
                if (distanceToEdge < buffer) {
                    return { shouldJump: true, jumpStrength: heightDiff > 0 ? 1.0 : 1.2 };
                }
            }
        }
    } else if (movingLeft) {
        const distanceToEdge = monster.x - currentPlatform.x;
        // Look for platform to jump to on the left
        for (const platform of platforms) {
            if (platform === currentPlatform) continue;
            const gap = currentPlatform.x - (platform.x + platform.width);
            const heightDiff = currentPlatform.y - platform.y;
            
            // Platform is to the left, within jump distance, and not too high
            if (gap > 0 && gap < 300 && Math.abs(heightDiff) < 200) {
                // Calculate buffer based on speed and height difference
                const buffer = Math.max(80, Math.min(200, monster.speed * 15 + Math.abs(heightDiff) * 0.5));
                if (distanceToEdge < buffer) {
                    return { shouldJump: true, jumpStrength: heightDiff > 0 ? 1.0 : 1.2 };
                }
            }
        }
    }
    
    return null;
}

// Check if there's a platform the monster can jump to
function detectPlatformToJump(monster) {
    // Look for platforms above and nearby
    const monsterRect = {
        x: monster.x - monster.width/2,
        y: monster.y - monster.height/2,
        width: monster.width,
        height: monster.height
    };
    
    for (const platform of platforms) {
        // Check if platform is above and reachable
        const platformAbove = platform.y < monsterRect.y && 
                            platform.y > monsterRect.y - 250; // Increased jump range
        const platformNearby = Math.abs(platform.x - monster.x) < 350 || 
                              Math.abs((platform.x + platform.width) - monster.x) < 350;
        
        if (platformAbove && platformNearby && monster.onGround) {
            // Check horizontal alignment
            const needsToMoveRight = monster.x < platform.x;
            const needsToMoveLeft = monster.x > platform.x + platform.width;
            
            if (needsToMoveRight || needsToMoveLeft) {
                // Move towards the platform
                monster.velocityX = needsToMoveRight ? monster.speed : -monster.speed;
                
                // Jump if close enough horizontally
                const horizontalDistance = needsToMoveRight ? 
                    platform.x - monster.x : 
                    monster.x - (platform.x + platform.width);
                    
                if (Math.abs(horizontalDistance) < 150) {
                    const heightDiff = monsterRect.y - platform.y;
                    // Adjust jump strength based on height
                    return { shouldJump: true, jumpStrength: Math.min(1.3, 1.0 + heightDiff / 400) };
                }
            } else if (monster.x >= platform.x && monster.x <= platform.x + platform.width) {
                // Already aligned, just jump
                return { shouldJump: true, jumpStrength: 1.1 };
            }
        }
    }
    return null;
}

// Update monster position (platformer AI)
function updateMonster(monster) {
    // Store last position
    monster.lastX = monster.x;
    monster.lastY = monster.y;
    
    const dx = player.x - monster.x;
    const distance = Math.abs(dx);
    
    // Check for platform edges and platforms to jump to
    const edgeDetection = detectPlatformEdge(monster);
    const platformJump = detectPlatformToJump(monster);
    
    // If player is close, run away horizontally and try to jump!
    if (distance < 250) {
        // Run away horizontally at full speed
        if (dx > 0) {
            monster.velocityX = -monster.speed; // Run left
        } else {
            monster.velocityX = monster.speed;  // Run right
        }
        
        // Smart jumping logic
        if (monster.onGround) {
            let shouldJump = false;
            let jumpPower = 1.1;
            
            // Check edge detection first (50% chance)
            if (edgeDetection && Math.random() < 0.5) {
                shouldJump = true;
                jumpPower = edgeDetection.jumpStrength;
            }
            // Then check platform jumping
            else if (platformJump) {
                shouldJump = true;
                jumpPower = platformJump.jumpStrength;
            }
            // Escape jump when very close
            else if (distance < 100 && Math.random() < 0.15) {
                shouldJump = true;
                jumpPower = 1.0;
            }
            
            if (shouldJump) {
                monster.velocityY = JUMP_STRENGTH * jumpPower;
                monster.onGround = false;
            }
        }
        
        monster.isMoving = true;
    } else {
        // Random wandering when player is far away
        if (!monster.randomDirection || Math.random() < 0.02) {
            monster.randomDirection = Math.random() < 0.5 ? -1 : 1;
        }
        monster.velocityX = monster.randomDirection * monster.speed * 0.5;
        
        // Smart platform navigation even when wandering
        if (monster.onGround) {
            let shouldJump = false;
            let jumpPower = 0.8;
            
            // Edge detection with 50% chance
            if (edgeDetection && Math.random() < 0.5) {
                shouldJump = true;
                jumpPower = edgeDetection.jumpStrength;
            }
            // Platform jumping
            else if (platformJump) {
                shouldJump = true;
                jumpPower = platformJump.jumpStrength;
            }
            // Random fun jump
            else if (Math.random() < 0.01) {
                shouldJump = true;
                jumpPower = 0.6;
            }
            
            if (shouldJump) {
                monster.velocityY = JUMP_STRENGTH * jumpPower;
                monster.onGround = false;
            }
        }
        
        monster.isMoving = Math.abs(monster.velocityX) > 0.1;
    }
    
    // Apply physics
    applyPhysics(monster);
}

// Check if player caught a monster
function checkCollisions() {
    monsters.forEach(monster => {
        const dx = player.x - monster.x;
        const dy = player.y - monster.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (player.width + monster.width) / 3) {
            score++;
            // Move monster to random position in the world
            monster.x = Math.random() * (worldWidth - monster.width) + monster.width/2;
            monster.y = worldHeight - 200; // Start above ground
            monster.velocityX = 0;
            monster.velocityY = 0;
        }
    });
}

// Draw the score
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('Score: ' + score, 20, 40);
    
    // Show debug mode status
    if (debugMode) {
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.fillText('DEBUG MODE (Press B to toggle)', 20, 65);
    }
}

// Draw collision boundaries for debugging
function drawDebugInfo() {
    if (!debugMode) return;
    
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    
    // Draw player collision box
    ctx.strokeRect(
        player.x - cameraX - player.width/2,
        player.y - player.height/2,
        player.width,
        player.height
    );
    
    // Draw monster collision boxes
    monsters.forEach(monster => {
        const screenX = monster.x - cameraX;
        if (screenX > -monster.width && screenX < canvas.width + monster.width) {
            ctx.strokeStyle = 'orange';
            ctx.strokeRect(
                screenX - monster.width/2,
                monster.y - monster.height/2,
                monster.width,
                monster.height
            );
        }
    });
    
    // Draw platform collision boxes
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    platforms.forEach(platform => {
        const screenX = platform.x - cameraX;
        if (screenX < canvas.width && screenX + platform.width > 0) {
            ctx.strokeRect(
                screenX,
                platform.y,
                platform.width,
                platform.height
            );
        }
    });
    
    // Draw ground line
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, worldHeight);
    ctx.lineTo(canvas.width, worldHeight);
    ctx.stroke();
}

// Draw the scrolling background
function drawBackground() {
    if (!background.complete) return;
    
    // Calculate how much of the background to show
    const bgX = -cameraX;
    const bgY = 0;
    
    // Draw the background scaled to fit the screen height
    const scale = canvas.height / background.naturalHeight;
    const scaledWidth = background.naturalWidth * scale;
    
    ctx.drawImage(
        background,
        0, 0, background.naturalWidth, background.naturalHeight,
        bgX, bgY, scaledWidth, canvas.height
    );
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
    
    try {
        // Draw background first
        drawBackground();
        
        // Update game objects
        updatePlayer();
        monsters.forEach(updateMonster);
        checkCollisions();
        
        // Draw characters
        monsters.forEach(drawSprite);
        drawSprite(player);  // Draw player on top
        drawScore();
        
        // Draw debug info on top of everything
        drawDebugInfo();
        
        
    } catch (error) {
        console.error('Game loop error:', error);
    }
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Instructions for debugging
console.log('Little Pink Monster Platformer loaded!');
console.log('Use arrow keys/WASD to move left/right, UP/W/SPACE to jump');
console.log('On mobile: touch left/right to move, touch above character to jump');
console.log('Chase the monsters to score points!');