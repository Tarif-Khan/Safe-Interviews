import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string, defaultPath?: string) => ipcRenderer.invoke('dialog:saveFile', content, defaultPath),
  
  // Listen to file events from main process
  onFileOpened: (callback: (data: { content: string; filePath: string }) => void) => {
    ipcRenderer.on('file-opened', (event, data) => callback(data));
  },
  onSaveFileRequest: (callback: () => void) => {
    ipcRenderer.on('save-file-request', callback);
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // Platform info
  platform: process.platform,
  
  // App info
  getVersion: () => process.env.npm_package_version || '1.0.0',
}); 