// Game constants
const TILE_SIZE = 16; // Each tile is 16x16 pixels
const SCALE = 1;      // Scale factor for rendering
const MIN_JUMP_VELOCITY = -200; // Minimum jump velocity when releasing jump key early

// Map dimensions
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 240;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // Keep pixel art crisp

// Game state
let gameRunning = true;
let score = 0;
let lives = 3;

// Character properties
const character = {
    width: 16,
    height: 24,
    pos_x: 50,
    pos_y: 200,
    vel_x: 0,
    vel_y: 0,
    speed: 150,
    jumpSpeed: -350,
    gravity: 800,
    onGround: false,
    facingRight: true,
    sprite: null,
    animationFrame: 0,
    animationTimer: 0,
    canJump: true,  // Flag to prevent jump spamming
    jumpCooldown: 0, // Cooldown timer for jump
    forceJump: false // Direct flag to force a jump
};

// Camera properties
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

// Input handling - simplified
const keys = {
    left: false,
    right: false,
    jump: false,
    jumpJustPressed: false
};

// Key codes for different browsers
const KEY_CODES = {
    LEFT: ['ArrowLeft', 'KeyA'],
    RIGHT: ['ArrowRight', 'KeyD'],
    JUMP: ['Space', 'ArrowUp', 'KeyW']
};

// Game objects
let map = [];
let collectibles = [];
let enemies = [];

// Initialize the game
function init() {
    console.log("Initializing game...");
    
    // Reset game state
    gameRunning = true;
    score = 0;
    lives = 3;
    
    // Reset character position and state
    character.pos_x = 50;
    character.pos_y = 200;
    character.vel_x = 0;
    character.vel_y = 0;
    character.onGround = false;
    character.canJump = true;
    character.jumpCooldown = 0;
    character.facingRight = true;
    
    // Reset input state
    keys.left = false;
    keys.right = false;
    keys.jump = false;
    keys.jumpJustPressed = false;
    
    // Create map
    createMap();
    
    // Create collectibles
    createCollectibles();
    
    // Create enemies
    createEnemies();
    
    // Load character sprite
    character.sprite = createCharacterSprite();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start game loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    
    console.log("Game initialized");
}

// Create the game map
function createMap() {
    // Initialize map as a 2D array
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = { type: 'empty', solid: false, color: '#000' };
        }
    }
    
    // Create ground
    for (let x = 0; x < MAP_WIDTH; x++) {
        map[MAP_HEIGHT - 1][x] = { type: 'ground', solid: true, color: '#8B4513' };
        map[MAP_HEIGHT - 2][x] = { type: 'grass', solid: true, color: '#228B22' };
    }
    
    // Create platforms
    createPlatform(100, 180, 150);
    createPlatform(300, 150, 100);
    createPlatform(450, 120, 80);
    createPlatform(600, 150, 120);
    
    // Create a hole in the ground
    for (let x = 300; x <= 350; x++) {
        map[MAP_HEIGHT - 1][x] = { type: 'empty', solid: false, color: '#000' };
        map[MAP_HEIGHT - 2][x] = { type: 'empty', solid: false, color: '#000' };
    }
    
    // Create another hole
    for (let x = 500; x <= 530; x++) {
        map[MAP_HEIGHT - 1][x] = { type: 'empty', solid: false, color: '#000' };
        map[MAP_HEIGHT - 2][x] = { type: 'empty', solid: false, color: '#000' };
    }
}

// Create a platform at the specified position
function createPlatform(x, y, width) {
    for (let i = 0; i < width; i++) {
        map[y][x + i] = { type: 'platform', solid: true, color: '#8B4513' };
    }
}

// Create collectible items
function createCollectibles() {
    // Add coins at various positions
    addCollectible(150, 160, 'coin');
    addCollectible(170, 160, 'coin');
    addCollectible(190, 160, 'coin');
    
    addCollectible(320, 130, 'coin');
    addCollectible(340, 130, 'coin');
    addCollectible(360, 130, 'coin');
    
    addCollectible(470, 100, 'coin');
    addCollectible(480, 100, 'coin');
    addCollectible(490, 100, 'coin');
    
    addCollectible(650, 130, 'coin');
    addCollectible(670, 130, 'coin');
}

// Add a collectible item
function addCollectible(x, y, type) {
    collectibles.push({
        x: x,
        y: y,
        width: 8,
        height: 8,
        type: type,
        collected: false,
        animationFrame: 0,
        animationTimer: 0
    });
}

// Create enemies
function createEnemies() {
    // Add enemies at various positions
    addEnemy(200, 238 - 16, 'slime', 150, 250);
    addEnemy(400, 238 - 16, 'robot', 380, 480);
    addEnemy(650, 148 - 16, 'bat', 600, 700);
}

