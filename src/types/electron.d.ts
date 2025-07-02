export interface ElectronAPI {
  // File operations
  openFile: () => Promise<{ content: string; filePath: string } | null>;
  saveFile: (content: string, defaultPath?: string) => Promise<string | null>;
  
  // Event listeners
  onFileOpened: (callback: (data: { content: string; filePath: string }) => void) => void;
  onSaveFileRequest: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
  
  // Platform info
  platform: string;
  getVersion: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 