#!/usr/bin/env node

/**
 * NovaSignal Platform Detection & Recommendation Script
 * 
 * Automatically detects the user's platform and provides appropriate
 * installation instructions and installer recommendations.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

class PlatformDetector {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
        this.projectRoot = path.resolve(__dirname);
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
    
    detectPlatform() {
        const platform = this.platform;
        const arch = this.arch;
        
        const platformInfo = {
            'win32': {
                name: 'Windows',
                installer: 'install.ps1',
                runners: ['run_all.bat', 'run_backend.bat', 'run_frontend.bat'],
                instructions: [
                    '1. Open PowerShell as Administrator',
                    '2. Navigate to the project directory',
                    '3. Run: .\\install.ps1',
                    '4. After installation, launch with: .\\run_all.bat'
                ],
                requirements: [
                    'Windows 10 or later',
                    'PowerShell 5.0 or later',
                    'Internet connection for package downloads'
                ],
                notes: [
                    'The installer will automatically install Python and Node.js via winget',
                    'Windows Defender may prompt for permission during installation',
                    'Administrator privileges are required for package installation'
                ]
            },
            'darwin': {
                name: 'macOS',
                installer: 'install-macos.sh',
                runners: ['start_all_macos.sh', 'start_backend_macos.sh', 'start_frontend_macos.sh'],
                instructions: [
                    '1. Open Terminal',
                    '2. Navigate to the project directory',
                    '3. Run: chmod +x install-macos.sh && ./install-macos.sh',
                    '4. After installation, launch with: ./start_all_macos.sh'
                ],
                requirements: [
                    'macOS 10.15 (Catalina) or later',
                    'Xcode Command Line Tools',
                    'Internet connection for package downloads'
                ],
                notes: [
                    'The installer will install Homebrew if not present',
                    arch === 'arm64' ? 'Apple Silicon Mac detected - using /opt/homebrew' : 'Intel Mac detected - using /usr/local',
                    'You may be prompted to install Xcode Command Line Tools',
                    'Homebrew installation may require sudo password'
                ]
            },
            'linux': {
                name: 'Linux',
                installer: 'install.sh',
                runners: ['start_all.sh', 'start_backend.sh', 'start_frontend.sh'],
                instructions: [
                    '1. Open terminal',
                    '2. Navigate to the project directory', 
                    '3. Run: chmod +x install.sh && ./install.sh',
                    '4. After installation, launch with: ./start_all.sh'
                ],
                requirements: [
                    'Modern Linux distribution',
                    'Package manager (apt, yum, dnf, pacman, etc.)',
                    'sudo privileges',
                    'Internet connection for package downloads'
                ],
                notes: [
                    'The installer will detect your package manager automatically',
                    'Supported package managers: apt, yum, dnf, pacman, zypper, emerge, apk',
                    'Build tools (gcc, make) may be installed if needed',
                    'Python development headers will be installed for compilation'
                ]
            }
        };
        
        return platformInfo[platform] || {
            name: platform,
            installer: null,
            runners: [],
            instructions: ['Manual installation required for your platform'],
            requirements: ['Unsupported platform'],
            notes: ['Please install Python 3.8+ and Node.js 18+ manually']
        };
    }
    
    checkInstallerAvailability() {
        const platformInfo = this.detectPlatform();
        const installerExists = platformInfo.installer ? this.fileExists(platformInfo.installer) : false;
        const runnersExist = platformInfo.runners.map(runner => ({
            name: runner,
            exists: this.fileExists(runner)
        }));
        
        return {
            installer: {
                name: platformInfo.installer,
                exists: installerExists
            },
            runners: runnersExist
        };
    }
    
    generateInstallationGuide() {
        const platformInfo = this.detectPlatform();
        const availability = this.checkInstallerAvailability();
        
        this.log('\n🔍 NOVASIGNAL PLATFORM DETECTION', 'highlight');
        this.log('='.repeat(50), 'info');
        
        this.log(`\n📱 Detected Platform: ${platformInfo.name} (${this.arch})`, 'info');
        
        // System Requirements
        this.log('\n📋 System Requirements:', 'info');
        platformInfo.requirements.forEach(req => {
            this.log(`  • ${req}`, 'info');
        });
        
        // Installer Status
        this.log('\n🛠️  Installer Status:', 'info');
        if (availability.installer.exists) {
            this.log(`  ✅ Installer available: ${availability.installer.name}`, 'success');
        } else if (availability.installer.name) {
            this.log(`  ❌ Installer missing: ${availability.installer.name}`, 'error');
            this.log('     Please ensure you have the complete NovaSignal package', 'warning');
        } else {
            this.log('  ❌ No installer available for this platform', 'error');
        }
        
        // Runner Scripts Status
        this.log('\n🚀 Runner Scripts Status:', 'info');
        availability.runners.forEach(runner => {
            if (runner.exists) {
                this.log(`  ✅ ${runner.name}`, 'success');
            } else {
                this.log(`  ⚠️  ${runner.name} (will be created by installer)`, 'warning');
            }
        });
        
        // Installation Instructions
        this.log('\n📝 Installation Instructions:', 'highlight');
        platformInfo.instructions.forEach((instruction, index) => {
            this.log(`  ${instruction}`, index === 0 ? 'highlight' : 'info');
        });
        
        // Platform-specific Notes
        if (platformInfo.notes.length > 0) {
            this.log('\n💡 Important Notes:', 'warning');
            platformInfo.notes.forEach(note => {
                this.log(`  • ${note}`, 'info');
            });
        }
        
        // Quick Start Commands
        this.log('\n⚡ Quick Start Commands:', 'highlight');
        if (availability.installer.exists) {
            switch (this.platform) {
                case 'win32':
                    this.log('  # Windows PowerShell (Run as Administrator)', 'info');
                    this.log('  .\\install.ps1', 'success');
                    this.log('  .\\run_all.bat', 'success');
                    break;
                case 'darwin':
                    this.log('  # macOS Terminal', 'info');
                    this.log('  chmod +x install-macos.sh && ./install-macos.sh', 'success');
                    this.log('  ./start_all_macos.sh', 'success');
                    break;
                case 'linux':
                    this.log('  # Linux Terminal', 'info');
                    this.log('  chmod +x install.sh && ./install.sh', 'success');
                    this.log('  ./start_all.sh', 'success');
                    break;
            }
        } else {
            this.log('  Installer not available - manual setup required', 'warning');
        }
        
        // Service URLs
        this.log('\n🌐 Service URLs (after installation):', 'info');
        this.log('  📊 Backend API: http://127.0.0.1:8000', 'info');
        this.log('  🖥️  Frontend UI: http://127.0.0.1:5173', 'info');
        this.log('  📚 API Docs: http://127.0.0.1:8000/docs', 'info');
        
        // Validation Command
        this.log('\n🔍 Validation Command:', 'info');
        this.log('  node validate-setup-cross-platform.js', 'success');
        
        this.log('\n' + '='.repeat(50), 'info');
        
        return platformInfo;
    }
    
    getRecommendation() {
        const platformInfo = this.detectPlatform();
        const availability = this.checkInstallerAvailability();
        
        const recommendation = {
            platform: this.platform,
            arch: this.arch,
            platformName: platformInfo.name,
            installer: availability.installer,
            runners: availability.runners,
            canInstall: availability.installer.exists,
            instructions: platformInfo.instructions,
            requirements: platformInfo.requirements,
            notes: platformInfo.notes
        };
        
        return recommendation;
    }
    
    exportConfiguration() {
        const recommendation = this.getRecommendation();
        const configPath = path.join(this.projectRoot, '.platform-config.json');
        
        try {
            fs.writeFileSync(configPath, JSON.stringify(recommendation, null, 2));
            this.log(`\n💾 Platform configuration saved to: ${configPath}`, 'success');
        } catch (error) {
            this.log(`\n❌ Failed to save platform configuration: ${error.message}`, 'error');
        }
        
        return configPath;
    }
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);
    const detector = new PlatformDetector();
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
NovaSignal Platform Detection Script

Usage:
  node detect-platform.js [options]

Options:
  --help, -h        Show this help message
  --json            Output recommendation as JSON
  --export          Export platform configuration to file
  --quiet           Suppress detailed output
  
Examples:
  node detect-platform.js                    # Show full platform guide
  node detect-platform.js --json             # Output JSON only
  node detect-platform.js --export           # Save config and show guide
        `);
        return;
    }
    
    if (args.includes('--json')) {
        const recommendation = detector.getRecommendation();
        console.log(JSON.stringify(recommendation, null, 2));
        return;
    }
    
    const recommendation = detector.generateInstallationGuide();
    
    if (args.includes('--export')) {
        detector.exportConfiguration();
    }
    
    // Exit with appropriate code
    const canInstall = recommendation.installer !== null;
    process.exit(canInstall ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = PlatformDetector;