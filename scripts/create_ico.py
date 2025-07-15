#!/usr/bin/env python3
"""
Create Windows ICO file from PNG images
"""

import os
from PIL import Image

def create_ico():
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icons_dir = os.path.join(project_dir, 'assets', 'icons')
    
    # PNG files to include in ICO (in order of preference)
    png_files = [
        'icon_256x256.png',
        'icon_128x128.png', 
        'icon_64x64.png',
        'icon_48x48.png',
        'icon_32x32.png',
        'icon_16x16.png'
    ]
    
    images = []
    for png_file in png_files:
        png_path = os.path.join(icons_dir, png_file)
        if os.path.exists(png_path):
            img = Image.open(png_path)
            images.append(img)
            print(f"Added {png_file}")
    
    if images:
        ico_path = os.path.join(icons_dir, 'icon.ico')
        images[0].save(ico_path, format='ICO', sizes=[(img.width, img.height) for img in images])
        print(f"Created {ico_path}")
    else:
        print("No PNG files found!")

if __name__ == '__main__':
    try:
        create_ico()
    except ImportError:
        print("PIL (Pillow) not available. Installing...")
        import subprocess
        subprocess.run(['pip3', 'install', 'Pillow'], check=True)
        create_ico()