import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from 'react-router'
import App from './App.jsx'
import { ThemeProvider } from '@/context/theme-provider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <ThemeProvider>
      <App/>
    </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
