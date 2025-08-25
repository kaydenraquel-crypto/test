const { expect } = require('chai');
const sinon = require('sinon');
const { EventEmitter } = require('events');
const UpdateManager = require('../src/updater');

// Mock electron modules
const mockAutoUpdater = new EventEmitter();
mockAutoUpdater.setFeedURL = sinon.stub();
mockAutoUpdater.checkForUpdatesAndNotify = sinon.stub().resolves();
mockAutoUpdater.downloadUpdate = sinon.stub();
mockAutoUpdater.quitAndInstall = sinon.stub();

const mockMainWindow = {
    setProgressBar: sinon.stub(),
    webContents: {
        send: sinon.stub()
    }
};

const mockDialog = {
    showMessageBox: sinon.stub(),
    showMessageBoxSync: sinon.stub().returns(0)
};

const mockNotification = sinon.stub();
mockNotification.isSupported = sinon.stub().returns(true);

// Mock the modules
const mockModules = {
    'electron-updater': { autoUpdater: mockAutoUpdater },
    'electron': { 
        dialog: mockDialog,
        Notification: mockNotification
    },
    'electron-log': {
        transports: { file: { level: 'info' } },
        info: sinon.stub()
    }
};

// Mock require
const originalRequire = require;
const mockRequire = (id) => {
    if (mockModules[id]) {
        return mockModules[id];
    }
    return originalRequire(id);
};