// Add an enemy
function addEnemy(x, y, type, leftBound, rightBound) {
    enemies.push({
        x: x,
        y: y,
        width: 16,
        height: 16,
        type: type,
        vel_x: 50,
        vel_y: 0,
        leftBound: leftBound,
        rightBound: rightBound,
        facingRight: true,
        animationFrame: 0,
        animationTimer: 0
    });
}

// Create a simple character sprite
function createCharacterSprite() {
    const sprite = [];
    
    // Standing frame - more detailed character
    sprite[0] = [];
    for (let y = 0; y < character.height; y++) {
        sprite[0][y] = [];
        for (let x = 0; x < character.width; x++) {
            sprite[0][y][x] = null; // Start with transparent pixels
        }
    }
    
    // Head (helmet)
    const headColor = '#4287f5'; // Blue helmet
    const faceColor = '#FFD700'; // Gold face plate
    const skinColor = '#FFC0CB'; // Pink skin
    const bodyColor = '#FF4500'; // Orange-red body
    const armorColor = '#C0C0C0'; // Silver armor
    const legColor = '#0000CD'; // Dark blue legs
    const bootColor = '#8B4513'; // Brown boots
    
    // Helmet top
    for (let x = 3; x < 13; x++) {
        sprite[0][1][x] = headColor;
    }
    for (let x = 2; x < 14; x++) {
        sprite[0][2][x] = headColor;
    }
    
    // Helmet middle and face
    for (let y = 3; y < 7; y++) {
        for (let x = 1; x < 15; x++) {
            sprite[0][y][x] = headColor;
        }
        // Face area
        for (let x = 4; x < 12; x++) {
            sprite[0][y][x] = faceColor;
        }
    }
    
    // Eyes
    sprite[0][4][5] = '#000000';
    sprite[0][4][10] = '#000000';
    
    // Body
    for (let y = 7; y < 16; y++) {
        for (let x = 2; x < 14; x++) {
            sprite[0][y][x] = bodyColor;
        }
    }
    
    // Armor plates
    for (let y = 8; y < 12; y++) {
        for (let x = 4; x < 12; x++) {
            sprite[0][y][x] = armorColor;
        }
    }
    
    // Belt
    for (let x = 2; x < 14; x++) {
        sprite[0][15][x] = '#000000';
    }
    
    // Legs
    for (let y = 16; y < 20; y++) {
        // Left leg
        for (let x = 3; x < 7; x++) {
            sprite[0][y][x] = legColor;
        }
        // Right leg
        for (let x = 9; x < 13; x++) {
            sprite[0][y][x] = legColor;
        }
    }
    
    // Boots
    for (let y = 20; y < 24; y++) {
        // Left boot
        for (let x = 2; x < 7; x++) {
            sprite[0][y][x] = bootColor;
        }
        // Right boot
        for (let x = 9; x < 14; x++) {
            sprite[0][y][x] = bootColor;
        }
    }
    
    // Walking frame 1 - legs slightly apart
    sprite[1] = JSON.parse(JSON.stringify(sprite[0]));
    
    // Modify legs for walking frame 1
    for (let y = 16; y < 20; y++) {
        // Clear existing legs
        for (let x = 3; x < 13; x++) {
            sprite[1][y][x] = null;
        }
        
        // Left leg (moved left)
        for (let x = 2; x < 6; x++) {
            sprite[1][y][x] = legColor;
        }
        // Right leg (moved right)
        for (let x = 10; x < 14; x++) {
            sprite[1][y][x] = legColor;
        }
    }
    
    // Modify boots for walking frame 1
    for (let y = 20; y < 24; y++) {
        // Clear existing boots
        for (let x = 2; x < 14; x++) {
            sprite[1][y][x] = null;
        }
        
        // Left boot (moved left)
        for (let x = 1; x < 6; x++) {
            sprite[1][y][x] = bootColor;
        }
        // Right boot (moved right)
        for (let x = 10; x < 15; x++) {
            sprite[1][y][x] = bootColor;
        }
    }
    
    // Walking frame 2 - legs crossed
    sprite[2] = JSON.parse(JSON.stringify(sprite[0]));
    
    // Modify legs for walking frame 2
    for (let y = 16; y < 20; y++) {
        // Clear existing legs
        for (let x = 3; x < 13; x++) {
            sprite[2][y][x] = null;
        }
        
        // Left leg (moved right)
        for (let x = 5; x < 9; x++) {
            sprite[2][y][x] = legColor;
        }
        // Right leg (moved left)
        for (let x = 7; x < 11; x++) {
            sprite[2][y][x] = legColor;
        }
    }
    
    // Modify boots for walking frame 2
    for (let y = 20; y < 24; y++) {
        // Clear existing boots
        for (let x = 2; x < 14; x++) {
            sprite[2][y][x] = null;
        }
        
        // Left boot (moved right)
        for (let x = 4; x < 9; x++) {
            sprite[2][y][x] = bootColor;
        }
        // Right boot (moved left)
        for (let x = 7; x < 12; x++) {
            sprite[2][y][x] = bootColor;
        }
    }
    
    return sprite;
}

