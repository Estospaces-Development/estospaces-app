import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global handler for unhandled promise rejections
// Silently ignore AbortErrors that occur after component unmount
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  // Check if this is an AbortError
  const isAbortError = error && (
    error.name === 'AbortError' ||
    error.message?.includes('aborted') ||
    error.message?.includes('AbortError') ||
    error.code === 'ABORT_ERR'
  );
  
  if (isAbortError) {
    // Prevent the error from being logged to console
    event.preventDefault();
    return;
  }
});

// Note: StrictMode has been removed because react-leaflet's MapContainer 
// is not compatible with React 18's StrictMode (double-mounting causes 
// "Map container is already initialized" error)
createRoot(document.getElementById('root')!).render(
  <App />
)
