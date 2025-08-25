const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // API Key management
  saveApiKeys: (keys) => ipcRenderer.invoke('save-api-keys', keys),
  loadApiKeys: () => ipcRenderer.invoke('load-api-keys'),
  
  // Setup management
  checkSetup: () => ipcRenderer.invoke('check-setup'),
  startApplication: () => ipcRenderer.invoke('start-application'),
  
  // Update management
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  restartAndUpdate: () => ipcRenderer.invoke('restart-and-update'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, ...args) => callback(...args)),
  
  // Window management
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // System information
  platform: process.platform,
  version: process.versions.electron
});