// Set up event listeners
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Clear any existing event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    
    // Set up keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Set up button controls
    setupButtonControls();
    
    console.log("Event listeners set up");
}

// Handle key down events
function handleKeyDown(e) {
    console.log('Key down:', e.code);
    
    // Prevent default for game controls
    if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW'].includes(e.code)) {
        e.preventDefault();
    }
    
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keys.left = true;
    }
    else if(e.code === 'ArrowRight' || e.code === 'KeyD') {
        keys.right = true;
    }
    else if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        // Use the direct jump method that works for the button
        console.log("Jump key pressed, calling doJump()");
        doJump();
        
        // Still set the key state for variable jump height
        keys.jump = true;
    }
    else if(e.code === 'KeyR') {
        resetGame();
    }
}

// Handle key up events
function handleKeyUp(e) {
    console.log('Key up:', e.code);
    
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keys.left = false;
    }
    else if(e.code === 'ArrowRight' || e.code === 'KeyD') {
        keys.right = false;
    }
    else if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        keys.jump = false;
    }
}

// Set up button controls
function setupButtonControls() {
    console.log("Setting up button controls...");
    
    const leftBtn = document.getElementById('btn-left');
    const rightBtn = document.getElementById('btn-right');
    const jumpBtn = document.getElementById('btn-jump');
    
    if(!leftBtn || !rightBtn || !jumpBtn) {
        console.error("Could not find game buttons!");
        return;
    }
    
    // Left button
    leftBtn.addEventListener('mousedown', function() {
        keys.left = true;
    });
    leftBtn.addEventListener('mouseup', function() {
        keys.left = false;
    });
    leftBtn.addEventListener('mouseleave', function() {
        keys.left = false;
    });
    leftBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        keys.left = true;
    });
    leftBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        keys.left = false;
    });
    
    // Right button
    rightBtn.addEventListener('mousedown', function() {
        keys.right = true;
    });
    rightBtn.addEventListener('mouseup', function() {
        keys.right = false;
    });
    rightBtn.addEventListener('mouseleave', function() {
        keys.right = false;
    });
    rightBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        keys.right = true;
    });
    rightBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        keys.right = false;
    });
    
    // Jump button - using direct jump method
    jumpBtn.addEventListener('click', function() {
        console.log("Jump button clicked!");
        doJump();
    });
    jumpBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        console.log("Jump button touched!");
        doJump();
    });
    
    console.log("Button controls set up");
}

// Direct jump function
function doJump() {
    console.log("doJump called, onGround =", character.onGround, "canJump =", character.canJump);
    
    if (character.onGround && character.canJump) {
        console.log("JUMPING via direct method!");
        character.vel_y = character.jumpSpeed;
        character.onGround = false;
        character.canJump = false;
        character.jumpCooldown = 0.3;
        character.pos_y -= 1; // Small boost to ensure leaving ground
        character.forceJump = true;
    }
}

// Reset the game
function resetGame() {
    character.pos_x = 50;
    character.pos_y = 200;
    character.vel_x = 0;
    character.vel_y = 0;
    score = 0;
    lives = 3;
    gameRunning = true;
    
    // Reset collectibles
    collectibles.forEach(c => c.collected = false);
}

// Game timing
let lastTime = 0;

