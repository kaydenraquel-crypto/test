#!/bin/bash

# NovaSignal v0.2 One-Click Installer (macOS)
# - Installs Python 3 and Node.js via Homebrew if missing
# - Falls back to alternative methods if Homebrew unavailable
# - Sets up backend venv + pip deps
# - Installs frontend deps
# - Creates .env from template (if missing)
# - Creates Start scripts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to check Python version
check_python_version() {
    if command_exists python3; then
        local version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        local major=$(echo $version | cut -d. -f1)
        local minor=$(echo $version | cut -d. -f2)
        
        if [ "$major" -eq 3 ] && [ "$minor" -ge 8 ]; then
            return 0  # Version is 3.8 or higher
        else
            return 1  # Version is too old
        fi
    else
        return 1  # Python3 not found
    fi
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        local version=$(node --version | sed 's/v//')
        local major=$(echo $version | cut -d. -f1)
        
        if [ "$major" -ge 18 ]; then
            return 0  # Version is 18 or higher
        else
            return 1  # Version is too old
        fi
    else
        return 1  # Node not found
    fi
}

# Function to detect macOS architecture
detect_arch() {
    if [ "$(uname -m)" = "arm64" ]; then
        echo "arm64"
    else
        echo "x86_64"
    fi
}

# Function to install Homebrew
install_homebrew() {
    print_message $YELLOW "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for current session
    local arch=$(detect_arch)
    if [ "$arch" = "arm64" ]; then
        # Apple Silicon Mac
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
        export PATH="/opt/homebrew/bin:$PATH"
    else
        # Intel Mac
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/usr/local/bin/brew shellenv)"
        export PATH="/usr/local/bin:$PATH"
    fi
    
    # Verify Homebrew installation
    if command_exists brew; then
        print_message $GREEN "Homebrew installed successfully."
    else
        print_message $RED "Homebrew installation failed."
        return 1
    fi
}

# Function to install Python via pyenv (fallback method)
install_python_pyenv() {
    print_message $YELLOW "Installing Python via pyenv (fallback method)..."
    
    # Install pyenv if not present
    if ! command_exists pyenv; then
        curl https://pyenv.run | bash
        
        # Add pyenv to PATH
        echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zprofile
        echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zprofile
        echo 'eval "$(pyenv init -)"' >> ~/.zprofile
        
        export PYENV_ROOT="$HOME/.pyenv"
        export PATH="$PYENV_ROOT/bin:$PATH"
        eval "$(pyenv init -)"
    fi
    
    # Install Python 3.11
    pyenv install 3.11.0
    pyenv global 3.11.0
    
    # Update PATH
    export PATH="$(pyenv root)/shims:$PATH"
}

