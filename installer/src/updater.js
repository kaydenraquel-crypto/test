const { autoUpdater } = require('electron-updater');
const { dialog, Notification } = require('electron');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

class UpdateManager {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.isUpdateAvailable = false;
        this.isUpdateDownloaded = false;
        
        this.setupAutoUpdater();
        this.scheduleUpdateCheck();
    }
    
    setupAutoUpdater() {
        // Configure update server
        autoUpdater.setFeedURL({
            provider: 'github',
            owner: 'your-username',
            repo: 'NovaSignal_v0_2',
            private: true,
            token: process.env.GITHUB_TOKEN // Set in production
        });
        
        // Auto-updater event handlers
        autoUpdater.on('checking-for-update', () => {
            this.log('Checking for update...');
            this.sendUpdateStatus('checking');
        });
        
        autoUpdater.on('update-available', (info) => {
            this.log('Update available:', info);
            this.isUpdateAvailable = true;
            this.sendUpdateStatus('available', info);
            this.showUpdateAvailableNotification(info);
        });
        
        autoUpdater.on('update-not-available', (info) => {
            this.log('Update not available:', info);
            this.sendUpdateStatus('not-available', info);
        });
        
        autoUpdater.on('error', (err) => {
            this.log('Auto-updater error:', err);
            this.sendUpdateStatus('error', { message: err.message });
        });
        
        autoUpdater.on('download-progress', (progressObj) => {
            this.log('Download progress:', progressObj);
            this.sendUpdateStatus('downloading', progressObj);
            
            // Update progress in taskbar
            if (this.mainWindow) {
                this.mainWindow.setProgressBar(progressObj.percent / 100);
            }
        });
        
        autoUpdater.on('update-downloaded', (info) => {
            this.log('Update downloaded:', info);
            this.isUpdateDownloaded = true;
            this.sendUpdateStatus('downloaded', info);
            
            // Clear progress bar
            if (this.mainWindow) {
                this.mainWindow.setProgressBar(-1);
            }
            
            this.showUpdateReadyNotification(info);
        });
    }
    
    scheduleUpdateCheck() {
        // Check for updates on startup (after 10 seconds)
        setTimeout(() => {
            this.checkForUpdates();
        }, 10000);
        
        // Check for updates every 4 hours
        setInterval(() => {
            this.checkForUpdates();
        }, 4 * 60 * 60 * 1000);
    }
    
    async checkForUpdates(showNoUpdateDialog = false) {
        try {
            this.log('Manually checking for updates...');
            const updateCheckResult = await autoUpdater.checkForUpdatesAndNotify();
            
            if (showNoUpdateDialog && !this.isUpdateAvailable) {
                dialog.showMessageBox(this.mainWindow, {
                    type: 'info',
                    title: 'No Updates Available',
                    message: 'You are running the latest version of NovaSignal.',
                    detail: `Current version: ${require('../../package.json').version}`,
                    buttons: ['OK']
                });
            }
            
            return updateCheckResult;
        } catch (error) {
            this.log('Error checking for updates:', error);
            
            if (showNoUpdateDialog) {
                dialog.showMessageBox(this.mainWindow, {
                    type: 'error',
                    title: 'Update Check Failed',
                    message: 'Unable to check for updates.',
                    detail: error.message,
                    buttons: ['OK']
                });
            }
            
            throw error;
        }
    }
    
    showUpdateAvailableNotification(info) {
        if (Notification.isSupported()) {
            const notification = new Notification({
                title: 'NovaSignal Update Available',
                body: `Version ${info.version} is now available. Click to download.`,
                icon: require('path').join(__dirname, '..', 'assets', 'icons', 'icon.png')
            });
            
            notification.on('click', () => {
                this.downloadUpdate();
            });
            
            notification.show();
        }
    }
    
    showUpdateReadyNotification(info) {
        if (Notification.isSupported()) {
            const notification = new Notification({
                title: 'NovaSignal Update Ready',
                body: `Version ${info.version} has been downloaded and is ready to install.`,
                icon: require('path').join(__dirname, '..', 'assets', 'icons', 'icon.png')
            });
            
            notification.on('click', () => {
                this.showRestartDialog(info);
            });
            
            notification.show();
        }
        
        // Also show dialog for immediate attention
        setTimeout(() => {
            this.showRestartDialog(info);
        }, 2000);
    }
    
    showRestartDialog(info) {
        const choice = dialog.showMessageBoxSync(this.mainWindow, {
            type: 'info',
            buttons: ['Restart Now', 'Later'],
            title: 'Update Ready',
            message: `NovaSignal ${info.version} is ready to install`,
            detail: 'The application will restart to complete the update. Any unsaved work will be preserved.',
            defaultId: 0,
            cancelId: 1
        });
        
        if (choice === 0) {
            this.restartAndUpdate();
        }
    }
    
    downloadUpdate() {
        if (this.isUpdateAvailable && !this.isUpdateDownloaded) {
            autoUpdater.downloadUpdate();
        }
    }
    
    restartAndUpdate() {
        if (this.isUpdateDownloaded) {
            autoUpdater.quitAndInstall(false, true);
        }
    }
    
    sendUpdateStatus(status, data = null) {
        if (this.mainWindow && this.mainWindow.webContents) {
            this.mainWindow.webContents.send('update-status', {
                status,
                data,
                timestamp: Date.now()
            });
        }
    }
    
    log(...args) {
        console.log('[UpdateManager]', ...args);
        if (log && log.info) {
            log.info('[UpdateManager]', ...args);
        }
    }
    
    // Public methods for IPC
    async manualUpdateCheck() {
        return await this.checkForUpdates(true);
    }
    
    getUpdateStatus() {
        return {
            isUpdateAvailable: this.isUpdateAvailable,
            isUpdateDownloaded: this.isUpdateDownloaded,
            version: require('../../package.json').version
        };
    }
    
    async downloadAndInstall() {
        if (this.isUpdateAvailable && !this.isUpdateDownloaded) {
            this.downloadUpdate();
        } else if (this.isUpdateDownloaded) {
            this.restartAndUpdate();
        }
    }
}

module.exports = UpdateManager;