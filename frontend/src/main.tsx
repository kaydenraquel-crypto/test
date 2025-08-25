import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

console.log('🚀 MAIN.TSX LOADED - USING APP.TSX WITH DXCHARTS TEST MODE')

// Add skip link to DOM
const skipLink = document.createElement('a')
skipLink.href = '#main-content'
skipLink.textContent = 'Skip to main content'
skipLink.className = 'skip-link'
skipLink.id = 'skip-link'
document.body.insertBefore(skipLink, document.body.firstChild)

// Add live region for announcements
const liveRegion = document.createElement('div')
liveRegion.id = 'live-region'
liveRegion.setAttribute('aria-live', 'polite')
liveRegion.setAttribute('aria-atomic', 'true')
liveRegion.className = 'sr-only'
document.body.appendChild(liveRegion)

// Detect accessibility preferences
const detectPreferences = () => {
  // High contrast detection
  if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('high-contrast-mode')
  }
  
  // Reduced motion detection
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion')
  }
  
  // Color scheme detection
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode')
  }
}

// Apply initial preferences
detectPreferences()

// Listen for preference changes
if (window.matchMedia) {
  window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
    document.body.classList.toggle('high-contrast-mode', e.matches)
  })
  
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    document.body.classList.toggle('reduced-motion', e.matches)
  })
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.matches)
  })
}

createRoot(document.getElementById('root')!).render(<App />)
