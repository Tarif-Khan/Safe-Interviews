import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

// Add error handling for Electron
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

console.log('React app starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  console.log('Root element found, creating React app...');
  
  createRoot(rootElement).render(
    <StrictMode>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </StrictMode>,
  );
  
  console.log('React app rendered!');
}