// Main game loop
function gameLoop(timestamp) {
    // Calculate time delta
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    // Cap delta time to prevent large jumps
    const dt = Math.min(deltaTime, 0.1);
    
    if (gameRunning) {
        update(dt);
    }
    
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(dt) {
    updateCharacter(dt);
    updateEnemies(dt);
    updateCollectibles(dt);
    updateCamera();
    checkCollisions();
}

// Update character position and state
function updateCharacter(dt) {
    // Handle user input
    if (keys.left) {
        character.vel_x = -character.speed;
        character.facingRight = false;
    } else if (keys.right) {
        character.vel_x = character.speed;
        character.facingRight = true;
    } else {
        character.vel_x = 0;
    }

    // Update jump cooldown
    if (character.jumpCooldown > 0) {
        character.jumpCooldown -= dt;
        if (character.jumpCooldown <= 0) {
            character.canJump = true;
        }
    }

    // Check if character is on ground with a small buffer for better ground detection
    const groundBuffer = 2; // 2 pixels below the character
    
    // Store previous ground state to detect landing
    const wasOnGround = character.onGround;
    
    // Update ground state
    character.onGround = checkGroundContact(character.pos_x, character.pos_y + groundBuffer);
    
    // If character just landed, reset jump ability
    if (!wasOnGround && character.onGround) {
        character.canJump = true;
        console.log('Character landed, can jump again');
    }
    
    // Debug logging for jump conditions
    if (keys.jump) {
        console.log('Jump key is active, onGround =', character.onGround, 'canJump =', character.canJump);
    }
    
    // Handle jumping - using forceJump flag set by doJump()
    if (character.forceJump) {
        // Reset force jump flag
        character.forceJump = false;
    }
    
    // Variable jump height - if jump key is released while still moving upward, reduce upward velocity
    if (!keys.jump && character.vel_y < 0) {
        // Cap the upward velocity to allow for variable jump height
        character.vel_y = Math.max(character.vel_y, MIN_JUMP_VELOCITY);
    }

    // Apply gravity
    character.vel_y += character.gravity * dt;

    // Update position with collision detection
    // First move horizontally, then vertically for better collision handling
    moveWithCollision(dt);
    
    // Check if character fell off the map
    if (character.pos_y > MAP_HEIGHT) {
        loseLife();
    }
    
    // Update animation
    character.animationTimer += dt;
    if (character.animationTimer > 0.1) {
        character.animationTimer = 0;
        if (character.vel_x !== 0) {
            character.animationFrame = (character.animationFrame + 1) % 3;
        } else {
            character.animationFrame = 0;
        }
    }
}

// Move character with collision detection
function moveWithCollision(dt) {
    // Calculate new positions
    const newPosX = character.pos_x + character.vel_x * dt;
    const newPosY = character.pos_y + character.vel_y * dt;
    
    // Horizontal movement with collision detection
    const horizontalCollision = checkHorizontalCollision(newPosX, character.pos_y);
    if (!horizontalCollision) {
        character.pos_x = newPosX;
    } else {
        character.vel_x = 0; // Stop horizontal movement on collision
    }
    
    // Vertical movement with collision detection
    const verticalCollision = checkVerticalCollision(character.pos_x, newPosY);
    if (!verticalCollision) {
        character.pos_y = newPosY;
        if (character.vel_y > 0) {
            character.onGround = false;
        }
    } else {
        if (character.vel_y > 0) {
            character.onGround = true;
        }
        character.vel_y = 0; // Stop vertical movement on collision
    }
}

// Check if character is in contact with the ground
function checkGroundContact(x, y) {
    const left = Math.floor(x);
    const right = Math.floor(x + character.width - 1);
    const bottom = Math.floor(y + character.height);
    
    // Reduce debug logging to avoid console spam
    // console.log('Checking ground contact at bottom =', bottom);
    
    // Check multiple points along the bottom of the character
    const checkPoints = Math.max(5, right - left + 1);
    
    // First check the center point for efficiency
    const centerX = Math.floor(left + (right - left) / 2);
    if (centerX >= 0 && centerX < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
        if (map[bottom] && map[bottom][centerX] && map[bottom][centerX].solid) {
            return true;
        }
    }
    
    // Then check other points
    for (let i = 0; i < checkPoints; i++) {
        const checkX = Math.floor(left + (i * (right - left) / (checkPoints - 1)));
        
        // Skip the center point as we already checked it
        if (checkX === centerX) continue;
        
        // Make sure we're checking valid map coordinates
        if (checkX >= 0 && checkX < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
            if (map[bottom] && map[bottom][checkX] && map[bottom][checkX].solid) {
                return true;
            }
        }
    }
    
    // Also check the exact edges for better ground detection
    if (left >= 0 && left < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
        if (map[bottom] && map[bottom][left] && map[bottom][left].solid) {
            return true;
        }
    }
    
    if (right >= 0 && right < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
        if (map[bottom] && map[bottom][right] && map[bottom][right].solid) {
            return true;
        }
    }
    
    return false;
}

// Check for horizontal collisions
function checkHorizontalCollision(newX, y) {
    // Use more precise collision detection with floating point values
    const top = Math.floor(y);
    const bottom = Math.floor(y + character.height - 1);
    
    // Check more points along the character's height for better collision detection
    const checkPoints = Math.max(5, bottom - top + 1); // At least 5 check points
    
    if (character.vel_x > 0) { // Moving right
        // Right collision (right wall)
        const right = Math.floor(newX + character.width);
        
        // First check the center point for efficiency
        const centerY = Math.floor(top + (bottom - top) / 2);
        if (right >= 0 && right < MAP_WIDTH && centerY >= 0 && centerY < MAP_HEIGHT) {
            if (map[centerY] && map[centerY][right] && map[centerY][right].solid) {
                character.pos_x = right - character.width;
                return true;
            }
        }
        
        // Check multiple points along the right side of the character
        for (let i = 0; i < checkPoints; i++) {
            const checkY = Math.floor(top + (i * (bottom - top) / (checkPoints - 1)));
            
            // Skip the center point as we already checked it
            if (checkY === centerY) continue;
            
            // Make sure we're checking valid map coordinates
            if (right >= 0 && right < MAP_WIDTH && checkY >= 0 && checkY < MAP_HEIGHT) {
                if (map[checkY] && map[checkY][right] && map[checkY][right].solid) {
                    character.pos_x = right - character.width;
                    return true;
                }
            }
        }
        
        // Additional check for the exact edges
        if (right >= 0 && right < MAP_WIDTH && top >= 0 && top < MAP_HEIGHT) {
            if (map[top] && map[top][right] && map[top][right].solid) {
                character.pos_x = right - character.width;
                return true;
            }
        }
        
        if (right >= 0 && right < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
            if (map[bottom] && map[bottom][right] && map[bottom][right].solid) {
                character.pos_x = right - character.width;
                return true;
            }
        }
    } else if (character.vel_x < 0) { // Moving left
        // Left collision (left wall)
        const left = Math.floor(newX);
        
        // First check the center point for efficiency
        const centerY = Math.floor(top + (bottom - top) / 2);
        if (left >= 0 && left < MAP_WIDTH && centerY >= 0 && centerY < MAP_HEIGHT) {
            if (map[centerY] && map[centerY][left] && map[centerY][left].solid) {
                character.pos_x = left + 1;
                return true;
            }
        }
        
        // Check multiple points along the left side of the character
        for (let i = 0; i < checkPoints; i++) {
            const checkY = Math.floor(top + (i * (bottom - top) / (checkPoints - 1)));
            
            // Skip the center point as we already checked it
            if (checkY === centerY) continue;
            
            // Make sure we're checking valid map coordinates
            if (left >= 0 && left < MAP_WIDTH && checkY >= 0 && checkY < MAP_HEIGHT) {
                if (map[checkY] && map[checkY][left] && map[checkY][left].solid) {
                    character.pos_x = left + 1;
                    return true;
                }
            }
        }
        
        // Additional check for the exact edges
        if (left >= 0 && left < MAP_WIDTH && top >= 0 && top < MAP_HEIGHT) {
            if (map[top] && map[top][left] && map[top][left].solid) {
                character.pos_x = left + 1;
                return true;
            }
        }
        
        if (left >= 0 && left < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
            if (map[bottom] && map[bottom][left] && map[bottom][left].solid) {
                character.pos_x = left + 1;
                return true;
            }
        }
    }
    
    return false;
}

// Check for vertical collisions
function checkVerticalCollision(x, newY) {
    // Use more precise collision detection with floating point values
    const left = Math.floor(x);
    const right = Math.floor(x + character.width - 1);
    
    // Check more points along the character's width for better collision detection
    const checkPoints = Math.max(5, right - left + 1); // At least 5 check points
    
    if (character.vel_y > 0) { // Moving down
        // Bottom collision (floor)
        const bottom = Math.floor(newY + character.height);
        
        // First check the center point for efficiency
        const centerX = Math.floor(left + (right - left) / 2);
        if (centerX >= 0 && centerX < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
            if (map[bottom] && map[bottom][centerX] && map[bottom][centerX].solid) {
                character.pos_y = bottom - character.height;
                return true;
            }
        }
        
        // Check multiple points along the bottom of the character
        for (let i = 0; i < checkPoints; i++) {
            const checkX = Math.floor(left + (i * (right - left) / (checkPoints - 1)));
            
            // Skip the center point as we already checked it
            if (checkX === centerX) continue;
            
            // Make sure we're checking valid map coordinates
            if (checkX >= 0 && checkX < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
                if (map[bottom] && map[bottom][checkX] && map[bottom][checkX].solid) {
                    character.pos_y = bottom - character.height;
                    return true;
                }
            }
        }
        
        // Additional check for the exact edges
        if (left >= 0 && left < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
            if (map[bottom] && map[bottom][left] && map[bottom][left].solid) {
                character.pos_y = bottom - character.height;
                return true;
            }
        }
        
        if (right >= 0 && right < MAP_WIDTH && bottom >= 0 && bottom < MAP_HEIGHT) {
            if (map[bottom] && map[bottom][right] && map[bottom][right].solid) {
                character.pos_y = bottom - character.height;
                return true;
            }
        }
    } else if (character.vel_y < 0) { // Moving up
        // Top collision (ceiling)
        const top = Math.floor(newY);
        
        // First check the center point for efficiency
        const centerX = Math.floor(left + (right - left) / 2);
        if (centerX >= 0 && centerX < MAP_WIDTH && top >= 0 && top < MAP_HEIGHT) {
            if (map[top] && map[top][centerX] && map[top][centerX].solid) {
                character.pos_y = top + 1;
                return true;
            }
        }
        
        // Check multiple points along the top of the character
        for (let i = 0; i < checkPoints; i++) {
            const checkX = Math.floor(left + (i * (right - left) / (checkPoints - 1)));
            
            // Skip the center point as we already checked it
            if (checkX === centerX) continue;
            
            // Make sure we're checking valid map coordinates
            if (checkX >= 0 && checkX < MAP_WIDTH && top >= 0 && top < MAP_HEIGHT) {
                if (map[top] && map[top][checkX] && map[top][checkX].solid) {
                    character.pos_y = top + 1;
                    return true;
                }
            }
        }
        
        // Additional check for the exact edges
        if (left >= 0 && left < MAP_WIDTH && top >= 0 && top < MAP_HEIGHT) {
            if (map[top] && map[top][left] && map[top][left].solid) {
                character.pos_y = top + 1;
                return true;
            }
        }
        
        if (right >= 0 && right < MAP_WIDTH && top >= 0 && top < MAP_HEIGHT) {
            if (map[top] && map[top][right] && map[top][right].solid) {
                character.pos_y = top + 1;
                return true;
            }
        }
    }
    
    return false;
}

// Update enemies
function updateEnemies(dt) {
    enemies.forEach(enemy => {
        // Move enemy
        enemy.x += enemy.vel_x * dt;
        
        // Check bounds and reverse direction if needed
        if (enemy.x <= enemy.leftBound) {
            enemy.x = enemy.leftBound;
            enemy.vel_x = Math.abs(enemy.vel_x);
            enemy.facingRight = true;
        } else if (enemy.x >= enemy.rightBound) {
            enemy.x = enemy.rightBound;
            enemy.vel_x = -Math.abs(enemy.vel_x);
            enemy.facingRight = false;
        }
        
        // Update animation
        enemy.animationTimer += dt;
        if (enemy.animationTimer > 0.2) {
            enemy.animationTimer = 0;
            enemy.animationFrame = (enemy.animationFrame + 1) % 2;
        }
    });
}

// Update collectibles
function updateCollectibles(dt) {
    collectibles.forEach(collectible => {
        if (!collectible.collected) {
            // Update animation
            collectible.animationTimer += dt;
            if (collectible.animationTimer > 0.2) {
                collectible.animationTimer = 0;
                collectible.animationFrame = (collectible.animationFrame + 1) % 4;
            }
        }
    });
}

// Update camera position
function updateCamera() {
    // Center camera on character
    camera.x = character.pos_x - canvas.width / 2;
    
    // Clamp camera to map bounds
    if (camera.x < 0) camera.x = 0;
    if (camera.x > MAP_WIDTH - canvas.width) camera.x = MAP_WIDTH - canvas.width;
}

// Check for collisions with collectibles and enemies
function checkCollisions() {
    // Check collectibles
    collectibles.forEach(collectible => {
        if (!collectible.collected && checkRectCollision(
            character.pos_x, character.pos_y, character.width, character.height,
            collectible.x, collectible.y, collectible.width, collectible.height
        )) {
            collectible.collected = true;
            score += 10;
        }
    });
    
    // Check enemies
    enemies.forEach(enemy => {
        if (checkRectCollision(
            character.pos_x, character.pos_y, character.width, character.height,
            enemy.x, enemy.y, enemy.width, enemy.height
        )) {
            // Check if character is landing on top of enemy
            if (character.vel_y > 0 && character.pos_y + character.height < enemy.y + enemy.height / 2) {
                // Bounce off enemy
                character.vel_y = character.jumpSpeed * 0.7;
                enemy.vel_x = 0; // "Defeat" the enemy by stopping it
                score += 50;
            } else {
                // Character hit by enemy
                loseLife();
            }
        }
    });
}

// Check if two rectangles are colliding
function checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// Lose a life
function loseLife() {
    lives--;
    if (lives <= 0) {
        gameRunning = false;
    } else {
        // Reset character position
        character.pos_x = 50;
        character.pos_y = 200;
        character.vel_x = 0;
        character.vel_y = 0;
    }
}

// Render the game
function render() {
    // Clear the canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the map
    drawMap();
    
    // Draw collectibles
    drawCollectibles();
    
    // Draw enemies
    drawEnemies();
    
    // Draw the character
    drawCharacter();
    
    // Draw UI
    drawUI();
    
    // Draw game over screen if needed
    if (!gameRunning) {
        drawGameOver();
    }
}

// Draw the map
function drawMap() {
    const startX = Math.floor(camera.x);
    const endX = Math.min(Math.ceil(camera.x + canvas.width), MAP_WIDTH);
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = startX; x < endX; x++) {
            if (map[y] && map[y][x] && map[y][x].type !== 'empty') {
                ctx.fillStyle = map[y][x].color;
                ctx.fillRect(x - camera.x, y, 1, 1);
            }
        }
    }
}

