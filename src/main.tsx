import { createRoot } from 'react-dom/client'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)
