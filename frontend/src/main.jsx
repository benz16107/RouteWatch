import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleMapsProvider } from './components/GoogleMapsProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleMapsProvider>
      <App />
    </GoogleMapsProvider>
  </StrictMode>,
)