// Draw collectibles
function drawCollectibles() {
    collectibles.forEach(collectible => {
        if (!collectible.collected) {
            if (collectible.type === 'coin') {
                drawCoin(collectible);
            }
        }
    });
}

// Draw a coin with animation
function drawCoin(coin) {
    const baseX = coin.x - camera.x;
    const baseY = coin.y;
    const frame = coin.animationFrame;
    
    // Gold color for the coin
    const goldColor = '#FFD700';
    const shineColor = '#FFFFFF';
    const shadowColor = '#B8860B';
    
    // Draw the coin based on animation frame
    switch(frame) {
        case 0: // Full coin
            // Outer edge (shadow)
            ctx.fillStyle = shadowColor;
            ctx.fillRect(baseX, baseY + 1, 8, 6);
            ctx.fillRect(baseX + 1, baseY, 6, 8);
            
            // Inner coin (gold)
            ctx.fillStyle = goldColor;
            ctx.fillRect(baseX + 1, baseY + 1, 6, 6);
            
            // Shine detail
            ctx.fillStyle = shineColor;
            ctx.fillRect(baseX + 2, baseY + 2, 2, 2);
            break;
            
        case 1: // Slightly narrower (rotating)
            // Outer edge (shadow)
            ctx.fillStyle = shadowColor;
            ctx.fillRect(baseX + 1, baseY + 1, 6, 6);
            
            // Inner coin (gold)
            ctx.fillStyle = goldColor;
            ctx.fillRect(baseX + 2, baseY + 1, 4, 6);
            
            // Shine detail
            ctx.fillStyle = shineColor;
            ctx.fillRect(baseX + 3, baseY + 2, 1, 2);
            break;
            
        case 2: // Thinnest (edge view)
            // Outer edge (shadow)
            ctx.fillStyle = shadowColor;
            ctx.fillRect(baseX + 2, baseY + 1, 4, 6);
            
            // Inner coin (gold)
            ctx.fillStyle = goldColor;
            ctx.fillRect(baseX + 3, baseY + 1, 2, 6);
            break;
            
        case 3: // Slightly wider again (rotating back)
            // Outer edge (shadow)
            ctx.fillStyle = shadowColor;
            ctx.fillRect(baseX + 1, baseY + 1, 6, 6);
            
            // Inner coin (gold)
            ctx.fillStyle = goldColor;
            ctx.fillRect(baseX + 2, baseY + 1, 4, 6);
            
            // Shine detail
            ctx.fillStyle = shineColor;
            ctx.fillRect(baseX + 4, baseY + 2, 1, 2);
            break;
    }
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.vel_x !== 0) { // Only draw active enemies
            // Draw based on enemy type
            switch(enemy.type) {
                case 'slime':
                    drawSlimeEnemy(enemy);
                    break;
                case 'robot':
                    drawRobotEnemy(enemy);
                    break;
                case 'bat':
                    drawBatEnemy(enemy);
                    break;
                default:
                    // Fallback to simple rectangle
                    ctx.fillStyle = '#FF00FF'; // Magenta
                    ctx.fillRect(
                        enemy.x - camera.x,
                        enemy.y,
                        enemy.width,
                        enemy.height
                    );
            }
        }
    });
}

