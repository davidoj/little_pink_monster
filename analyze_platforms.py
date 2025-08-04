#!/usr/bin/env python3
"""
Platform Analyzer for Little Pink Monster Game
Detects black rectangle platforms from background image
"""

from PIL import Image
import numpy as np
from collections import deque

def find_connected_components(black_pixels, width, height):
    """Find connected components of black pixels using flood fill"""
    visited = set()
    components = []
    
    # Convert set to dict for faster lookup
    black_pixel_dict = {(x, y): True for x, y in black_pixels}
    
    for x, y in black_pixels:
        if (x, y) in visited:
            continue
            
        # Flood fill to find connected component
        component = []
        queue = deque([(x, y)])
        component_visited = set()
        
        while queue:
            cx, cy = queue.popleft()
            if (cx, cy) in component_visited:
                continue
                
            component_visited.add((cx, cy))
            visited.add((cx, cy))
            component.append((cx, cy))
            
            # Check 4-connected neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if (0 <= nx < width and 0 <= ny < height and 
                    (nx, ny) not in component_visited and 
                    (nx, ny) in black_pixel_dict):
                    queue.append((nx, ny))
        
        if len(component) > 50:  # Only include substantial components
            components.append(component)
    
    return components

def component_to_rectangle(component):
    """Convert a connected component to a bounding rectangle"""
    xs = [x for x, y in component]
    ys = [y for x, y in component]
    
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    return {
        'x': min_x,
        'y': min_y,
        'width': max_x - min_x + 1,
        'height': max_y - min_y + 1
    }

def analyze_background(image_path):
    """Analyze background image and detect platform rectangles"""
    print(f"Loading image: {image_path}")
    
    try:
        # Load image
        img = Image.open(image_path)
        print(f"Image size: {img.width} x {img.height}")
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Convert to numpy array for faster processing
        pixels = np.array(img)
        
        # Find black pixels (RGB values all under 30)
        black_mask = np.all(pixels < 30, axis=2)
        black_coords = np.where(black_mask)
        
        # Convert to list of (x, y) tuples
        black_pixels = list(zip(black_coords[1], black_coords[0]))  # Note: numpy uses (y,x) order
        
        print(f"Found {len(black_pixels)} black pixels")
        
        if not black_pixels:
            print("No black pixels found!")
            return []
        
        # Find connected components
        print("Finding connected components...")
        components = find_connected_components(black_pixels, img.width, img.height)
        print(f"Found {len(components)} connected components")
        
        # Convert components to rectangles
        platforms = []
        for component in components:
            rect = component_to_rectangle(component)
            
            # Filter out tiny rectangles
            if rect['width'] >= 15 and rect['height'] >= 8:
                platforms.append(rect)
        
        # Sort platforms by position
        platforms.sort(key=lambda p: (p['y'], p['x']))
        
        print(f"Detected {len(platforms)} valid platforms")
        return platforms
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return []

def generate_js_code(platforms):
    """Generate JavaScript code for the platforms"""
    if not platforms:
        return "const platforms = [];"
    
    js_code = "// Auto-detected platforms from background image\nconst platforms = [\n"
    
    for i, platform in enumerate(platforms):
        js_code += f"    {{x: {platform['x']}, y: {platform['y']}, width: {platform['width']}, height: {platform['height']}}}"
        if i < len(platforms) - 1:
            js_code += ","
        js_code += "\n"
    
    js_code += "];\n\nconsole.log(`Loaded ${platforms.length} platforms`);"
    
    return js_code

def main():
    image_path = "images/background.png"
    
    print("=" * 50)
    print("Platform Analyzer for Little Pink Monster")
    print("=" * 50)
    
    platforms = analyze_background(image_path)
    
    if platforms:
        print("\nDetected Platforms:")
        print("-" * 40)
        for i, p in enumerate(platforms):
            print(f"{i+1:2d}. x:{p['x']:4d} y:{p['y']:3d} w:{p['width']:3d} h:{p['height']:2d}")
        
        print("\nJavaScript Code:")
        print("=" * 50)
        js_code = generate_js_code(platforms)
        print(js_code)
        
        # Save to file
        with open("detected_platforms.js", "w") as f:
            f.write(js_code)
        
        print("\nCode saved to: detected_platforms.js")
        print("Copy this code into your game.js file!")
        
    else:
        print("No platforms detected. Check if the image has black rectangles.")

if __name__ == "__main__":
    main()