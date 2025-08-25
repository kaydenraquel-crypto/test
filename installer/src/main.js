const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const UpdateManager = require('./updater');

// Secure storage for API keys
const store = new Store({
  name: 'novasignal-config',
  encryptionKey: 'novasignal-secure-key-2025'
});

let mainWindow;
let wizardWindow;
let appStarted = false;
let updateManager;

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
});

function createWizardWindow() {
  wizardWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'assets', 'icons', 'icon.png')
  });

  wizardWindow.loadFile(path.join(__dirname, 'wizard.html'));

  wizardWindow.on('closed', () => {
    wizardWindow = null;
    if (!appStarted) {
      app.quit();
    }
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'assets', 'icons', 'icon.png')
  });

  // Load the frontend build
  const frontendPath = path.join(__dirname, '..', 'frontend', 'index.html');
  mainWindow.loadFile(frontendPath);

  // Create application menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            createWizardWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About NovaSignal',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About NovaSignal',
              message: 'NovaSignal Trading Platform v1.0.0',
              detail: 'Professional Trading Platform with Advanced Technical Analysis\n\n© 2025 NovaSignal LLC. All rights reserved.',
              buttons: ['OK']
            });
          }
        },
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          }
        },
        { type: 'separator' },
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://github.com/your-username/NovaSignal_v0_2/docs');
          }
        },
        {
          label: 'Support',
          click: () => {
            shell.openExternal('https://github.com/your-username/NovaSignal_v0_2/issues');
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Initialize update manager
  updateManager = new UpdateManager(mainWindow);
}

// Encryption utilities
function encryptData(text) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync('novasignal-2025', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decryptData(encryptedText) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync('novasignal-2025', 'salt', 32);
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipher(algorithm, key);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// IPC Handlers
ipcMain.handle('save-api-keys', async (event, keys) => {
  try {
    const encryptedKeys = {};
    for (const [provider, key] of Object.entries(keys)) {
      if (key && key.trim()) {
        encryptedKeys[provider] = encryptData(key.trim());
      }
    }
    
    store.set('apiKeys', encryptedKeys);
    store.set('setupComplete', true);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving API keys:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-api-keys', async () => {
  try {
    const encryptedKeys = store.get('apiKeys', {});
    const keys = {};
    
    for (const [provider, encryptedKey] of Object.entries(encryptedKeys)) {
      try {
        keys[provider] = decryptData(encryptedKey);
      } catch (decryptError) {
        console.error(`Error decrypting key for ${provider}:`, decryptError);
        keys[provider] = '';
      }
    }
    
    return { success: true, keys };
  } catch (error) {
    console.error('Error loading API keys:', error);
    return { success: false, keys: {} };
  }
});

ipcMain.handle('check-setup', async () => {
  return store.get('setupComplete', false);
});

ipcMain.handle('start-application', async () => {
  appStarted = true;
  if (wizardWindow) {
    wizardWindow.close();
  }
  createMainWindow();
  return { success: true };
});

ipcMain.handle('check-for-updates', async () => {
  try {
    if (updateManager) {
      const updateInfo = await updateManager.manualUpdateCheck();
      return { success: true, updateInfo };
    }
    return { success: false, error: 'Update manager not initialized' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-update-status', async () => {
  try {
    if (updateManager) {
      return { success: true, status: updateManager.getUpdateStatus() };
    }
    return { success: false, status: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    if (updateManager) {
      updateManager.downloadUpdate();
      return { success: true };
    }
    return { success: false, error: 'Update manager not initialized' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restart-and-update', async () => {
  try {
    if (updateManager) {
      updateManager.restartAndUpdate();
      return { success: true };
    }
    return { success: false, error: 'Update manager not initialized' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('minimize-window', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.minimize();
});

ipcMain.handle('close-window', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.close();
});

// Auto-updater events are now handled by UpdateManager

// App event handlers
app.whenReady().then(() => {
  const setupComplete = store.get('setupComplete', false);
  
  if (!setupComplete) {
    createWizardWindow();
  } else {
    createMainWindow();
    appStarted = true;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const setupComplete = store.get('setupComplete', false);
    if (!setupComplete) {
      createWizardWindow();
    } else {
      createMainWindow();
    }
  }
});

// Security: Prevent navigation to external sites
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://') && !url.startsWith('http://localhost')) {
      event.preventDefault();
    }
  });
});