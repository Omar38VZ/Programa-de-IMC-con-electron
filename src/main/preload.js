const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getHistory: () => ipcRenderer.invoke('get-history'),
  saveHistory: (entry) => ipcRenderer.invoke('save-history', entry),
  clearHistory: () => ipcRenderer.invoke('clear-history')
});
