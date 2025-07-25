const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  
  // Audio control
  startListening: () => ipcRenderer.invoke('start-listening'),
  stopListening: () => ipcRenderer.invoke('stop-listening'),
  getListeningStatus: () => ipcRenderer.invoke('get-listening-status'),
  
  // Overlay control
  showOverlay: (content) => ipcRenderer.invoke('show-overlay', content),
  hideOverlay: () => ipcRenderer.invoke('hide-overlay'),
  toggleOverlayPosition: () => ipcRenderer.invoke('toggle-overlay-position'),
  
  // AI service
  testAIConnection: () => ipcRenderer.invoke('test-ai-connection'),
  processQuestion: (question) => ipcRenderer.invoke('process-question', question),
  
  // Event listeners
  onNewQAPair: (callback) => {
    ipcRenderer.on('new-qa-pair', callback);
  },
  
  onListeningStatusChanged: (callback) => {
    ipcRenderer.on('listening-status-changed', callback);
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // App control
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Platform info
  platform: process.platform,
  
  // Utility functions
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options)
});