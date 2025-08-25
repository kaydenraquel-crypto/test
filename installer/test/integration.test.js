const { expect } = require('chai');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

describe('NovaSignal Integration Tests', function() {
    this.timeout(60000); // Allow 60 seconds for integration tests
    
    const testDir = path.join(__dirname, '..', '..', '..');
    const installerDir = path.join(testDir, 'installer');
    const frontendDir = path.join(testDir, 'frontend');
    const backendDir = path.join(testDir, 'backend');
    
    describe('Project Structure', function() {
        it('should have all required directories', async function() {
            const requiredDirs = [
                'installer/src',
                'installer/assets/icons',
                'installer/assets/images',
                'installer/test',
                'frontend/src',
                'backend',
                '.github/workflows'
            ];
            
            for (const dir of requiredDirs) {
                const fullPath = path.join(testDir, dir);
                const exists = await fs.access(fullPath).then(() => true).catch(() => false);
                expect(exists, `Directory ${dir} should exist`).to.be.true;
            }
        });
        
        it('should have all required configuration files', async function() {
            const requiredFiles = [
                'package.json',
                'README.md',
                'LICENSE',
                'CHANGELOG.md',
                'CONTRIBUTING.md',
                'SECURITY.md',
                '.gitignore',
                '.github/workflows/ci.yml',
                'installer/package.json',
                'installer/electron-builder.config.js',
                'installer/src/main.js',
                'installer/src/wizard.html',
                'installer/src/wizard.css',
                'installer/src/wizard.js',
                'installer/src/preload.js',
                'installer/src/updater.js'
            ];
            
            for (const file of requiredFiles) {
                const fullPath = path.join(testDir, file);
                const exists = await fs.access(fullPath).then(() => true).catch(() => false);
                expect(exists, `File ${file} should exist`).to.be.true;
            }
        });
    });
    
    describe('Package Configurations', function() {
        it('should have valid root package.json', async function() {
            const packagePath = path.join(testDir, 'package.json');
            const packageContent = await fs.readFile(packagePath, 'utf8');
            const packageData = JSON.parse(packageContent);
            
            expect(packageData.name).to.equal('novasignal-trading-platform');
            expect(packageData.version).to.equal('1.0.0');
            expect(packageData.private).to.be.true;
            expect(packageData.workspaces).to.be.an('array').that.includes('frontend', 'installer');
        });
        
        it('should have valid installer package.json', async function() {
            const packagePath = path.join(installerDir, 'package.json');
            const packageContent = await fs.readFile(packagePath, 'utf8');
            const packageData = JSON.parse(packageContent);
            
            expect(packageData.name).to.equal('novasignal-installer');
            expect(packageData.main).to.equal('src/main.js');
            expect(packageData.dependencies).to.have.property('electron');
            expect(packageData.dependencies).to.have.property('electron-updater');
            expect(packageData.dependencies).to.have.property('electron-store');
        });
        
        it('should have valid electron-builder configuration', async function() {
            const configPath = path.join(installerDir, 'electron-builder.config.js');
            const exists = await fs.access(configPath).then(() => true).catch(() => false);
            expect(exists).to.be.true;
            
            // Load and validate config
            const config = require(configPath);
            expect(config.appId).to.equal('com.novasignal.trading');
            expect(config.productName).to.equal('NovaSignal Trading Platform');
            expect(config.win).to.be.an('object');
            expect(config.mac).to.be.an('object');
            expect(config.linux).to.be.an('object');
        });
    });
    
    describe('Frontend Dependencies', function() {
        it('should have frontend package.json with required dependencies', async function() {
            const packagePath = path.join(frontendDir, 'package.json');
            const exists = await fs.access(packagePath).then(() => true).catch(() => false);
            
            if (exists) {
                const packageContent = await fs.readFile(packagePath, 'utf8');
                const packageData = JSON.parse(packageContent);
                
                // Check for key frontend dependencies
                expect(packageData.dependencies || packageData.devDependencies).to.satisfy((deps) => {
                    return deps.react || deps.vue || deps['@angular/core'];
                }, 'Should have a frontend framework');
            }
        });
    });
    
    describe('Backend Dependencies', function() {
        it('should have backend requirements.txt', async function() {
            const reqPath = path.join(backendDir, 'requirements.txt');
            const exists = await fs.access(reqPath).then(() => true).catch(() => false);
            
            if (exists) {
                const reqContent = await fs.readFile(reqPath, 'utf8');
                expect(reqContent).to.include('fastapi');
                expect(reqContent).to.include('uvicorn');
            }
        });
        
        it('should have main.py entry point', async function() {
            const mainPath = path.join(backendDir, 'main.py');
            const exists = await fs.access(mainPath).then(() => true).catch(() => false);
            
            if (exists) {
                const mainContent = await fs.readFile(mainPath, 'utf8');
                expect(mainContent).to.include('FastAPI');
                expect(mainContent).to.include('app = FastAPI');
            }
        });
    });
    
    describe('CI/CD Configuration', function() {
        it('should have valid GitHub Actions workflow', async function() {
            const workflowPath = path.join(testDir, '.github/workflows/ci.yml');
            const workflowContent = await fs.readFile(workflowPath, 'utf8');
            
            // Basic YAML validation
            expect(workflowContent).to.include('name:');
            expect(workflowContent).to.include('on:');
            expect(workflowContent).to.include('jobs:');
            
            // Check for required jobs
            expect(workflowContent).to.include('frontend:');
            expect(workflowContent).to.include('backend:');
            expect(workflowContent).to.include('security:');
            expect(workflowContent).to.include('installer-windows:');
            expect(workflowContent).to.include('installer-macos:');
            expect(workflowContent).to.include('installer-linux:');
        });
    });
    
    describe('Security Configuration', function() {
        it('should have proper .gitignore', async function() {
            const gitignorePath = path.join(testDir, '.gitignore');
            const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
            
            // Check for security-sensitive patterns
            expect(gitignoreContent).to.include('*.env');
            expect(gitignoreContent).to.include('node_modules/');
            expect(gitignoreContent).to.include('.venv/');
            expect(gitignoreContent).to.include('__pycache__/');
            expect(gitignoreContent).to.include('certificate/');
            expect(gitignoreContent).to.include('keys/');
        });
        
        it('should have security policy', async function() {
            const securityPath = path.join(testDir, 'SECURITY.md');
            const securityContent = await fs.readFile(securityPath, 'utf8');
            
            expect(securityContent).to.include('Security Policy');
            expect(securityContent).to.include('Reporting a Vulnerability');
            expect(securityContent).to.include('security@novasignal.trading');
        });
    });
    
    describe('Documentation', function() {
        it('should have comprehensive README', async function() {
            const readmePath = path.join(testDir, 'README.md');
            const readmeContent = await fs.readFile(readmePath, 'utf8');
            
            expect(readmeContent).to.include('# 🚀 NovaSignal Trading Platform');
            expect(readmeContent).to.include('## 🚀 Features');
            expect(readmeContent).to.include('## 🛠️ Installation & Setup');
            expect(readmeContent).to.include('## 📚 Documentation');
            expect(readmeContent).to.include('## 🤝 Contributing');
        });
        
        it('should have proper changelog format', async function() {
            const changelogPath = path.join(testDir, 'CHANGELOG.md');
            const changelogContent = await fs.readFile(changelogPath, 'utf8');
            
            expect(changelogContent).to.include('# Changelog');
            expect(changelogContent).to.include('## [Unreleased]');
            expect(changelogContent).to.include('## [1.0.0]');
            expect(changelogContent).to.include('### 🚀 Added');
        });
        
        it('should have contributing guidelines', async function() {
            const contributingPath = path.join(testDir, 'CONTRIBUTING.md');
            const contributingContent = await fs.readFile(contributingPath, 'utf8');
            
            expect(contributingContent).to.include('# Contributing to NovaSignal');
            expect(contributingContent).to.include('## 🤝 How to Contribute');
            expect(contributingContent).to.include('## 📝 Development Guidelines');
            expect(contributingContent).to.include('## 🛡️ Security Guidelines');
        });
    });
    
    describe('Installer Wizard Files', function() {
        it('should have valid wizard HTML structure', async function() {
            const wizardPath = path.join(installerDir, 'src/wizard.html');
            const wizardContent = await fs.readFile(wizardPath, 'utf8');
            
            expect(wizardContent).to.include('<!DOCTYPE html>');
            expect(wizardContent).to.include('NovaSignal Setup Wizard');
            expect(wizardContent).to.include('wizard-container');
            expect(wizardContent).to.include('step-welcome');
            expect(wizardContent).to.include('step-api-config');
            expect(wizardContent).to.include('step-preferences');
            expect(wizardContent).to.include('step-complete');
        });
        
        it('should have wizard CSS with proper styling', async function() {
            const cssPath = path.join(installerDir, 'src/wizard.css');
            const cssContent = await fs.readFile(cssPath, 'utf8');
            
            expect(cssContent).to.include('.wizard-container');
            expect(cssContent).to.include('.wizard-step');
            expect(cssContent).to.include('.progress-container');
            expect(cssContent).to.include('@media (max-width: 768px)'); // Responsive design
        });
        
        it('should have wizard JavaScript with proper functionality', async function() {
            const jsPath = path.join(installerDir, 'src/wizard.js');
            const jsContent = await fs.readFile(jsPath, 'utf8');
            
            expect(jsContent).to.include('let currentStep');
            expect(jsContent).to.include('function nextStep');
            expect(jsContent).to.include('function previousStep');
            expect(jsContent).to.include('function validateCurrentStep');
            expect(jsContent).to.include('function launchApplication');
        });
    });
    
    describe('Update System Files', function() {
        it('should have UpdateManager with proper structure', async function() {
            const updaterPath = path.join(installerDir, 'src/updater.js');
            const updaterContent = await fs.readFile(updaterPath, 'utf8');
            
            expect(updaterContent).to.include('class UpdateManager');
            expect(updaterContent).to.include('setupAutoUpdater');
            expect(updaterContent).to.include('checkForUpdates');
            expect(updaterContent).to.include('downloadUpdate');
            expect(updaterContent).to.include('restartAndUpdate');
        });
        
        it('should have update UI components', async function() {
            const updateUIPath = path.join(installerDir, 'src/update-ui.js');
            const updateUIContent = await fs.readFile(updateUIPath, 'utf8');
            
            expect(updateUIContent).to.include('class UpdateUI');
            expect(updateUIContent).to.include('createUpdateUI');
            expect(updateUIContent).to.include('handleUpdateStatus');
            expect(updateUIContent).to.include('showUpdateAvailable');
            expect(updateUIContent).to.include('showDownloadProgress');
        });
    });
    
    describe('Main Process Configuration', function() {
        it('should have secure main.js configuration', async function() {
            const mainPath = path.join(installerDir, 'src/main.js');
            const mainContent = await fs.readFile(mainPath, 'utf8');
            
            // Check for security settings
            expect(mainContent).to.include('nodeIntegration: false');
            expect(mainContent).to.include('contextIsolation: true');
            expect(mainContent).to.include('enableRemoteModule: false');
            
            // Check for proper IPC handlers
            expect(mainContent).to.include('ipcMain.handle');
            expect(mainContent).to.include('save-api-keys');
            expect(mainContent).to.include('load-api-keys');
            expect(mainContent).to.include('check-for-updates');
            
            // Check for encryption functions
            expect(mainContent).to.include('encryptData');
            expect(mainContent).to.include('decryptData');
            expect(mainContent).to.include('aes-256-cbc');
        });
        
        it('should have secure preload.js', async function() {
            const preloadPath = path.join(installerDir, 'src/preload.js');
            const preloadContent = await fs.readFile(preloadPath, 'utf8');
            
            expect(preloadContent).to.include('contextBridge.exposeInMainWorld');
            expect(preloadContent).to.include('electronAPI');
            expect(preloadContent).to.include('ipcRenderer.invoke');
            
            // Should not expose dangerous APIs
            expect(preloadContent).to.not.include('require(');
            expect(preloadContent).to.not.include('nodeIntegration');
        });
    });
    
    describe('Build System Validation', function() {
        it('should have npm scripts available', function() {
            const packagePath = path.join(testDir, 'package.json');
            const packageData = require(packagePath);
            
            const requiredScripts = [
                'dev',
                'dev:setup',
                'build',
                'test',
                'lint'
            ];
            
            for (const script of requiredScripts) {
                expect(packageData.scripts, `Root package should have ${script} script`).to.have.property(script);
            }
        });
        
        it('should have installer build scripts', function() {
            const packagePath = path.join(installerDir, 'package.json');
            const packageData = require(packagePath);
            
            const requiredScripts = [
                'start',
                'dev',
                'build:windows',
                'build:macos', 
                'build:linux',
                'test'
            ];
            
            for (const script of requiredScripts) {
                expect(packageData.scripts, `Installer should have ${script} script`).to.have.property(script);
            }
        });
    });
    
    describe('Asset Management', function() {
        it('should have asset directories', async function() {
            const assetDirs = [
                'installer/assets/icons',
                'installer/assets/images',
                'installer/assets/providers'
            ];
            
            for (const dir of assetDirs) {
                const fullPath = path.join(testDir, dir);
                const exists = await fs.access(fullPath).then(() => true).catch(() => false);
                expect(exists, `Asset directory ${dir} should exist`).to.be.true;
            }
        });
        
        it('should have placeholder icons', async function() {
            const iconFiles = [
                'installer/assets/icons/icon.svg',
                'installer/assets/icons/README.md'
            ];
            
            for (const iconFile of iconFiles) {
                const fullPath = path.join(testDir, iconFile);
                const exists = await fs.access(fullPath).then(() => true).catch(() => false);
                expect(exists, `Icon file ${iconFile} should exist`).to.be.true;
            }
        });
    });
    
    describe('Testing Infrastructure', function() {
        it('should have proper test files', async function() {
            const testFiles = [
                'installer/test/installer.test.js',
                'installer/test/updater.test.js',
                'installer/test/integration.test.js'
            ];
            
            for (const testFile of testFiles) {
                const fullPath = path.join(testDir, testFile);
                const exists = await fs.access(fullPath).then(() => true).catch(() => false);
                expect(exists, `Test file ${testFile} should exist`).to.be.true;
            }
        });
        
        it('should have test dependencies', function() {
            const packagePath = path.join(installerDir, 'package.json');
            const packageData = require(packagePath);
            
            const testDeps = ['mocha', 'chai', 'sinon', 'spectron'];
            
            for (const dep of testDeps) {
                expect(packageData.devDependencies, `Should have ${dep} test dependency`).to.have.property(dep);
            }
        });
    });
});