#!/bin/bash

# Multiple Disease Prediction System Setup Script
# This script sets up the environment and dependencies

set -e  # Exit on any error

echo "🏥 Multiple Disease Prediction System Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_blue() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if Python 3 is installed
check_python() {
    print_blue "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d " " -f 2)
        print_status "Python 3 found: $PYTHON_VERSION"
    else
        print_error "Python 3 is not installed. Please install Python 3.8+ first."
        exit 1
    fi
}

# Check if pip is installed
check_pip() {
    print_blue "Checking pip installation..."
    if command -v pip3 &> /dev/null; then
        print_status "pip3 found"
    else
        print_error "pip3 is not installed. Please install pip3 first."
        exit 1
    fi
}

# Create virtual environment
create_venv() {
    print_blue "Creating virtual environment..."
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_status "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi
}

# Activate virtual environment and install dependencies
install_dependencies() {
    print_blue "Installing dependencies..."
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    print_status "Dependencies installed successfully"
}

# Create necessary directories
create_directories() {
    print_blue "Creating necessary directories..."
    mkdir -p models
    mkdir -p static/uploads
    mkdir -p data
    print_status "Directories created"
}

# Run initial setup
initial_setup() {
    print_blue "Running initial setup..."
    source venv/bin/activate
    python -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('Database tables created successfully!')
"
    print_status "Initial setup completed"
}

# Main setup function
main() {
    print_blue "Starting setup process..."
    
    check_python
    check_pip
    create_venv
    install_dependencies
    create_directories
    initial_setup
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Activate the virtual environment:"
    echo "   source venv/bin/activate"
    echo ""
    echo "2. Start the application:"
    echo "   python app.py"
    echo "   OR"
    echo "   python run.py"
    echo ""
    echo "3. Open your browser and visit:"
    echo "   http://localhost:5000"
    echo ""
    echo "4. Test the API (optional):"
    echo "   python test_api.py"
    echo ""
    echo "🐳 Docker deployment (optional):"
    echo "   docker-compose up -d"
    echo ""
    echo "📖 For more information, check the README.md file"
}

# Run the main setup
main "$@"