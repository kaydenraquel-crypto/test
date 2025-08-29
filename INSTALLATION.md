# 🛠️ NovaSignal Cross-Platform Installation Guide

This comprehensive guide covers installation of NovaSignal Trading Platform across Windows, macOS, and Linux systems.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Platform Detection](#-platform-detection)
- [System Requirements](#-system-requirements)
- [Automated Installation](#-automated-installation)
- [Manual Installation](#-manual-installation)
- [Validation & Troubleshooting](#-validation--troubleshooting)
- [Advanced Configuration](#-advanced-configuration)
- [Uninstallation](#-uninstallation)

## 🚀 Quick Start

The fastest way to get NovaSignal running is to use the automated installers:

### Windows
```powershell
# Open PowerShell as Administrator
.\install.ps1
.\run_all.bat
```

### macOS
```bash
chmod +x install-macos.sh && ./install-macos.sh
./start_all_macos.sh
```

### Linux
```bash
chmod +x install.sh && ./install.sh
./start_all.sh
```

## 🔍 Platform Detection

Not sure which installer to use? The platform detection script will automatically identify your system:

```bash
node detect-platform.js
```

**Example output:**
```
🔍 NOVASIGNAL PLATFORM DETECTION
==================================================

📱 Detected Platform: Linux (x64)

📋 System Requirements:
  • Modern Linux distribution
  • Package manager (apt, yum, dnf, pacman, etc.)
  • sudo privileges
  • Internet connection for package downloads

🛠️  Installer Status:
  ✅ Installer available: install.sh

📝 Installation Instructions:
  1. Open terminal
  2. Navigate to the project directory
  3. Run: chmod +x install.sh && ./install.sh
  4. After installation, launch with: ./start_all.sh
```

## 📋 System Requirements

### Windows
| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **OS Version** | Windows 10 | Windows 11 |
| **PowerShell** | 5.0 | Latest |
| **Memory** | 4GB RAM | 8GB+ RAM |
| **Storage** | 2GB free | 5GB+ free |
| **Network** | Internet connection | Broadband |

**Additional Notes:**
- Administrator privileges required for package installation
- Windows Defender may prompt for permission during installation
- winget (Windows Package Manager) will be used if available

### macOS
| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **OS Version** | macOS 10.15 Catalina | macOS 12+ |
| **Architecture** | Intel or Apple Silicon | Apple Silicon |
| **Memory** | 4GB RAM | 8GB+ RAM |
| **Storage** | 2GB free | 5GB+ free |
| **Tools** | Xcode Command Line Tools | Latest |

**Additional Notes:**
- Homebrew will be installed automatically if not present
- Apple Silicon Macs use `/opt/homebrew`, Intel Macs use `/usr/local`
- You may be prompted for your password during Homebrew installation

### Linux
| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Distribution** | Ubuntu 18.04, CentOS 7 | Latest LTS |
| **Architecture** | x86_64, ARM64 | x86_64 |
| **Memory** | 4GB RAM | 8GB+ RAM |
| **Storage** | 2GB free | 5GB+ free |
| **Privileges** | sudo access | sudo access |

**Supported Package Managers:**
- `apt` (Ubuntu, Debian)
- `yum` (RHEL, CentOS 7)  
- `dnf` (Fedora, CentOS 8+)
- `pacman` (Arch Linux)
- `zypper` (openSUSE)
- `emerge` (Gentoo)
- `apk` (Alpine Linux)

## 🤖 Automated Installation

### Windows Installation (`install.ps1`)

**Features:**
- Automatic detection of winget availability
- Python 3.12 and Node.js LTS installation via winget
- Virtual environment setup with proper isolation
- Dependency installation with error handling
- .env file creation from template
- Automatic creation of .bat and .ps1 runner scripts

**Installation Process:**
1. **Dependency Check:** Verifies winget, installs Python/Node.js if needed
2. **Backend Setup:** Creates `.venv`, installs requirements.txt
3. **Frontend Setup:** Runs `npm ci` or `npm install`
4. **Configuration:** Creates `.env` from `.env.example`
5. **Runners:** Creates `run_all.bat`, `run_backend.bat`, `run_frontend.bat`

### macOS Installation (`install-macos.sh`)

**Features:**
- Automatic Homebrew installation with architecture detection
- Python 3.11 and Node.js 18+ installation
- Fallback to pyenv/nvm if Homebrew fails
- PATH configuration for both Intel and Apple Silicon
- Shell profile updates for persistent environment

**Installation Process:**
1. **Prerequisites:** Checks for Xcode Command Line Tools
2. **Package Manager:** Installs/configures Homebrew
3. **Dependencies:** Installs Python 3.11 and Node.js 18+
4. **Backend Setup:** Creates virtual environment, installs dependencies
5. **Frontend Setup:** Installs Node.js dependencies
6. **Runners:** Creates platform-specific shell scripts

**Fallback Methods:**
- **pyenv** for Python if Homebrew fails
- **nvm** for Node.js if Homebrew fails
- Manual download instructions as last resort

### Linux Installation (`install.sh`)

**Features:**
- Automatic package manager detection
- Python 3.8+ and Node.js 18+ installation
- Support for 7+ package managers
- Build tools installation when needed
- Distribution-specific optimizations

**Installation Process:**
1. **Detection:** Identifies package manager and checks versions
2. **Dependencies:** Installs Python 3.8+, Node.js 18+, build tools
3. **Backend Setup:** Creates virtual environment, installs requirements
4. **Frontend Setup:** Installs Node.js dependencies
5. **Runners:** Creates Unix shell scripts with proper permissions

**Package Manager Support:**
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install python3 nodejs npm

# RHEL/CentOS/Fedora  
sudo dnf install python3 nodejs npm

# Arch Linux
sudo pacman -S python nodejs npm

# openSUSE
sudo zypper install python3 nodejs npm
```

## 🔧 Manual Installation

If you prefer manual control or the automated installer encounters issues:

<details>
<summary>📖 Detailed Manual Installation Steps</summary>

### Step 1: Install Prerequisites

#### Windows
1. **Python 3.8+**: Download from [python.org](https://python.org)
2. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org)
3. **Git**: Download from [git-scm.com](https://git-scm.com)

#### macOS
```bash
# Using Homebrew (recommended)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install python@3.11 node@18

# Using MacPorts (alternative)
sudo port install python311 nodejs18
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm

# Fedora
sudo dnf install python3 python3-pip nodejs npm

# Arch
sudo pacman -S python python-pip nodejs npm
```

### Step 2: Clone Repository
```bash
git clone https://github.com/your-username/NovaSignal_v0_2.git
cd NovaSignal_v0_2
```

### Step 3: Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv .venv  # Linux/macOS
python -m venv .venv   # Windows

# Activate virtual environment
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Step 4: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Optional: Verify installation
npm run build
```

### Step 5: Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Edit with your preferred editor
nano .env     # Linux
vim .env      # Unix
notepad .env  # Windows
```

### Step 6: Create Runner Scripts

#### Windows (`run_all.bat`)
```batch
@echo off
echo Starting NovaSignal...
start /B "Backend" cmd /c "cd /d backend && .venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"
start /B "Frontend" cmd /c "cd /d frontend && npm run dev"
echo NovaSignal is starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
pause
```

#### Unix (`start_all.sh`)
```bash
#!/bin/bash
echo "Starting NovaSignal..."

# Start backend
cd backend
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "NovaSignal is running!"
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://127.0.0.1:5173"
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

</details>

## 🔍 Validation & Troubleshooting

### Cross-Platform Validation
```bash
# Run comprehensive validation
node validate-setup-cross-platform.js

# Platform detection only
node detect-platform.js

# JSON output for scripting
node detect-platform.js --json
```

### Common Issues & Solutions

#### Issue: Python Version Too Old
```bash
# Check Python version
python --version    # Windows
python3 --version   # Linux/macOS

# Solutions:
# Windows: Install Python 3.8+ from python.org
# macOS: brew install python@3.11
# Linux: Use package manager to install python3.8+
```

#### Issue: Node.js Version Too Old
```bash
# Check Node.js version
node --version

# Solutions:
# Windows: Install from nodejs.org or use nvm-windows
# macOS: brew install node@18 or use nvm
# Linux: Use NodeSource repository or nvm
```

#### Issue: Permission Denied (Linux/macOS)
```bash
# Make scripts executable
chmod +x install-macos.sh  # macOS
chmod +x install.sh        # Linux
chmod +x start_all.sh       # Both

# Fix ownership issues
sudo chown -R $USER:$USER ~/.npm
```

#### Issue: Port Already in Use
```bash
# Check what's using the ports
lsof -i :8000    # Backend port
lsof -i :5173    # Frontend port

# Kill processes if needed
sudo kill -9 $(lsof -ti:8000)
sudo kill -9 $(lsof -ti:5173)
```

#### Issue: Virtual Environment Problems
```bash
# Remove and recreate virtual environment
rm -rf backend/.venv
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=1                    # Linux/macOS
set DEBUG=1                       # Windows

# Run with verbose output
node validate-setup-cross-platform.js --verbose
```

## ⚙️ Advanced Configuration

### Custom Installation Paths
```bash
# Set custom Python path
export PYTHON_PATH=/usr/local/bin/python3.11

# Set custom Node.js path  
export NODE_PATH=/usr/local/bin/node

# Run installer with custom paths
PYTHON_PATH=/custom/path ./install.sh
```

### Development Mode Setup
```bash
# Install development dependencies
cd backend
pip install -r requirements-dev.txt

cd ../frontend
npm install --include=dev

# Enable hot reloading and debug mode
export NODE_ENV=development
export PYTHON_ENV=development
```

### Production Optimizations
```bash
# Frontend production build
cd frontend
npm run build

# Backend production mode
cd backend
pip install gunicorn
gunicorn main:app --workers 4 --bind 0.0.0.0:8000
```

## 🗑️ Uninstallation

### Automated Cleanup
```bash
# Remove virtual environment
rm -rf backend/.venv

# Remove Node.js dependencies
rm -rf frontend/node_modules

# Remove generated files
rm -f .env
rm -f .platform-config.json

# Remove runner scripts (platform-specific)
rm -f run_all.bat run_backend.bat run_frontend.bat        # Windows
rm -f start_all_macos.sh start_backend_macos.sh start_frontend_macos.sh  # macOS
rm -f start_all.sh start_backend.sh start_frontend.sh     # Linux
```

### Complete Removal
```bash
# Remove entire project directory
cd ..
rm -rf NovaSignal_v0_2

# Optional: Remove system-wide dependencies
# (Only if not used by other projects)
pip uninstall -r requirements.txt
npm uninstall -g <global-packages>
```

## 📞 Support

If you encounter issues during installation:

1. **Check System Requirements**: Ensure your system meets minimum requirements
2. **Run Validation**: Use `node validate-setup-cross-platform.js` for diagnostics
3. **Check Logs**: Review installer output for specific error messages
4. **Platform Detection**: Verify platform support with `node detect-platform.js`
5. **Manual Installation**: Fall back to manual installation if automated fails
6. **Documentation**: Consult platform-specific documentation in `/docs`

## 🔄 Updates

To update NovaSignal to the latest version:

```bash
# Update code
git pull origin main

# Re-run installer to update dependencies
./install.sh           # Linux
./install-macos.sh     # macOS  
.\install.ps1          # Windows
```

---

**Next Steps:** After successful installation, visit the [Getting Started Guide](./docs/user-guide/getting-started.md) to learn how to configure and use NovaSignal.