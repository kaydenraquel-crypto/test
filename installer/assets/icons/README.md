# NovaSignal Installer Icons

This directory contains the icons used by the NovaSignal installer and application.

## Required Icons

### Windows
- `icon.ico` - Main application icon (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
- `installer.ico` - NSIS installer icon (48x48, 32x32, 16x16)
- `uninstaller.ico` - NSIS uninstaller icon (48x48, 32x32, 16x16)
- `installer-header.ico` - NSIS installer header icon (150x57)

### macOS
- `icon.icns` - Main application icon (1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16)

### Linux
- `icon.png` - Main application icon (512x512)

## Current Status
- **icon.png** - Placeholder PNG icon for development
- Production icons will be generated from the official NovaSignal brand assets

## Icon Design Guidelines
- **Style**: Modern, professional, financial/trading themed
- **Colors**: Primary blue (#667eea) with gradients
- **Elements**: Chart/graph elements, modern typography
- **Background**: Transparent for flexibility

## Generation Tools
Icons can be generated using:
- **Windows ICO**: `convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
- **macOS ICNS**: Use iconutil or online converters
- **Multi-resolution PNG**: Export at various sizes for Linux packaging