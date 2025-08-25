// Frontend update UI management for the main application
class UpdateUI {
    constructor() {
        this.updateStatus = 'idle';
        this.updateInfo = null;
        this.progressPercent = 0;
        
        this.createUpdateUI();
        this.bindEvents();
        this.requestUpdateStatus();
    }
    
    createUpdateUI() {
        // Create update notification container
        const updateContainer = document.createElement('div');
        updateContainer.id = 'update-container';
        updateContainer.innerHTML = `
            <div class="update-notification" id="update-notification" style="display: none;">
                <div class="update-content">
                    <div class="update-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <div class="update-text">
                        <div class="update-title" id="update-title">Update Available</div>
                        <div class="update-description" id="update-description">A new version of NovaSignal is available.</div>
                        <div class="update-progress" id="update-progress" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                            </div>
                            <div class="progress-text" id="progress-text">0%</div>
                        </div>
                    </div>
                    <div class="update-actions">
                        <button class="update-btn secondary" id="update-later" style="display: none;">Later</button>
                        <button class="update-btn primary" id="update-download">Download</button>
                        <button class="update-btn primary" id="update-restart" style="display: none;">Restart Now</button>
                        <button class="update-btn secondary" id="update-close">×</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #update-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 10000;
                pointer-events: none;
            }
            
            .update-notification {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 16px 24px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                transform: translateY(-100%);
                transition: transform 0.3s ease-in-out;
                pointer-events: all;
            }
            
            .update-notification.show {
                transform: translateY(0);
            }
            
            .update-content {
                display: flex;
                align-items: center;
                gap: 16px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .update-icon {
                flex-shrink: 0;
            }
            
            .update-icon svg {
                width: 24px;
                height: 24px;
                opacity: 0.9;
            }
            
            .update-text {
                flex: 1;
                min-width: 0;
            }
            
            .update-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 2px;
            }
            
            .update-description {
                font-size: 13px;
                opacity: 0.9;
                line-height: 1.4;
            }
            
            .update-progress {
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .progress-bar {
                flex: 1;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                transition: width 0.3s ease;
                border-radius: 2px;
            }
            
            .progress-text {
                font-size: 12px;
                font-weight: 500;
                min-width: 40px;
                text-align: right;
            }
            
            .update-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .update-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }
            
            .update-btn.primary {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .update-btn.primary:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .update-btn.secondary {
                background: transparent;
                color: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .update-btn.secondary:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .update-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            /* Update spinner */
            .update-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .update-content {
                    padding: 0 16px;
                }
                
                .update-actions {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .update-btn {
                    padding: 6px 12px;
                    font-size: 12px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(updateContainer);
    }
    
    bindEvents() {
        // Download update
        document.getElementById('update-download').addEventListener('click', () => {
            this.downloadUpdate();
        });
        
        // Restart and install
        document.getElementById('update-restart').addEventListener('click', () => {
            this.restartAndInstall();
        });
        
        // Close notification
        document.getElementById('update-close').addEventListener('click', () => {
            this.hideNotification();
        });
        
        // Later button
        document.getElementById('update-later').addEventListener('click', () => {
            this.hideNotification();
            // Show again in 30 minutes
            setTimeout(() => {
                if (this.updateStatus === 'available') {
                    this.showNotification();
                }
            }, 30 * 60 * 1000);
        });
        
        // Listen for update status from main process
        if (window.electronAPI && window.electronAPI.onUpdateStatus) {
            window.electronAPI.onUpdateStatus((status, data) => {
                this.handleUpdateStatus(status, data);
            });
        }
    }
    
    async requestUpdateStatus() {
        if (window.electronAPI && window.electronAPI.getUpdateStatus) {
            try {
                const status = await window.electronAPI.getUpdateStatus();
                this.handleUpdateStatus('status', status);
            } catch (error) {
                console.error('Error requesting update status:', error);
            }
        }
    }
    
    handleUpdateStatus(status, data) {
        this.updateStatus = status;
        
        switch (status) {
            case 'checking':
                this.showCheckingState();
                break;
                
            case 'available':
                this.updateInfo = data;
                this.showUpdateAvailable(data);
                break;
                
            case 'not-available':
                this.hideNotification();
                break;
                
            case 'downloading':
                this.showDownloadProgress(data);
                break;
                
            case 'downloaded':
                this.updateInfo = data;
                this.showUpdateReady(data);
                break;
                
            case 'error':
                this.showUpdateError(data);
                break;
                
            case 'status':
                this.handleStatusResponse(data);
                break;
        }
    }
    
    handleStatusResponse(data) {
        if (data.isUpdateAvailable) {
            this.showUpdateAvailable({ version: 'latest' });
        } else if (data.isUpdateDownloaded) {
            this.showUpdateReady({ version: 'latest' });
        }
    }
    
    showCheckingState() {
        const title = document.getElementById('update-title');
        const description = document.getElementById('update-description');
        
        title.textContent = 'Checking for Updates';
        description.innerHTML = '<div class="update-spinner"></div>Checking for the latest version...';
        
        this.showNotification();
    }
    
    showUpdateAvailable(info) {
        const title = document.getElementById('update-title');
        const description = document.getElementById('update-description');
        const downloadBtn = document.getElementById('update-download');
        const laterBtn = document.getElementById('update-later');
        const restartBtn = document.getElementById('update-restart');
        const progressContainer = document.getElementById('update-progress');
        
        title.textContent = 'Update Available';
        description.textContent = `NovaSignal ${info.version || 'latest'} is available with new features and improvements.`;
        
        downloadBtn.style.display = 'block';
        laterBtn.style.display = 'block';
        restartBtn.style.display = 'none';
        progressContainer.style.display = 'none';
        
        this.showNotification();
    }
    
    showDownloadProgress(progressInfo) {
        const title = document.getElementById('update-title');
        const description = document.getElementById('update-description');
        const downloadBtn = document.getElementById('update-download');
        const laterBtn = document.getElementById('update-later');
        const progressContainer = document.getElementById('update-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        title.textContent = 'Downloading Update';
        description.textContent = 'Please wait while the update is being downloaded...';
        
        downloadBtn.style.display = 'none';
        laterBtn.style.display = 'none';
        progressContainer.style.display = 'flex';
        
        if (progressInfo.percent !== undefined) {
            this.progressPercent = Math.round(progressInfo.percent);
            progressFill.style.width = `${this.progressPercent}%`;
            progressText.textContent = `${this.progressPercent}%`;
        }
        
        this.showNotification();
    }
    
    showUpdateReady(info) {
        const title = document.getElementById('update-title');
        const description = document.getElementById('update-description');
        const downloadBtn = document.getElementById('update-download');
        const laterBtn = document.getElementById('update-later');
        const restartBtn = document.getElementById('update-restart');
        const progressContainer = document.getElementById('update-progress');
        
        title.textContent = 'Update Ready';
        description.textContent = `NovaSignal ${info.version || 'latest'} has been downloaded and is ready to install.`;
        
        downloadBtn.style.display = 'none';
        laterBtn.style.display = 'block';
        restartBtn.style.display = 'block';
        progressContainer.style.display = 'none';
        
        this.showNotification();
    }
    
    showUpdateError(errorInfo) {
        const title = document.getElementById('update-title');
        const description = document.getElementById('update-description');
        const downloadBtn = document.getElementById('update-download');
        const laterBtn = document.getElementById('update-later');
        const restartBtn = document.getElementById('update-restart');
        
        title.textContent = 'Update Error';
        description.textContent = `Unable to update: ${errorInfo.message || 'Unknown error'}`;
        
        downloadBtn.textContent = 'Retry';
        downloadBtn.style.display = 'block';
        laterBtn.style.display = 'block';
        restartBtn.style.display = 'none';
        
        this.showNotification();
    }
    
    showNotification() {
        const notification = document.getElementById('update-notification');
        notification.style.display = 'block';
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }
    
    hideNotification() {
        const notification = document.getElementById('update-notification');
        notification.classList.remove('show');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }
    
    async downloadUpdate() {
        if (window.electronAPI && window.electronAPI.downloadUpdate) {
            try {
                await window.electronAPI.downloadUpdate();
            } catch (error) {
                console.error('Error downloading update:', error);
            }
        }
    }
    
    async restartAndInstall() {
        if (window.electronAPI && window.electronAPI.restartAndUpdate) {
            try {
                await window.electronAPI.restartAndUpdate();
            } catch (error) {
                console.error('Error restarting for update:', error);
            }
        }
    }
    
    async checkForUpdates() {
        if (window.electronAPI && window.electronAPI.checkForUpdates) {
            try {
                await window.electronAPI.checkForUpdates();
            } catch (error) {
                console.error('Error checking for updates:', error);
            }
        }
    }
}

// Initialize update UI when DOM is loaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof window !== 'undefined' && window.electronAPI) {
                new UpdateUI();
            }
        });
    } else {
        if (typeof window !== 'undefined' && window.electronAPI) {
            new UpdateUI();
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpdateUI;
}