// Draw a slime enemy
function drawSlimeEnemy(enemy) {
    const baseX = enemy.x - camera.x;
    const baseY = enemy.y;
    const frame = enemy.animationFrame;
    
    // Slime body (green)
    ctx.fillStyle = '#00AA00';
    
    // Base shape depends on animation frame
    if (frame === 0) {
        // Compressed shape
        ctx.fillRect(baseX + 2, baseY + 6, 12, 10);
        ctx.fillRect(baseX + 1, baseY + 8, 14, 8);
    } else {
        // Extended shape
        ctx.fillRect(baseX + 2, baseY + 4, 12, 12);
        ctx.fillRect(baseX + 1, baseY + 6, 14, 10);
    }
    
    // Eyes (white with black pupils)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(baseX + 4, baseY + 8, 2, 2);
    ctx.fillRect(baseX + 10, baseY + 8, 2, 2);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(baseX + 5, baseY + 9, 1, 1);
    ctx.fillRect(baseX + 11, baseY + 9, 1, 1);
    
    // Mouth
    ctx.fillStyle = '#000000';
    if (frame === 0) {
        ctx.fillRect(baseX + 6, baseY + 12, 4, 1);
    } else {
        ctx.fillRect(baseX + 5, baseY + 13, 6, 1);
    }
}

