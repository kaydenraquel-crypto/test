#!/usr/bin/env node

/**
 * NovaSignal Cross-Platform Runner
 * 
 * Automatically detects the platform and runs the appropriate startup scripts.
 * Provides a unified interface for starting NovaSignal across all supported platforms.
 */

const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

class NovaSignalRunner {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
        this.projectRoot = path.resolve(__dirname);
        this.processes = [];
    }
    
    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m',   // Red
            highlight: '\x1b[35m', // Magenta
            reset: '\x1b[0m'
        };
        
        console.log(`${colors[type]}${message}${colors.reset}`);
    }
    
    fileExists(filePath) {
        try {
            return fs.existsSync(path.join(this.projectRoot, filePath));
        } catch {
            return false;
        }
    }
    
    async checkPrerequisites() {
        this.log('\n🔍 Checking prerequisites...', 'info');
        
        const issues = [];
        
        // Check if backend directory exists
        if (!this.fileExists('backend')) {
            issues.push('Backend directory not found');
        }
        
        // Check if frontend directory exists  
        if (!this.fileExists('frontend')) {
            issues.push('Frontend directory not found');
        }
        
        // Check if backend virtual environment exists
        const venvPath = this.platform === 'win32' ? 'backend/.venv/Scripts' : 'backend/.venv/bin';
        if (!this.fileExists(venvPath)) {
            issues.push('Backend virtual environment not found - run installer first');
        }
        
        // Check if frontend dependencies are installed
        if (!this.fileExists('frontend/node_modules')) {
            issues.push('Frontend dependencies not installed - run installer first');
        }
        
        if (issues.length > 0) {
            this.log('\n❌ Prerequisites check failed:', 'error');
            issues.forEach(issue => this.log(`  • ${issue}`, 'error'));
            this.log('\n💡 Please run the appropriate installer first:', 'warning');
            
            const installers = {
                'win32': '.\\install.ps1 (PowerShell as Administrator)',
                'darwin': './install-macos.sh',
                'linux': './install.sh'
            };
            
            const installer = installers[this.platform];
            if (installer) {
                this.log(`  ${installer}`, 'highlight');
            }
            
            return false;
        }
        
        this.log('✅ Prerequisites check passed', 'success');
        return true;
    }
    
    async startBackend() {
        this.log('📊 Starting backend server...', 'info');
        
        const backendPath = path.join(this.projectRoot, 'backend');
        let command, args, options;
        
        switch (this.platform) {
            case 'win32':
                // Windows - use the virtual environment's Python
                command = path.join(backendPath, '.venv', 'Scripts', 'python.exe');
                args = ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'];
                options = { cwd: backendPath, shell: false };
                break;
                
            case 'darwin':
            case 'linux':
                // Unix-like systems
                command = 'bash';
                args = ['-c', 'source .venv/bin/activate && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload'];
                options = { cwd: backendPath, shell: false };
                break;
                
            default:
                throw new Error(`Unsupported platform: ${this.platform}`);
        }
        
        const backendProcess = spawn(command, args, {
            ...options,
            stdio: 'pipe',
            detached: false
        });
        
        backendProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                this.log(`[Backend] ${output}`, 'info');
            }
        });
        
        backendProcess.stderr.on('data', (data) => {
            const output = data.toString().trim();
            if (output && !output.includes('INFO:') && !output.includes('WARNING:')) {
                this.log(`[Backend] ${output}`, 'warning');
            }
        });
        
        backendProcess.on('error', (error) => {
            this.log(`❌ Backend process error: ${error.message}`, 'error');
        });
        
        this.processes.push({
            name: 'Backend',
            process: backendProcess,
            url: 'http://127.0.0.1:8000'
        });
        
        return new Promise((resolve) => {
            // Give the backend a moment to start
            setTimeout(() => {
                resolve(backendProcess);
            }, 3000);
        });
    }
    
    async startFrontend() {
        this.log('🖥️  Starting frontend server...', 'info');
        
        const frontendPath = path.join(this.projectRoot, 'frontend');
        
        const frontendProcess = spawn('npm', ['run', 'dev'], {
            cwd: frontendPath,
            stdio: 'pipe',
            shell: this.platform === 'win32'
        });
        
        frontendProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                this.log(`[Frontend] ${output}`, 'info');
            }
        });
        
        frontendProcess.stderr.on('data', (data) => {
            const output = data.toString().trim();
            if (output && !output.includes('Local:') && !output.includes('Network:')) {
                this.log(`[Frontend] ${output}`, 'warning');
            }
        });
        
        frontendProcess.on('error', (error) => {
            this.log(`❌ Frontend process error: ${error.message}`, 'error');
        });
        
        this.processes.push({
            name: 'Frontend', 
            process: frontendProcess,
            url: 'http://127.0.0.1:5173'
        });
        
        return frontendProcess;
    }
    
    setupGracefulShutdown() {
        const shutdown = () => {
            this.log('\\n🛑 Shutting down NovaSignal...', 'warning');
            
            this.processes.forEach(({ name, process }) => {
                if (process && !process.killed) {
                    this.log(`   Stopping ${name}...`, 'info');
                    
                    if (this.platform === 'win32') {
                        // On Windows, kill the process tree
                        exec(`taskkill /pid ${process.pid} /T /F`, () => {});
                    } else {
                        // On Unix systems, send SIGTERM
                        process.kill('SIGTERM');
                    }
                }
            });
            
            setTimeout(() => {
                this.log('✅ NovaSignal stopped successfully', 'success');
                process.exit(0);
            }, 1000);
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        process.on('exit', shutdown);
        
        // Handle Windows Ctrl+C
        if (this.platform === 'win32') {
            process.on('SIGBREAK', shutdown);
        }
    }
    
    printStatus() {
        this.log('\\n🎉 NovaSignal is running!', 'success');
        this.log('=' * 50, 'info');
        
        this.processes.forEach(({ name, url }) => {
            this.log(`${name}: ${url}`, 'highlight');
        });
        
        this.log('\\n📚 Additional URLs:', 'info');
        this.log('   API Documentation: http://127.0.0.1:8000/docs', 'info');
        this.log('   API Health Check: http://127.0.0.1:8000/health', 'info');
        
        this.log('\\n💡 Tips:', 'info');
        this.log('   • Press Ctrl+C to stop all services', 'info');
        this.log('   • Check the logs above for any startup issues', 'info');
        this.log('   • Frontend hot-reload is enabled for development', 'info');
        
        this.log('\\n' + '=' * 50, 'info');
    }
    
    async run(options = {}) {
        const { mode = 'all' } = options;
        
        this.log('🚀 NovaSignal Cross-Platform Runner', 'highlight');
        this.log(`Platform: ${this.platform} (${this.arch})`, 'info');
        this.log('=' * 50, 'info');
        
        // Check prerequisites
        const prerequisitesPassed = await this.checkPrerequisites();
        if (!prerequisitesPassed) {
            process.exit(1);
        }
        
        // Setup graceful shutdown
        this.setupGracefulShutdown();
        
        try {
            if (mode === 'all' || mode === 'backend') {
                await this.startBackend();
            }
            
            if (mode === 'all' || mode === 'frontend') {
                await this.startFrontend();
            }
            
            // Give services time to start
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.printStatus();
            
            // Keep the process running
            process.stdin.resume();
            
        } catch (error) {
            this.log(`❌ Failed to start NovaSignal: ${error.message}`, 'error');
            process.exit(1);
        }
    }
    
    async runMode(mode) {
        switch (mode) {
            case 'backend':
                await this.run({ mode: 'backend' });
                break;
            case 'frontend':  
                await this.run({ mode: 'frontend' });
                break;
            case 'all':
            default:
                await this.run({ mode: 'all' });
                break;
        }
    }
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);
    const runner = new NovaSignalRunner();
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
NovaSignal Cross-Platform Runner

Usage:
  node run-novasignal.js [mode] [options]

Modes:
  all         Start both backend and frontend (default)
  backend     Start backend server only
  frontend    Start frontend server only

Options:
  --help, -h  Show this help message

Examples:
  node run-novasignal.js              # Start both services
  node run-novasignal.js all          # Start both services
  node run-novasignal.js backend      # Start backend only
  node run-novasignal.js frontend     # Start frontend only

Platform-specific shortcuts:
  Windows:    run_all.bat, run_backend.bat, run_frontend.bat
  macOS:      ./start_all_macos.sh, ./start_backend_macos.sh, ./start_frontend_macos.sh  
  Linux:      ./start_all.sh, ./start_backend.sh, ./start_frontend.sh
        `);
        return;
    }
    
    const mode = args[0] || 'all';
    
    if (!['all', 'backend', 'frontend'].includes(mode)) {
        console.error(`❌ Invalid mode: ${mode}`);
        console.error('Valid modes: all, backend, frontend');
        process.exit(1);
    }
    
    runner.runMode(mode).catch(error => {
        console.error(`❌ Runner failed: ${error.message}`);
        process.exit(1);
    });
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = NovaSignalRunner;