# Function to install Node.js via nvm (fallback method)
install_nodejs_nvm() {
    print_message $YELLOW "Installing Node.js via nvm (fallback method)..."
    
    # Install nvm if not present
    if ! command_exists nvm && [ ! -s "$HOME/.nvm/nvm.sh" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        # Source nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    else
        # Source nvm if already installed
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    fi
    
    # Install Node.js LTS
    nvm install --lts
    nvm use --lts
    nvm alias default lts/*
}

# Function to install dependencies with Homebrew
install_with_homebrew() {
    local need_python=false
    local need_nodejs=false
    
    # Check current installations
    if check_python_version; then
        print_message $GREEN "Python 3.8+ found."
    else
        need_python=true
    fi
    
    if check_node_version; then
        print_message $GREEN "Node.js 18+ found."
    else
        need_nodejs=true
    fi
    
    if [ "$need_python" = false ] && [ "$need_nodejs" = false ]; then
        print_message $GREEN "All dependencies already satisfied."
        return 0
    fi
    
    # Install Homebrew if needed
    if ! command_exists brew; then
        install_homebrew || return 1
    fi
    
    print_message $YELLOW "Updating Homebrew..."
    brew update
    
    # Install Python if needed
    if [ "$need_python" = true ]; then
        print_message $YELLOW "Installing Python via Homebrew..."
        brew install python@3.11
        
        # Create symlink if needed
        local arch=$(detect_arch)
        if [ "$arch" = "arm64" ]; then
            local brew_prefix="/opt/homebrew"
        else
            local brew_prefix="/usr/local"
        fi
        
        if [ ! -L "$brew_prefix/bin/python3" ]; then
            ln -sf "$brew_prefix/bin/python3.11" "$brew_prefix/bin/python3" 2>/dev/null || true
        fi
    fi
    
    # Install Node.js if needed
    if [ "$need_nodejs" = true ]; then
        print_message $YELLOW "Installing Node.js via Homebrew..."
        brew install node@18
        
        # Link Node.js 18
        brew link --force node@18 2>/dev/null || true
    fi
    
    # Verify installations
    if [ "$need_python" = true ] && ! check_python_version; then
        print_message $RED "Python installation via Homebrew failed."
        return 1
    fi
    
    if [ "$need_nodejs" = true ] && ! check_node_version; then
        print_message $RED "Node.js installation via Homebrew failed."
        return 1
    fi
}

# Function to install dependencies with fallback methods
install_with_fallback() {
    print_message $YELLOW "Homebrew installation failed or not available."
    print_message $YELLOW "Attempting fallback installation methods..."
    
    local success=true
    
    # Install Python via pyenv if needed
    if ! check_python_version; then
        install_python_pyenv || success=false
    fi
    
    # Install Node.js via nvm if needed
    if ! check_node_version; then
        install_nodejs_nvm || success=false
    fi
    
    if [ "$success" = false ]; then
        print_message $RED "Fallback installation methods failed."
        print_message $YELLOW "Please install manually:"
        print_message $YELLOW "- Python 3.8+ from https://www.python.org/downloads/macos/"
        print_message $YELLOW "- Node.js 18+ from https://nodejs.org/en/download/"
        return 1
    fi
    
    # Verify final installations
    if ! check_python_version || ! check_node_version; then
        print_message $RED "Installation verification failed."
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_message $CYAN "Checking and installing dependencies..."
    
    # Try Homebrew first, fall back to other methods
    if install_with_homebrew; then
        print_message $GREEN "Dependencies installed via Homebrew."
    elif install_with_fallback; then
        print_message $GREEN "Dependencies installed via fallback methods."
    else
        print_message $RED "Failed to install dependencies."
        print_message $YELLOW "Manual installation required:"
        print_message $YELLOW "1. Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        print_message $YELLOW "2. Run: brew install python@3.11 node@18"
        print_message $YELLOW "3. Re-run this installer"
        exit 1
    fi
}

# Function to setup Python environment
setup_python_environment() {
    # Determine best Python command
    PYTHON_CMD="python3"
    
    # Check for specific Python versions
    if command_exists python3.11; then
        PYTHON_CMD="python3.11"
    elif command_exists python3.10; then
        PYTHON_CMD="python3.10"
    elif command_exists python3.9; then
        PYTHON_CMD="python3.9"
    fi
    
    print_message $BLUE "Using Python command: $PYTHON_CMD"
    
    # Verify pip is available
    if ! $PYTHON_CMD -m pip --version &>/dev/null; then
        print_message $YELLOW "Installing pip..."
        curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
        $PYTHON_CMD get-pip.py
        rm get-pip.py
    fi
}

# Main installation process
main() {
    cd "$SCRIPT_DIR"
    
    print_message $CYAN "== NovaSignal Installer (macOS) =="
    print_message $BLUE "Architecture: $(detect_arch)"
    
    # Check for Xcode Command Line Tools
    if ! command_exists git; then
        print_message $YELLOW "Xcode Command Line Tools not found. Installing..."
        xcode-select --install
        print_message $YELLOW "Please complete the Xcode Command Line Tools installation and re-run this script."
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Setup Python environment
    setup_python_environment
    
    # Backend setup
    print_message $CYAN "\n--- Backend setup ---"
    cd "$SCRIPT_DIR/backend"
    
    if [ ! -d ".venv" ]; then
        print_message $YELLOW "Creating Python virtual environment..."
        $PYTHON_CMD -m venv .venv
    else
        print_message $GREEN "Virtual environment already exists."
    fi
    
    # Activate virtual environment and install dependencies
    print_message $YELLOW "Installing backend dependencies..."
    source .venv/bin/activate
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    deactivate
    
    # Create .env file if it doesn't exist
    cd "$SCRIPT_DIR"
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        print_message $YELLOW "Created .env from template. Add your API keys later."
    fi
    
    # Frontend setup
    print_message $CYAN "\n--- Frontend setup ---"
    cd "$SCRIPT_DIR/frontend"
    
    if [ -f "package-lock.json" ]; then
        print_message $YELLOW "Installing frontend dependencies (npm ci)..."
        npm ci
    else
        print_message $YELLOW "Installing frontend dependencies (npm install)..."
        npm install
    fi
    
    # Create runner scripts
    print_message $CYAN "\n--- Creating runner scripts ---"
    cd "$SCRIPT_DIR"
    
    # Create start_all_macos.sh
    cat > start_all_macos.sh << 'EOF'
#!/bin/bash

# Start NovaSignal - Both Backend and Frontend (macOS)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup on exit
cleanup() {
    echo "Stopping NovaSignal services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Ensure proper PATH for Homebrew
if [ "$(uname -m)" = "arm64" ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || true
    export PATH="/opt/homebrew/bin:$PATH"
else
    eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || true
    export PATH="/usr/local/bin:$PATH"
fi

# Source nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Source pyenv if available
if command -v pyenv >/dev/null; then
    eval "$(pyenv init -)"
fi

# Start backend in background
echo "Starting backend server..."
cd "$SCRIPT_DIR/backend"
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend in background  
echo "Starting frontend server..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 NovaSignal is starting..."
echo "📊 Backend:  http://127.0.0.1:8000"
echo "🖥️  Frontend: http://127.0.0.1:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
EOF
    
    # Create start_backend_macos.sh
    cat > start_backend_macos.sh << 'EOF'
#!/bin/bash

# Start NovaSignal Backend Only (macOS)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure proper PATH for Homebrew
if [ "$(uname -m)" = "arm64" ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || true
    export PATH="/opt/homebrew/bin:$PATH"
else
    eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || true
    export PATH="/usr/local/bin:$PATH"
fi

# Source pyenv if available
if command -v pyenv >/dev/null; then
    eval "$(pyenv init -)"
fi

echo "Starting NovaSignal backend..."
cd "$SCRIPT_DIR/backend"
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
EOF
    
    # Create start_frontend_macos.sh
    cat > start_frontend_macos.sh << 'EOF'
#!/bin/bash

# Start NovaSignal Frontend Only (macOS)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure proper PATH for Homebrew
if [ "$(uname -m)" = "arm64" ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || true
    export PATH="/opt/homebrew/bin:$PATH"
else
    eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || true
    export PATH="/usr/local/bin:$PATH"
fi

# Source nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Starting NovaSignal frontend..."
cd "$SCRIPT_DIR/frontend"
npm run dev
EOF
    
    # Make scripts executable
    chmod +x start_all_macos.sh start_backend_macos.sh start_frontend_macos.sh
    
    print_message $GREEN "\n🎉 Installation complete!"
    print_message $GREEN "To launch NovaSignal:"
    print_message $GREEN "1) Run: ./start_all_macos.sh"
    print_message $GREEN "   Backend:  http://127.0.0.1:8000"
    print_message $GREEN "   Frontend: http://127.0.0.1:5173"
    print_message $GREEN ""
    print_message $GREEN "Or start services individually:"
    print_message $GREEN "- Backend only:  ./start_backend_macos.sh"
    print_message $GREEN "- Frontend only: ./start_frontend_macos.sh"
    print_message $GREEN ""
    print_message $YELLOW "Note: If you encounter PATH issues, restart your terminal or source your shell profile."
}

# Run main function
main "$@"