describe('UpdateManager', function() {
    let updateManager;
    let clock;
    
    beforeEach(function() {
        clock = sinon.useFakeTimers();
        
        // Reset all mocks
        Object.values(mockModules).forEach(mock => {
            if (mock && typeof mock === 'object') {
                Object.values(mock).forEach(method => {
                    if (method && method.resetHistory) {
                        method.resetHistory();
                    }
                });
            }
        });
        
        // Mock require for UpdateManager
        const Module = require('module');
        const originalLoad = Module._load;
        Module._load = function(request, parent) {
            if (mockModules[request]) {
                return mockModules[request];
            }
            return originalLoad.apply(this, arguments);
        };
        
        updateManager = new UpdateManager(mockMainWindow);
    });
    
    afterEach(function() {
        clock.restore();
        
        // Restore original require
        const Module = require('module');
        Module._load = originalRequire;
    });
    
    describe('Initialization', function() {
        it('should configure auto-updater feed URL', function() {
            expect(mockAutoUpdater.setFeedURL.calledOnce).to.be.true;
            
            const feedConfig = mockAutoUpdater.setFeedURL.getCall(0).args[0];
            expect(feedConfig.provider).to.equal('github');
            expect(feedConfig.owner).to.equal('your-username');
            expect(feedConfig.repo).to.equal('NovaSignal_v0_2');
            expect(feedConfig.private).to.be.true;
        });
        
        it('should schedule automatic update checks', function() {
            // Fast-forward to trigger initial update check (10 seconds)
            clock.tick(10000);
            expect(mockAutoUpdater.checkForUpdatesAndNotify.calledOnce).to.be.true;
        });
        
        it('should schedule periodic update checks', function() {
            // Fast-forward 4 hours
            clock.tick(4 * 60 * 60 * 1000);
            
            // Should have called update check (initial + periodic)
            expect(mockAutoUpdater.checkForUpdatesAndNotify.callCount).to.be.at.least(2);
        });
    });
    
    describe('Update Status Events', function() {
        it('should handle checking-for-update event', function() {
            mockAutoUpdater.emit('checking-for-update');
            
            expect(mockMainWindow.webContents.send.calledWith('update-status')).to.be.true;
            const statusCall = mockMainWindow.webContents.send.getCall(0);
            expect(statusCall.args[1].status).to.equal('checking');
        });
        
        it('should handle update-available event', function() {
            const updateInfo = { version: '1.1.0' };
            mockAutoUpdater.emit('update-available', updateInfo);
            
            expect(updateManager.isUpdateAvailable).to.be.true;
            expect(mockMainWindow.webContents.send.calledWith('update-status')).to.be.true;
            
            const statusCall = mockMainWindow.webContents.send.getCall(0);
            expect(statusCall.args[1].status).to.equal('available');
            expect(statusCall.args[1].data).to.deep.equal(updateInfo);
        });
        
        it('should handle update-not-available event', function() {
            const updateInfo = { version: '1.0.0' };
            mockAutoUpdater.emit('update-not-available', updateInfo);
            
            expect(updateManager.isUpdateAvailable).to.be.false;
            expect(mockMainWindow.webContents.send.calledWith('update-status')).to.be.true;
            
            const statusCall = mockMainWindow.webContents.send.getCall(0);
            expect(statusCall.args[1].status).to.equal('not-available');
        });
        
        it('should handle download-progress event', function() {
            const progressObj = { percent: 45.5, transferred: 1024, total: 2048 };
            mockAutoUpdater.emit('download-progress', progressObj);
            
            expect(mockMainWindow.setProgressBar.calledWith(0.455)).to.be.true;
            expect(mockMainWindow.webContents.send.calledWith('update-status')).to.be.true;
            
            const statusCall = mockMainWindow.webContents.send.getCall(0);
            expect(statusCall.args[1].status).to.equal('downloading');
            expect(statusCall.args[1].data).to.deep.equal(progressObj);
        });
        
        it('should handle update-downloaded event', function() {
            const updateInfo = { version: '1.1.0' };
            mockAutoUpdater.emit('update-downloaded', updateInfo);
            
            expect(updateManager.isUpdateDownloaded).to.be.true;
            expect(mockMainWindow.setProgressBar.calledWith(-1)).to.be.true;
            expect(mockMainWindow.webContents.send.calledWith('update-status')).to.be.true;
            
            const statusCall = mockMainWindow.webContents.send.getCall(0);
            expect(statusCall.args[1].status).to.equal('downloaded');
            expect(statusCall.args[1].data).to.deep.equal(updateInfo);
        });
        
        it('should handle error event', function() {
            const error = new Error('Update failed');
            mockAutoUpdater.emit('error', error);
            
            expect(mockMainWindow.webContents.send.calledWith('update-status')).to.be.true;
            
            const statusCall = mockMainWindow.webContents.send.getCall(0);
            expect(statusCall.args[1].status).to.equal('error');
            expect(statusCall.args[1].data.message).to.equal('Update failed');
        });
    });
    
    describe('Notification System', function() {
        beforeEach(function() {
            // Mock notification constructor
            mockNotification.mockImplementation = function(options) {
                this.options = options;
                this.on = sinon.stub();
                this.show = sinon.stub();
            };
        });
        
        it('should show notification when update is available', function() {
            const updateInfo = { version: '1.1.0' };
            updateManager.showUpdateAvailableNotification(updateInfo);
            
            // Verify notification was created and shown
            expect(mockNotification.called).to.be.true;
        });
        
        it('should show notification when update is ready', function() {
            const updateInfo = { version: '1.1.0' };
            updateManager.showUpdateReadyNotification(updateInfo);
            
            // Should show notification and dialog
            expect(mockNotification.called).to.be.true;
            
            // Fast-forward to trigger dialog
            clock.tick(2000);
            expect(mockDialog.showMessageBoxSync.called).to.be.true;
        });
    });
    
    describe('Manual Update Operations', function() {
        it('should check for updates manually', async function() {
            mockAutoUpdater.checkForUpdatesAndNotify.resolves({ updateInfo: { version: '1.1.0' } });
            
            const result = await updateManager.manualUpdateCheck();
            
            expect(mockAutoUpdater.checkForUpdatesAndNotify.called).to.be.true;
            expect(result).to.have.property('updateInfo');
        });
        
        it('should show dialog when no update is available', async function() {
            updateManager.isUpdateAvailable = false;
            mockAutoUpdater.checkForUpdatesAndNotify.resolves({ updateInfo: null });
            
            await updateManager.checkForUpdates(true);
            
            expect(mockDialog.showMessageBox.called).to.be.true;
            const dialogCall = mockDialog.showMessageBox.getCall(0);
            expect(dialogCall.args[1].title).to.equal('No Updates Available');
        });
        
        it('should download update when available', function() {
            updateManager.isUpdateAvailable = true;
            updateManager.isUpdateDownloaded = false;
            
            updateManager.downloadUpdate();
            
            expect(mockAutoUpdater.downloadUpdate.called).to.be.true;
        });
        
        it('should restart and install when update is downloaded', function() {
            updateManager.isUpdateDownloaded = true;
            
            updateManager.restartAndUpdate();
            
            expect(mockAutoUpdater.quitAndInstall.calledWith(false, true)).to.be.true;
        });
        
        it('should get current update status', function() {
            updateManager.isUpdateAvailable = true;
            updateManager.isUpdateDownloaded = false;
            
            const status = updateManager.getUpdateStatus();
            
            expect(status.isUpdateAvailable).to.be.true;
            expect(status.isUpdateDownloaded).to.be.false;
            expect(status).to.have.property('version');
        });
    });
    
    describe('Restart Dialog', function() {
        it('should restart immediately when user chooses', function() {
            mockDialog.showMessageBoxSync.returns(0); // "Restart Now"
            
            const updateInfo = { version: '1.1.0' };
            updateManager.showRestartDialog(updateInfo);
            
            expect(mockDialog.showMessageBoxSync.called).to.be.true;
            expect(mockAutoUpdater.quitAndInstall.called).to.be.true;
        });
        
        it('should not restart when user chooses later', function() {
            mockDialog.showMessageBoxSync.returns(1); // "Later"
            
            const updateInfo = { version: '1.1.0' };
            updateManager.showRestartDialog(updateInfo);
            
            expect(mockDialog.showMessageBoxSync.called).to.be.true;
            expect(mockAutoUpdater.quitAndInstall.called).to.be.false;
        });
    });
    
    describe('Error Handling', function() {
        it('should handle update check failures gracefully', async function() {
            const error = new Error('Network error');
            mockAutoUpdater.checkForUpdatesAndNotify.rejects(error);
            
            try {
                await updateManager.checkForUpdates(true);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect(err.message).to.equal('Network error');
                expect(mockDialog.showMessageBox.called).to.be.true;
                
                const dialogCall = mockDialog.showMessageBox.getCall(0);
                expect(dialogCall.args[1].type).to.equal('error');
            }
        });
        
        it('should handle missing main window gracefully', function() {
            const updateManagerWithoutWindow = new UpdateManager(null);
            
            // Should not throw when sending status updates
            expect(() => {
                updateManagerWithoutWindow.sendUpdateStatus('test');
            }).to.not.throw();
        });
    });
    
    describe('Logging', function() {
        it('should log update events', function() {
            const mockLog = mockModules['electron-log'];
            
            updateManager.log('Test message');
            
            expect(mockLog.info.called).to.be.true;
            expect(mockLog.info.calledWith('[UpdateManager]', 'Test message')).to.be.true;
        });
    });
    
    describe('Integration with Main Process', function() {
        it('should provide correct IPC handlers', async function() {
            // Test manual update check
            const result = await updateManager.manualUpdateCheck();
            expect(mockAutoUpdater.checkForUpdatesAndNotify.called).to.be.true;
            
            // Test download and install
            updateManager.isUpdateAvailable = true;
            await updateManager.downloadAndInstall();
            expect(mockAutoUpdater.downloadUpdate.called).to.be.true;
            
            // Test status retrieval
            const status = updateManager.getUpdateStatus();
            expect(status).to.have.property('isUpdateAvailable');
            expect(status).to.have.property('isUpdateDownloaded');
            expect(status).to.have.property('version');
        });
    });
});