import { createRoot } from 'react-dom/client'
import '@photo-sphere-viewer/core/index.css'
import './index.css'
import './lib/silenzia'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)
