import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'

import { GlobalProvider } from "./Global";


async function registerServiceWorker() {
  try {
    let registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker Registered!", registration);
  } catch (err) {
    console.error("Service Worker Registration Failed", err);
  }
}

registerServiceWorker();


createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <GlobalProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GlobalProvider>

  // </StrictMode>
)
