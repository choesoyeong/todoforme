#!/usr/bin/env python3
"""
Icon generation script for TodoForMe app
Converts SVG to various PNG sizes needed for macOS and other platforms
"""

import os
import subprocess
import sys

# Icon sizes needed for different platforms
SIZES = {
    # macOS app icon sizes
    'icon_16x16.png': 16,
    'icon_32x32.png': 32,
    'icon_128x128.png': 128,
    'icon_256x256.png': 256,
    'icon_512x512.png': 512,
    'icon_1024x1024.png': 1024,
    
    # Additional sizes for Windows/Linux
    'icon_48x48.png': 48,
    'icon_64x64.png': 64,
    'icon_96x96.png': 96,
}

def check_dependencies():
    """Check if required dependencies are available"""
    try:
        # Check for ImageMagick convert command
        subprocess.run(['convert', '-version'], capture_output=True, check=True)
        return 'convert'
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    try:
        # Check for rsvg-convert (librsvg)
        subprocess.run(['rsvg-convert', '--version'], capture_output=True, check=True)
        return 'rsvg'
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    print("Error: No suitable SVG to PNG converter found.")
    print("Please install either:")
    print("  - ImageMagick: brew install imagemagick")
    print("  - librsvg: brew install librsvg")
    sys.exit(1)

def generate_png_with_convert(svg_path, output_path, size):
    """Generate PNG using ImageMagick convert"""
    cmd = [
        'convert',
        '-background', 'transparent',
        '-density', '300',
        svg_path,
        '-resize', f'{size}x{size}',
        output_path
    ]
    subprocess.run(cmd, check=True)

def generate_png_with_rsvg(svg_path, output_path, size):
    """Generate PNG using rsvg-convert"""
    cmd = [
        'rsvg-convert',
        '-w', str(size),
        '-h', str(size),
        '-o', output_path,
        svg_path
    ]
    subprocess.run(cmd, check=True)

def main():
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    
    # Paths
    svg_path = os.path.join(project_dir, 'assets', 'icons', 'icon.svg')
    icons_dir = os.path.join(project_dir, 'assets', 'icons')
    
    # Check if SVG exists
    if not os.path.exists(svg_path):
        print(f"Error: SVG file not found at {svg_path}")
        sys.exit(1)
    
    # Check dependencies
    converter = check_dependencies()
    
    # Generate PNG files
    print("Generating PNG icons...")
    for filename, size in SIZES.items():
        output_path = os.path.join(icons_dir, filename)
        print(f"  Generating {filename} ({size}x{size})...")
        
        try:
            if converter == 'convert':
                generate_png_with_convert(svg_path, output_path, size)
            else:  # rsvg
                generate_png_with_rsvg(svg_path, output_path, size)
            print(f"    ✓ {filename}")
        except subprocess.CalledProcessError as e:
            print(f"    ✗ Failed to generate {filename}: {e}")
    
    print("\nIcon generation complete!")
    print(f"Icons saved to: {icons_dir}")

if __name__ == '__main__':
    main()