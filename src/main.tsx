import '@fontsource-variable/geist'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { FiletDeSecurite } from './FiletDeSecurite.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FiletDeSecurite>
      <App />
    </FiletDeSecurite>
  </StrictMode>,
)