// Draw a robot enemy
function drawRobotEnemy(enemy) {
    const baseX = enemy.x - camera.x;
    const baseY = enemy.y;
    const frame = enemy.animationFrame;
    const facingMod = enemy.facingRight ? 1 : -1;
    
    // Robot body (metallic gray)
    ctx.fillStyle = '#888888';
    ctx.fillRect(baseX + 2, baseY + 2, 12, 12);
    
    // Head details
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(baseX + 3, baseY + 3, 10, 5);
    
    // Eye (changes color based on animation frame)
    ctx.fillStyle = frame === 0 ? '#FF0000' : '#FF6600';
    ctx.fillRect(baseX + 5 + (facingMod * 2), baseY + 4, 2, 2);
    
    // Antenna
    ctx.fillStyle = '#000000';
    ctx.fillRect(baseX + 8, baseY, 1, 2);
    
    // Legs
    ctx.fillStyle = '#555555';
    if (frame === 0) {
        // First leg position
        ctx.fillRect(baseX + 3, baseY + 14, 3, 2);
        ctx.fillRect(baseX + 10, baseY + 14, 3, 2);
    } else {
        // Second leg position
        ctx.fillRect(baseX + 4, baseY + 14, 3, 2);
        ctx.fillRect(baseX + 9, baseY + 14, 3, 2);
    }
    
    // Arms
    ctx.fillStyle = '#666666';
    ctx.fillRect(baseX + 1, baseY + 6, 1, 4);
    ctx.fillRect(baseX + 14, baseY + 6, 1, 4);
}

