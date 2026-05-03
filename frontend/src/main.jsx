import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from 'react-router'
import App from './App.jsx'
import { ThemeProvider } from '@/context/theme-provider'
import posthog from 'posthog-js'; 
import {  PostHogProvider } from '@posthog/react'

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN, { 
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST, 
  defaults: '2026-01-30', 
}); 

posthog.init('API_KEY', {
  session_recording: {
    maskTextSelector: '.chat-message'
  }
})
createRoot(document.getElementById('root')).render(
    <PostHogProvider client={posthog}>
    <BrowserRouter>
    <ThemeProvider>
      <App/>
    </ThemeProvider>
    </BrowserRouter>
     </PostHogProvider>

)
