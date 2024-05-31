import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // remove strict mode so during development it doesn't render the app twice
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)