// Draw a bat enemy
function drawBatEnemy(enemy) {
    const baseX = enemy.x - camera.x;
    const baseY = enemy.y;
    const frame = enemy.animationFrame;
    
    // Bat body (dark purple)
    ctx.fillStyle = '#440044';
    ctx.fillRect(baseX + 6, baseY + 6, 4, 6);
    
    // Wings (change based on animation frame)
    ctx.fillStyle = '#660066';
    if (frame === 0) {
        // Wings up
        ctx.fillRect(baseX + 2, baseY + 2, 4, 6);
        ctx.fillRect(baseX + 10, baseY + 2, 4, 6);
    } else {
        // Wings down
        ctx.fillRect(baseX + 2, baseY + 6, 4, 6);
        ctx.fillRect(baseX + 10, baseY + 6, 4, 6);
    }
    
    // Eyes (red)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(baseX + 5, baseY + 7, 2, 2);
    ctx.fillRect(baseX + 9, baseY + 7, 2, 2);
    
    // Fangs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(baseX + 6, baseY + 12, 1, 2);
    ctx.fillRect(baseX + 9, baseY + 12, 1, 2);
}

// Draw the character
function drawCharacter() {
    // Draw character sprite
    for (let y = 0; y < character.height; y++) {
        for (let x = 0; x < character.width; x++) {
            const pixelColor = character.sprite[character.animationFrame][y][x];
            if (pixelColor) { // Only draw non-null pixels
                ctx.fillStyle = pixelColor;
                ctx.fillRect(
                    character.pos_x + (character.facingRight ? x : character.width - 1 - x) - camera.x,
                    character.pos_y + y,
                    1,
                    1
                );
            }
        }
    }
}

// Draw UI elements
function drawUI() {
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Lives: ${lives}`, 10, 40);
    
    // Update the HTML UI elements
    updateHtmlUI();
}

// Update HTML UI elements
function updateHtmlUI() {
    // Update score and lives in the HTML
    const scoreDisplay = document.getElementById('score-display');
    const livesDisplay = document.getElementById('lives-display');
    
    if (scoreDisplay) {
        scoreDisplay.textContent = score;
    }
    
    if (livesDisplay) {
        livesDisplay.textContent = lives;
    }
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = 'left';
}

// Initialize the game
init(); 