// frontend/src/main.jsx (COMPLETE CODE)

import React from 'react'
import ReactDOM from 'react-dom/client'
import AppContent from './App.jsx'
import './index.css'
import { ThemeProvider } from './ThemeContext.jsx'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </React.StrictMode>,
)