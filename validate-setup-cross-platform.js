#!/usr/bin/env node

/**
 * NovaSignal Cross-Platform Setup Validation Script
 * 
 * This script validates that all components of the NovaSignal system
 * are properly configured and ready for use across Windows, macOS, and Linux.
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const net = require('net');

const execAsync = promisify(exec);

class CrossPlatformValidationSuite {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = [];
        this.projectRoot = path.resolve(__dirname);
        this.platform = os.platform();
        this.arch = os.arch();
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m',   // Red
            reset: '\x1b[0m'
        };
        
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }
    
    async fileExists(filePath) {
        try {
            await fs.access(path.join(this.projectRoot, filePath));
            return true;
        } catch {
            return false;
        }
    }
    
    async readJson(filePath) {
        try {
            const content = await fs.readFile(path.join(this.projectRoot, filePath), 'utf8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`);
        }
    }
    
    async validatePlatformSupport() {
        this.log('Validating platform support...', 'info');
        
        const supportedPlatforms = ['win32', 'darwin', 'linux'];
        const platformNames = {
            'win32': 'Windows',
            'darwin': 'macOS', 
            'linux': 'Linux'
        };
        
        if (supportedPlatforms.includes(this.platform)) {
            this.passed.push(`✓ Platform ${platformNames[this.platform]} (${this.arch}) is supported`);
        } else {
            this.errors.push(`✗ Platform ${this.platform} is not supported`);
        }
        
        // Check for platform-specific installer
        const expectedInstallers = {
            'win32': 'install.ps1',
            'darwin': 'install-macos.sh',
            'linux': 'install.sh'
        };
        
        const installer = expectedInstallers[this.platform];
        if (installer && await this.fileExists(installer)) {
            this.passed.push(`✓ Platform-specific installer found: ${installer}`);
        } else if (installer) {
            this.errors.push(`✗ Platform-specific installer missing: ${installer}`);
        }
        
        // Check for cross-platform scripts
        const crossPlatformScripts = ['validate-setup.js', 'detect-platform.js'];
        for (const script of crossPlatformScripts) {
            if (await this.fileExists(script)) {
                this.passed.push(`✓ Cross-platform script found: ${script}`);
            } else {
                this.warnings.push(`⚠ Cross-platform script missing: ${script}`);
            }
        }
    }
    
    async validateSystemRequirements() {
        this.log('Validating system requirements...', 'info');
        
        try {
            // Check Python version
            const pythonCmd = this.platform === 'win32' ? 'python' : 'python3';
            try {
                const pythonResult = await execAsync(`${pythonCmd} --version`);
                const pythonVersion = pythonResult.stdout.match(/Python (\d+\.\d+)/)?.[1];
                if (pythonVersion) {
                    const [major, minor] = pythonVersion.split('.').map(Number);
                    if (major === 3 && minor >= 8) {
                        this.passed.push(`✓ Python ${pythonVersion} meets requirements (≥3.8)`);
                    } else {
                        this.errors.push(`✗ Python ${pythonVersion} is too old (requires ≥3.8)`);
                    }
                }
            } catch {
                this.warnings.push(`⚠ Python not found or not accessible via ${pythonCmd}`);
            }
            
            // Check Node.js version
            try {
                const nodeResult = await execAsync('node --version');
                const nodeVersion = nodeResult.stdout.trim().replace('v', '');
                const majorVersion = parseInt(nodeVersion.split('.')[0]);
                if (majorVersion >= 18) {
                    this.passed.push(`✓ Node.js ${nodeVersion} meets requirements (≥18)`);
                } else {
                    this.errors.push(`✗ Node.js ${nodeVersion} is too old (requires ≥18)`);
                }
            } catch {
                this.warnings.push('⚠ Node.js not found or not accessible');
            }
            
            // Check npm availability
            try {
                const npmResult = await execAsync('npm --version');
                const npmVersion = npmResult.stdout.trim();
                this.passed.push(`✓ npm ${npmVersion} is available`);
            } catch {
                this.warnings.push('⚠ npm not found or not accessible');
            }
            
            // Check available memory
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const totalGB = Math.round(totalMem / (1024 * 1024 * 1024));
            const freeGB = Math.round(freeMem / (1024 * 1024 * 1024));
            
            if (totalGB >= 4) {
                this.passed.push(`✓ System memory: ${totalGB}GB total, ${freeGB}GB free`);
            } else {
                this.warnings.push(`⚠ System memory: ${totalGB}GB total (recommended: ≥4GB)`);
            }
            
            // Check network connectivity
            await this.checkNetworkConnectivity();
            
            // Check port availability
            await this.checkPortAvailability([8000, 5173]);
            
        } catch (error) {
            this.errors.push(`✗ System requirements validation error: ${error.message}`);
        }
    }
    
    async checkNetworkConnectivity() {
        try {
            // Check internet connectivity by attempting to resolve DNS
            const { lookup } = require('dns').promises;
            await lookup('github.com');
            this.passed.push('✓ Internet connectivity available');
        } catch {
            this.warnings.push('⚠ Internet connectivity check failed');
        }
    }
    
    async checkPortAvailability(ports) {
        for (const port of ports) {
            try {
                await new Promise((resolve, reject) => {
                    const server = net.createServer();
                    server.listen(port, () => {
                        server.close(resolve);
                    });
                    server.on('error', reject);
                });
                this.passed.push(`✓ Port ${port} is available`);
            } catch {
                this.warnings.push(`⚠ Port ${port} may be in use`);
            }
        }
    }
    
    async validateProjectStructure() {
        this.log('Validating project structure...', 'info');
        
        const requiredDirectories = [
            'backend',
            'frontend',
            'docs'
        ];
        
        const requiredFiles = [
            'package.json',
            'README.md',
            '.env.example',
            'backend/main.py',
            'backend/requirements.txt',
            'frontend/package.json',
            'frontend/src/main.tsx'
        ];
        
        // Check directories
        for (const dir of requiredDirectories) {
            try {
                const stats = await fs.stat(path.join(this.projectRoot, dir));
                if (stats.isDirectory()) {
                    this.passed.push(`✓ Directory exists: ${dir}`);
                } else {
                    this.errors.push(`✗ Path exists but is not a directory: ${dir}`);
                }
            } catch {
                this.errors.push(`✗ Missing required directory: ${dir}`);
            }
        }
        
        // Check files
        for (const file of requiredFiles) {
            if (await this.fileExists(file)) {
                this.passed.push(`✓ Required file exists: ${file}`);
            } else {
                this.errors.push(`✗ Missing required file: ${file}`);
            }
        }
    }
    
    async validateBackendSetup() {
        this.log('Validating backend setup...', 'info');
        
        // Check if virtual environment exists
        const venvPath = path.join(this.projectRoot, 'backend', '.venv');
        try {
            const stats = await fs.stat(venvPath);
            if (stats.isDirectory()) {
                this.passed.push('✓ Backend virtual environment exists');
                
                // Check if it's properly structured
                const expectedPaths = this.platform === 'win32' 
                    ? ['Scripts/python.exe', 'Scripts/pip.exe']
                    : ['bin/python', 'bin/pip'];
                    
                for (const expectedPath of expectedPaths) {
                    const fullPath = path.join(venvPath, expectedPath);
                    try {
                        await fs.access(fullPath);
                        this.passed.push(`✓ Virtual environment executable found: ${expectedPath}`);
                    } catch {
                        this.warnings.push(`⚠ Virtual environment executable missing: ${expectedPath}`);
                    }
                }
            }
        } catch {
            this.warnings.push('⚠ Backend virtual environment not found (will be created by installer)');
        }
        
        // Check requirements.txt
        try {
            const requirementsPath = path.join(this.projectRoot, 'backend', 'requirements.txt');
            const requirements = await fs.readFile(requirementsPath, 'utf8');
            const deps = requirements.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            this.passed.push(`✓ Backend requirements.txt contains ${deps.length} dependencies`);
        } catch {
            this.errors.push('✗ Backend requirements.txt not found or unreadable');
        }
    }
    
    async validateFrontendSetup() {
        this.log('Validating frontend setup...', 'info');
        
        // Check package.json
        try {
            const packageJson = await this.readJson('frontend/package.json');
            
            if (packageJson.name) {
                this.passed.push(`✓ Frontend package name: ${packageJson.name}`);
            }
            
            if (packageJson.scripts && packageJson.scripts.dev) {
                this.passed.push('✓ Frontend dev script configured');
            } else {
                this.errors.push('✗ Frontend dev script not found in package.json');
            }
            
            if (packageJson.scripts && packageJson.scripts.build) {
                this.passed.push('✓ Frontend build script configured');
            } else {
                this.warnings.push('⚠ Frontend build script not found in package.json');
            }
            
        } catch (error) {
            this.errors.push(`✗ Frontend package.json validation error: ${error.message}`);
        }
        
        // Check if node_modules exists
        const nodeModulesPath = path.join(this.projectRoot, 'frontend', 'node_modules');
        try {
            const stats = await fs.stat(nodeModulesPath);
            if (stats.isDirectory()) {
                this.passed.push('✓ Frontend dependencies installed (node_modules exists)');
            }
        } catch {
            this.warnings.push('⚠ Frontend dependencies not installed (node_modules missing)');
        }
    }
    
    async validatePlatformSpecificFeatures() {
        this.log('Validating platform-specific features...', 'info');
        
        switch (this.platform) {
            case 'win32':
                await this.validateWindowsFeatures();
                break;
            case 'darwin':
                await this.validateMacOSFeatures();
                break;
            case 'linux':
                await this.validateLinuxFeatures();
                break;
        }
    }
    
    async validateWindowsFeatures() {
        try {
            // Check PowerShell availability
            await execAsync('powershell -Command "Get-Host"');
            this.passed.push('✓ PowerShell is available');
            
            // Check if winget is available
            try {
                await execAsync('winget --version');
                this.passed.push('✓ Windows Package Manager (winget) is available');
            } catch {
                this.warnings.push('⚠ Windows Package Manager (winget) not found');
            }
            
            // Check for Windows-specific runner scripts
            const winScripts = ['run_all.bat', 'run_backend.bat', 'run_frontend.bat'];
            for (const script of winScripts) {
                if (await this.fileExists(script)) {
                    this.passed.push(`✓ Windows runner script exists: ${script}`);
                } else {
                    this.warnings.push(`⚠ Windows runner script missing: ${script} (will be created by installer)`);
                }
            }
            
        } catch (error) {
            this.errors.push(`✗ Windows features validation error: ${error.message}`);
        }
    }
    
    async validateMacOSFeatures() {
        try {
            // Check Xcode Command Line Tools
            try {
                await execAsync('xcode-select -p');
                this.passed.push('✓ Xcode Command Line Tools are installed');
            } catch {
                this.warnings.push('⚠ Xcode Command Line Tools not found');
            }
            
            // Check Homebrew
            try {
                await execAsync('brew --version');
                this.passed.push('✓ Homebrew is available');
            } catch {
                this.warnings.push('⚠ Homebrew not found (will be installed by installer)');
            }
            
            // Check architecture-specific paths
            const expectedBrewPath = this.arch === 'arm64' ? '/opt/homebrew' : '/usr/local';
            try {
                await fs.access(`${expectedBrewPath}/bin`);
                this.passed.push(`✓ Expected Homebrew path exists: ${expectedBrewPath}`);
            } catch {
                this.warnings.push(`⚠ Expected Homebrew path missing: ${expectedBrewPath}`);
            }
            
            // Check for macOS-specific runner scripts
            const macScripts = ['start_all_macos.sh', 'start_backend_macos.sh', 'start_frontend_macos.sh'];
            for (const script of macScripts) {
                if (await this.fileExists(script)) {
                    this.passed.push(`✓ macOS runner script exists: ${script}`);
                } else {
                    this.warnings.push(`⚠ macOS runner script missing: ${script} (will be created by installer)`);
                }
            }
            
        } catch (error) {
            this.errors.push(`✗ macOS features validation error: ${error.message}`);
        }
    }
    
    async validateLinuxFeatures() {
        try {
            // Detect package manager
            const packageManagers = ['apt-get', 'yum', 'dnf', 'pacman', 'zypper', 'emerge', 'apk'];
            let foundPM = null;
            
            for (const pm of packageManagers) {
                try {
                    await execAsync(`which ${pm}`);
                    foundPM = pm;
                    break;
                } catch {
                    // Continue checking
                }
            }
            
            if (foundPM) {
                this.passed.push(`✓ Package manager found: ${foundPM}`);
            } else {
                this.warnings.push('⚠ No supported package manager found');
            }
            
            // Check for essential build tools
            const buildTools = ['gcc', 'make', 'curl'];
            for (const tool of buildTools) {
                try {
                    await execAsync(`which ${tool}`);
                    this.passed.push(`✓ Build tool available: ${tool}`);
                } catch {
                    this.warnings.push(`⚠ Build tool missing: ${tool}`);
                }
            }
            
            // Check for Linux-specific runner scripts
            const linuxScripts = ['start_all.sh', 'start_backend.sh', 'start_frontend.sh'];
            for (const script of linuxScripts) {
                if (await this.fileExists(script)) {
                    this.passed.push(`✓ Linux runner script exists: ${script}`);
                } else {
                    this.warnings.push(`⚠ Linux runner script missing: ${script} (will be created by installer)`);
                }
            }
            
        } catch (error) {
            this.errors.push(`✗ Linux features validation error: ${error.message}`);
        }
    }
    
    async validateEnvironmentConfiguration() {
        this.log('Validating environment configuration...', 'info');
        
        // Check .env.example
        if (await this.fileExists('.env.example')) {
            this.passed.push('✓ Environment template (.env.example) exists');
            
            try {
                const envExample = await fs.readFile(path.join(this.projectRoot, '.env.example'), 'utf8');
                const lines = envExample.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                this.passed.push(`✓ Environment template contains ${lines.length} configuration variables`);
            } catch {
                this.warnings.push('⚠ Could not read .env.example content');
            }
        } else {
            this.errors.push('✗ Environment template (.env.example) missing');
        }
        
        // Check if .env exists
        if (await this.fileExists('.env')) {
            this.passed.push('✓ Environment file (.env) exists');
        } else {
            this.warnings.push('⚠ Environment file (.env) not found (will be created from template)');
        }
    }
    
    async checkGitRepository() {
        this.log('Checking Git repository status...', 'info');
        
        try {
            await execAsync('git --version');
            this.passed.push('✓ Git is available');
            
            try {
                await execAsync('git status');
                this.passed.push('✓ Git repository initialized');
            } catch {
                this.warnings.push('⚠ Git repository not initialized or not in project root');
            }
            
        } catch {
            this.warnings.push('⚠ Git is not available in PATH');
        }
    }
    
    async run() {
        this.log('🚀 Starting NovaSignal Cross-Platform Setup Validation', 'info');
        this.log(`Platform: ${this.platform} (${this.arch})`, 'info');
        this.log('='.repeat(60), 'info');
        
        await this.validatePlatformSupport();
        await this.validateSystemRequirements();
        await this.validateProjectStructure();
        await this.validateBackendSetup();
        await this.validateFrontendSetup();
        await this.validateEnvironmentConfiguration();
        await this.validatePlatformSpecificFeatures();
        await this.checkGitRepository();
        
        this.printSummary();
        
        return {
            success: this.errors.length === 0,
            errors: this.errors.length,
            warnings: this.warnings.length,
            passed: this.passed.length,
            platform: this.platform,
            arch: this.arch
        };
    }
    
    printSummary() {
        this.log('\n' + '='.repeat(60), 'info');
        this.log('📋 CROSS-PLATFORM VALIDATION SUMMARY', 'info');
        this.log('='.repeat(60), 'info');
        
        this.log(`Platform: ${this.platform} (${this.arch})`, 'info');
        this.log(`✅ Passed: ${this.passed.length}`, 'success');
        this.log(`⚠️  Warnings: ${this.warnings.length}`, 'warning');
        this.log(`❌ Errors: ${this.errors.length}`, 'error');
        
        if (this.errors.length > 0) {
            this.log('\n🚨 CRITICAL ERRORS:', 'error');
            this.errors.forEach(error => this.log(error, 'error'));
        }
        
        if (this.warnings.length > 0) {
            this.log('\n⚠️  WARNINGS:', 'warning');
            this.warnings.forEach(warning => this.log(warning, 'warning'));
        }
        
        this.log('\n📊 DETAILED RESULTS:', 'info');
        this.passed.forEach(pass => this.log(pass, 'success'));
        
        if (this.errors.length === 0) {
            this.log('\n🎉 ALL VALIDATIONS PASSED!', 'success');
            this.log(`✅ NovaSignal is ready for deployment on ${this.platform}`, 'success');
        } else {
            this.log('\n❌ VALIDATION FAILED', 'error');
            this.log('🔧 Please fix the errors above before deploying', 'error');
        }
        
        // Platform-specific next steps
        this.printPlatformSpecificInstructions();
    }
    
    printPlatformSpecificInstructions() {
        this.log('\n📋 PLATFORM-SPECIFIC INSTRUCTIONS:', 'info');
        
        const instructions = {
            'win32': [
                '1. Run PowerShell as Administrator',
                '2. Execute: .\\install.ps1',
                '3. Launch: .\\run_all.bat'
            ],
            'darwin': [
                '1. Ensure Xcode Command Line Tools are installed',
                '2. Execute: chmod +x install-macos.sh && ./install-macos.sh',
                '3. Launch: ./start_all_macos.sh'
            ],
            'linux': [
                '1. Ensure you have sudo privileges',
                '2. Execute: chmod +x install.sh && ./install.sh',
                '3. Launch: ./start_all.sh'
            ]
        };
        
        const platformInstructions = instructions[this.platform];
        if (platformInstructions) {
            platformInstructions.forEach(instruction => {
                this.log(instruction, 'info');
            });
        }
        
        this.log('\n🌐 Access URLs after installation:', 'info');
        this.log('📊 Backend API: http://127.0.0.1:8000', 'info');
        this.log('🖥️  Frontend UI: http://127.0.0.1:5173', 'info');
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new CrossPlatformValidationSuite();
    validator.run().then(result => {
        process.exit(result.success ? 0 : 1);
    }).catch(error => {
        console.error('Validation script failed:', error);
        process.exit(1);
    });
}

module.exports = CrossPlatformValidationSuite;