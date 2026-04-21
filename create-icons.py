#!/usr/bin/env python3
"""
Simple script to create extension icon placeholders.
Creates basic colored circles with tab symbols for different sizes.
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors for a "chaos" theme
    bg_color = (59, 130, 246)  # Blue
    text_color = (255, 255, 255)  # White
    
    # Draw circle background
    margin = size // 8
    draw.ellipse([margin, margin, size - margin, size - margin], 
                 fill=bg_color)
    
    # Add tab symbol (simplified)
    tab_size = size // 3
    tab_x = (size - tab_size) // 2
    tab_y = (size - tab_size) // 2
    
    # Draw a simple tab-like shape
    draw.rectangle([tab_x, tab_y, tab_x + tab_size, tab_y + tab_size//3], 
                   fill=text_color)
    draw.rectangle([tab_x, tab_y + tab_size//3, tab_x + tab_size*2//3, tab_y + tab_size], 
                   fill=text_color)
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename}")

def main():
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Create icons for different sizes
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        filename = f'icons/icon{size}.png'
        create_icon(size, filename)
    
    print("All icons created successfully!")

if __name__ == '__main__':
    main()