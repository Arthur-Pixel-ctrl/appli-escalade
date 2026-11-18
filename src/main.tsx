import '@fontsource-variable/big-shoulders-display/wght'
import '@fontsource-variable/atkinson-hyperlegible-next/wght'
import '@fontsource-variable/atkinson-hyperlegible-mono/wght'
import '@fontsource/gochi-hand/400.css'
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
