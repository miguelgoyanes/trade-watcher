import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  // EN DESARROLLO MEJOR QUITAR EL STRICTMODE PORQUE ME EJECUTA 2 VECES EL USEEFFECT
  // <StrictMode>
  //   <App />
  // </StrictMode>,
  <App />
)
