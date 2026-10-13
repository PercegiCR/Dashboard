import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AppProvider } from './context/AppContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RouterProvider } from './context/RouterContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <RouterProvider>
          <App />
        </RouterProvider>
      </AppProvider>
    </AuthProvider>
  </StrictMode>,
)
