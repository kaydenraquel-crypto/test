#!/usr/bin/env node

/**
 * NovaSignal Setup Validation Script
 * 
 * This script validates that all components of the NovaSignal deployment system
 * are properly configured and ready for production use.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ValidationSuite {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = [];
        this.projectRoot = path.resolve(__dirname);
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
    
    async checkRequiredFiles() {
        this.log('Checking required files...', 'info');
        
        const requiredFiles = [
            // Root files
            'package.json',
            'README.md',
            'LICENSE',
            'CHANGELOG.md',
            'CONTRIBUTING.md',
            'SECURITY.md',
            '.gitignore',
            
            // GitHub Actions
            '.github/workflows/ci.yml',
            
            // Installer
            'installer/package.json',
            'installer/electron-builder.config.js',
            'installer/src/main.js',
            'installer/src/preload.js',
            'installer/src/wizard.html',
            'installer/src/wizard.css',
            'installer/src/wizard.js',
            'installer/src/updater.js',
            'installer/src/update-ui.js',
            
            // Tests
            'installer/test/installer.test.js',
            'installer/test/updater.test.js',
            'installer/test/integration.test.js',
            
            // Assets
            'installer/assets/icons/icon.svg',
            'installer/assets/icons/README.md'
        ];
        
        for (const file of requiredFiles) {
            if (await this.fileExists(file)) {
                this.passed.push(`✓ ${file} exists`);
            } else {
                this.errors.push(`✗ Missing required file: ${file}`);
            }
        }
    }
    
    async validatePackageJson() {
        this.log('Validating package.json files...', 'info');
        
        try {
            // Root package.json
            const rootPkg = await this.readJson('package.json');
            
            if (rootPkg.name === 'novasignal-trading-platform') {
                this.passed.push('✓ Root package has correct name');
            } else {
                this.errors.push('✗ Root package name is incorrect');
            }
            
            if (rootPkg.version === '1.0.0') {
                this.passed.push('✓ Root package has correct version');
            } else {
                this.warnings.push('⚠ Root package version may need updating');
            }
            
            if (rootPkg.workspaces && rootPkg.workspaces.includes('installer')) {
                this.passed.push('✓ Root package includes installer workspace');
            } else {
                this.errors.push('✗ Root package missing installer workspace');
            }
            
            // Installer package.json
            if (await this.fileExists('installer/package.json')) {
                const installerPkg = await this.readJson('installer/package.json');
                
                const requiredDeps = ['electron', 'electron-updater', 'electron-store', 'electron-log'];
                for (const dep of requiredDeps) {
                    if (installerPkg.dependencies && installerPkg.dependencies[dep]) {
                        this.passed.push(`✓ Installer has dependency: ${dep}`);
                    } else {
                        this.errors.push(`✗ Installer missing dependency: ${dep}`);
                    }
                }
                
                const requiredDevDeps = ['electron-builder', 'mocha', 'chai', 'sinon'];
                for (const dep of requiredDevDeps) {
                    if (installerPkg.devDependencies && installerPkg.devDependencies[dep]) {
                        this.passed.push(`✓ Installer has dev dependency: ${dep}`);
                    } else {
                        this.errors.push(`✗ Installer missing dev dependency: ${dep}`);
                    }
                }
            }
            
        } catch (error) {
            this.errors.push(`✗ Package.json validation error: ${error.message}`);
        }
    }
    
    async validateElectronBuilderConfig() {
        this.log('Validating Electron Builder configuration...', 'info');
        
        try {
            if (await this.fileExists('installer/electron-builder.config.js')) {
                const configPath = path.join(this.projectRoot, 'installer/electron-builder.config.js');
                const config = require(configPath);
                
                if (config.appId === 'com.novasignal.trading') {
                    this.passed.push('✓ Electron Builder has correct app ID');
                } else {
                    this.errors.push('✗ Electron Builder app ID is incorrect');
                }
                
                if (config.productName === 'NovaSignal Trading Platform') {
                    this.passed.push('✓ Electron Builder has correct product name');
                } else {
                    this.errors.push('✗ Electron Builder product name is incorrect');
                }
                
                const platforms = ['win', 'mac', 'linux'];
                for (const platform of platforms) {
                    if (config[platform]) {
                        this.passed.push(`✓ Electron Builder configured for ${platform}`);
                    } else {
                        this.warnings.push(`⚠ Electron Builder missing ${platform} configuration`);
                    }
                }
                
                if (config.publish) {
                    this.passed.push('✓ Electron Builder has publishing configuration');
                } else {
                    this.warnings.push('⚠ Electron Builder missing publish configuration');
                }
            } else {
                this.errors.push('✗ Electron Builder config file missing');
            }
        } catch (error) {
            this.errors.push(`✗ Electron Builder config error: ${error.message}`);
        }
    }
    
    async validateGitHubActions() {
        this.log('Validating GitHub Actions workflow...', 'info');
        
        try {
            const workflowPath = path.join(this.projectRoot, '.github/workflows/ci.yml');
            const workflowContent = await fs.readFile(workflowPath, 'utf8');
            
            const requiredJobs = [
                'frontend:', 'backend:', 'security:', 
                'installer-windows:', 'installer-macos:', 'installer-linux:'
            ];
            
            for (const job of requiredJobs) {
                if (workflowContent.includes(job)) {
                    this.passed.push(`✓ GitHub Actions includes ${job.replace(':', '')} job`);
                } else {
                    this.errors.push(`✗ GitHub Actions missing ${job.replace(':', '')} job`);
                }
            }
            
            if (workflowContent.includes('electron-builder')) {
                this.passed.push('✓ GitHub Actions uses electron-builder');
            } else {
                this.errors.push('✗ GitHub Actions missing electron-builder');
            }
            
            if (workflowContent.includes('actions/upload-artifact')) {
                this.passed.push('✓ GitHub Actions uploads artifacts');
            } else {
                this.warnings.push('⚠ GitHub Actions may not be uploading artifacts');
            }
            
        } catch (error) {
            this.errors.push(`✗ GitHub Actions validation error: ${error.message}`);
        }
    }
    
    async validateSecurity() {
        this.log('Validating security configuration...', 'info');
        
        try {
            // Check .gitignore
            const gitignorePath = path.join(this.projectRoot, '.gitignore');
            const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
            
            const securityPatterns = ['*.env', 'certificate/', 'keys/', '*.pem', '*.p12'];
            for (const pattern of securityPatterns) {
                if (gitignoreContent.includes(pattern)) {
                    this.passed.push(`✓ .gitignore includes ${pattern}`);
                } else {
                    this.warnings.push(`⚠ .gitignore missing ${pattern}`);
                }
            }
            
            // Check main.js security settings
            const mainPath = path.join(this.projectRoot, 'installer/src/main.js');
            const mainContent = await fs.readFile(mainPath, 'utf8');
            
            const securityFeatures = [
                'nodeIntegration: false',
                'contextIsolation: true',
                'enableRemoteModule: false',
                'encryptData',
                'decryptData'
            ];
            
            for (const feature of securityFeatures) {
                if (mainContent.includes(feature)) {
                    this.passed.push(`✓ Main process includes ${feature}`);
                } else {
                    this.errors.push(`✗ Main process missing ${feature}`);
                }
            }
            
        } catch (error) {
            this.errors.push(`✗ Security validation error: ${error.message}`);
        }
    }
    
    async validateDocumentation() {
        this.log('Validating documentation...', 'info');
        
        try {
            // Check README
            const readmePath = path.join(this.projectRoot, 'README.md');
            const readmeContent = await fs.readFile(readmePath, 'utf8');
            
            const readmeSections = [
                '# 🚀 NovaSignal Trading Platform',
                '## 🚀 Features',
                '## 🛠️ Installation & Setup',
                '## 📚 Documentation',
                '## 🤝 Contributing'
            ];
            
            for (const section of readmeSections) {
                if (readmeContent.includes(section)) {
                    this.passed.push(`✓ README includes ${section}`);
                } else {
                    this.warnings.push(`⚠ README missing ${section}`);
                }
            }
            
            // Check CHANGELOG
            if (await this.fileExists('CHANGELOG.md')) {
                const changelogContent = await fs.readFile(path.join(this.projectRoot, 'CHANGELOG.md'), 'utf8');
                if (changelogContent.includes('## [1.0.0]')) {
                    this.passed.push('✓ CHANGELOG includes v1.0.0 release notes');
                } else {
                    this.warnings.push('⚠ CHANGELOG missing v1.0.0 release notes');
                }
            }
            
            // Check SECURITY.md
            if (await this.fileExists('SECURITY.md')) {
                const securityContent = await fs.readFile(path.join(this.projectRoot, 'SECURITY.md'), 'utf8');
                if (securityContent.includes('security@novasignal.trading')) {
                    this.passed.push('✓ Security policy includes contact email');
                } else {
                    this.warnings.push('⚠ Security policy missing contact email');
                }
            }
            
        } catch (error) {
            this.errors.push(`✗ Documentation validation error: ${error.message}`);
        }
    }
    
    async validateTests() {
        this.log('Validating test files...', 'info');
        
        const testFiles = [
            'installer/test/installer.test.js',
            'installer/test/updater.test.js',
            'installer/test/integration.test.js'
        ];
        
        for (const testFile of testFiles) {
            if (await this.fileExists(testFile)) {
                try {
                    const content = await fs.readFile(path.join(this.projectRoot, testFile), 'utf8');
                    if (content.includes('describe(') && content.includes('it(')) {
                        this.passed.push(`✓ ${testFile} has proper test structure`);
                    } else {
                        this.warnings.push(`⚠ ${testFile} may not have proper test structure`);
                    }
                } catch (error) {
                    this.errors.push(`✗ Error reading test file ${testFile}: ${error.message}`);
                }
            }
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
        this.log('🚀 Starting NovaSignal Setup Validation', 'info');
        this.log('=' * 50, 'info');
        
        await this.checkRequiredFiles();
        await this.validatePackageJson();
        await this.validateElectronBuilderConfig();
        await this.validateGitHubActions();
        await this.validateSecurity();
        await this.validateDocumentation();
        await this.validateTests();
        await this.checkGitRepository();
        
        this.printSummary();
        
        return {
            success: this.errors.length === 0,
            errors: this.errors.length,
            warnings: this.warnings.length,
            passed: this.passed.length
        };
    }
    
    printSummary() {
        this.log('\n' + '=' * 50, 'info');
        this.log('📋 VALIDATION SUMMARY', 'info');
        this.log('=' * 50, 'info');
        
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
            this.log('✅ NovaSignal is ready for deployment', 'success');
        } else {
            this.log('\n❌ VALIDATION FAILED', 'error');
            this.log('🔧 Please fix the errors above before deploying', 'error');
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new ValidationSuite();
    validator.run().then(result => {
        process.exit(result.success ? 0 : 1);
    }).catch(error => {
        console.error('Validation script failed:', error);
        process.exit(1);
    });
}

module.exports = ValidationSuite;