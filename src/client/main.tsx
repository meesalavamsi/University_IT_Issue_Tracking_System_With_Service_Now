import React from 'react'
import ReactDOM from 'react-dom/client'
import { SessionProvider } from './context/session'
import App from './app'
import './styles/tokens.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/showcase.css'
import './styles/records.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <SessionProvider>
        <App />
    </SessionProvider>
)
