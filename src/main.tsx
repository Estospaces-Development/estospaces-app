import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode has been removed because react-leaflet's MapContainer 
// is not compatible with React 18's StrictMode (double-mounting causes 
// "Map container is already initialized" error)
createRoot(document.getElementById('root')!).render(
  <App />
)
