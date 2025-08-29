#!/bin/bash

# NovaSignal v0.2 One-Click Installer (Linux)
# - Installs Python 3 and Node.js via package manager if missing
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
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to detect package manager
detect_package_manager() {
    if command -v apt-get &> /dev/null; then
        echo "apt"
    elif command -v yum &> /dev/null; then
        echo "yum"
    elif command -v dnf &> /dev/null; then
        echo "dnf"
    elif command -v pacman &> /dev/null; then
        echo "pacman"
    elif command -v zypper &> /dev/null; then
        echo "zypper"
    elif command -v emerge &> /dev/null; then
        echo "portage"
    elif command -v apk &> /dev/null; then
        echo "apk"
    else
        echo "unknown"
    fi
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

# Function to install Python and Node.js
install_dependencies() {
    local pm=$(detect_package_manager)
    print_message $YELLOW "Detected package manager: $pm"
    
    local need_python=false
    local need_nodejs=false
    
    # Check if Python 3.8+ is available
    if check_python_version; then
        print_message $GREEN "Python 3.8+ found."
    else
        need_python=true
        print_message $YELLOW "Python 3.8+ not found. Will install."
    fi
    
    # Check if Node.js 18+ is available
    if check_node_version; then
        print_message $GREEN "Node.js 18+ found."
    else
        need_nodejs=true
        print_message $YELLOW "Node.js 18+ not found. Will install."
    fi
    
    if [ "$need_python" = false ] && [ "$need_nodejs" = false ]; then
        print_message $GREEN "All dependencies already satisfied."
        return 0
    fi
    
    print_message $YELLOW "Installing required dependencies via $pm..."
    
    case $pm in
        "apt")
            # Update package list
            sudo apt-get update
            
            if [ "$need_python" = true ]; then
                sudo apt-get install -y python3 python3-pip python3-venv python3-dev
            fi
            
            if [ "$need_nodejs" = true ]; then
                # Install Node.js 18+ from NodeSource repository
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
            fi
            ;;
        "yum")
            if [ "$need_python" = true ]; then
                sudo yum install -y python3 python3-pip python3-venv python3-devel
            fi
            
            if [ "$need_nodejs" = true ]; then
                # Install Node.js 18+ from NodeSource repository
                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                sudo yum install -y nodejs
            fi
            ;;
        "dnf")
            if [ "$need_python" = true ]; then
                sudo dnf install -y python3 python3-pip python3-venv python3-devel
            fi
            
            if [ "$need_nodejs" = true ]; then
                # Install Node.js 18+ from NodeSource repository
                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                sudo dnf install -y nodejs
            fi
            ;;
        "pacman")
            if [ "$need_python" = true ]; then
                sudo pacman -S --noconfirm python python-pip python-virtualenv
            fi
            
            if [ "$need_nodejs" = true ]; then
                sudo pacman -S --noconfirm nodejs npm
            fi
            ;;
        "zypper")
            if [ "$need_python" = true ]; then
                sudo zypper install -y python3 python3-pip python3-venv python3-devel
            fi
            
            if [ "$need_nodejs" = true ]; then
                # Install Node.js from openSUSE repository
                sudo zypper install -y nodejs18 npm18
            fi
            ;;
        "portage")
            if [ "$need_python" = true ]; then
                sudo emerge -av dev-lang/python:3.11 dev-python/pip dev-python/virtualenv
            fi
            
            if [ "$need_nodejs" = true ]; then
                sudo emerge -av net-libs/nodejs
            fi
            ;;
        "apk")
            if [ "$need_python" = true ]; then
                sudo apk add python3 py3-pip python3-dev py3-virtualenv
            fi
            
            if [ "$need_nodejs" = true ]; then
                sudo apk add nodejs npm
            fi
            ;;
        *)
            print_message $RED "Unsupported package manager '$pm'."
            print_message $YELLOW "Please install the following manually:"
            print_message $YELLOW "- Python 3.8+ with pip and venv"
            print_message $YELLOW "- Node.js 18+ with npm"
            exit 1
            ;;
    esac
    
    # Verify installations
    if [ "$need_python" = true ]; then
        if check_python_version; then
            print_message $GREEN "Python installation verified."
        else
            print_message $RED "Python installation failed or version too old."
            exit 1
        fi
    fi
    
    if [ "$need_nodejs" = true ]; then
        if check_node_version; then
            print_message $GREEN "Node.js installation verified."
        else
            print_message $RED "Node.js installation failed or version too old."
            exit 1
        fi
    fi
}

# Main installation process
main() {
    cd "$SCRIPT_DIR"
    
    print_message $CYAN "== NovaSignal Installer (Linux) =="
    
    # Install dependencies
    install_dependencies
    
    # Determine Python command
    PYTHON_CMD="python3"
    if command_exists python3.11; then
        PYTHON_CMD="python3.11"
    elif command_exists python3.10; then
        PYTHON_CMD="python3.10"
    elif command_exists python3.9; then
        PYTHON_CMD="python3.9"
    fi
    
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
    
    # Create start_all.sh
    cat > start_all.sh << 'EOF'
#!/bin/bash

# Start NovaSignal - Both Backend and Frontend

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup on exit
cleanup() {
    echo "Stopping NovaSignal services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

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
    
    # Create start_backend.sh
    cat > start_backend.sh << 'EOF'
#!/bin/bash

# Start NovaSignal Backend Only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting NovaSignal backend..."
cd "$SCRIPT_DIR/backend"
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
EOF
    
    # Create start_frontend.sh
    cat > start_frontend.sh << 'EOF'
#!/bin/bash

# Start NovaSignal Frontend Only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting NovaSignal frontend..."
cd "$SCRIPT_DIR/frontend"
npm run dev
EOF
    
    # Make scripts executable
    chmod +x start_all.sh start_backend.sh start_frontend.sh
    
    print_message $GREEN "\n🎉 Installation complete!"
    print_message $GREEN "To launch NovaSignal:"
    print_message $GREEN "1) Run: ./start_all.sh"
    print_message $GREEN "   Backend:  http://127.0.0.1:8000"
    print_message $GREEN "   Frontend: http://127.0.0.1:5173"
    print_message $GREEN ""
    print_message $GREEN "Or start services individually:"
    print_message $GREEN "- Backend only:  ./start_backend.sh"
    print_message $GREEN "- Frontend only: ./start_frontend.sh"
}

# Run main function
main "$@"