# Side-Scrolling Platformer Conversion Plan 🎮

## Background Requirements

### Size Options:
- **Option A**: 5760x1080 (3 screens wide × 1080 tall) - Recommended
- **Option B**: 1920x1080 (single screen, repeats)

**Recommendation**: Go with 5760x1080 (3 screens wide) for a proper adventure feeling!

### Background vs Platform Design:

**Two approaches available:**

#### Approach 1: Artistic Background (Recommended for your daughter)
- She draws the complete scene including visual platforms
- We define invisible collision rectangles separately in code
- Her art shows where platforms should be, we code the actual collision
- **Pros**: Complete creative freedom, beautiful custom art
- **Cons**: Need to coordinate art with collision code

#### Approach 2: Tile-Based System  
- Draw individual platform tiles (64x64 pixels each)
- Generate map from code that places tiles
- **Pros**: Easy to modify levels, consistent collision
- **Cons**: Less artistic freedom, more technical

**Recommendation**: Use Approach 1 - let her draw the full background, then we'll add invisible collision boxes over her platforms.

## Core Conversion Plan

### Phase 1: Physics Foundation
- [ ] Add gravity system (`velocityY += 0.8` each frame)
- [ ] Implement jumping (`velocityY = -15` when jump pressed)
- [ ] Create ground collision (stop falling when hit platform)
- [ ] Keep existing sprite animations

### Phase 2: Platform System
- [ ] Define platform collision rectangles in code
- [ ] Implement platform collision detection
- [ ] Add "standing on platform" state tracking
- [ ] Test jumping between platforms

### Phase 3: Camera & Scrolling
- [ ] Convert from screen-based to world-based coordinates
- [ ] Implement camera that follows player horizontally
- [ ] Add background scrolling (parallax effect)
- [ ] Keep player vertically centered

### Phase 4: Monster AI Updates
- [ ] Replace "flee in any direction" with "jump to escape"
- [ ] Add platform-aware pathfinding for monsters
- [ ] Implement monster jumping between platforms
- [ ] Add climbing behavior (optional)

### Phase 5: Polish
- [ ] Add sound effects for jumping/landing
- [ ] Smooth camera movement
- [ ] Add particle effects (dust clouds, etc.)
- [ ] Test on mobile devices

## Technical Specifications

### World Coordinates:
- World width: 5760 pixels (3 screens)
- World height: 1080 pixels
- Player view: 1920x1080 window that scrolls

### Physics Values:
```javascript
gravity = 0.8;          // Downward acceleration
jumpStrength = -15;     // Initial upward velocity
maxFallSpeed = 12;      // Terminal velocity
```

### Platform Definition Example:
```javascript
platforms = [
    {x: 0, y: 900, width: 400, height: 32},      // Ground start
    {x: 500, y: 800, width: 200, height: 32},    // First platform
    {x: 800, y: 700, width: 300, height: 32},    // Higher platform
    // etc...
];
```

## Background Creation Guide for Daughter 🎨

### What to Draw:
1. **Sky/atmosphere** at the top
2. **Platforms/ledges** where characters can stand
3. **Background scenery** (trees, mountains, buildings)
4. **Decorative elements** (flowers, signs, etc.)

### Tips:
- Draw platforms thick enough to see (at least 50 pixels tall)
- Use bright colors to distinguish platforms from background
- Leave some flat areas for monsters to run on
- Add some vertical elements for climbing
- Make it 3x wider than it is tall (like a panorama)

## Next Steps:
1. Start with gravity and jumping physics
2. Get daughter to begin background artwork
3. Test physics with temporary collision boxes
4. Integrate her background when ready
5. Fine-tune platform positions to match her art

---
*Plan created for Little Pink Monster platformer conversion*