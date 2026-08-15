import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Was there already a controlling SW when this page loaded?
  // If yes, a future controllerchange means an UPDATE happened → reload.
  // If no, it's a first install → no reload needed.
  const hadController = !!navigator.serviceWorker.controller

  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return
    refreshing = true
    window.location.reload()
  })

  // Register and immediately check for updates
  navigator.serviceWorker.register('/sw.js')
    .then(reg => {
      reg.update().catch(() => { })

      // Check for updates when the user switches back to the tab
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          reg.update().catch(() => { })
        }
      })
    })
    .catch(() => { })
}

// Global input validation for numeric inputs to prevent alphabets and multiple decimals
if (typeof window !== 'undefined') {
  const isNumericInput = (target) => {
    return target &&
      target.tagName === 'INPUT' &&
      (target.type === 'number' || target.inputMode === 'decimal' || target.inputMode === 'numeric');
  };

  // 1. Keydown listener (Capture phase) to block invalid keystrokes immediately
  document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (!isNumericInput(target)) return;

    // Allow navigation/editing keys:
    // Backspace, Delete, Tab, Escape, Enter, Arrow keys, Home, End
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Block alphabets (including 'e' and 'E')
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Block signs (+ and -)
    if (e.key === '+' || e.key === '-') {
      e.preventDefault();
      return;
    }

    // Block multiple decimals
    if (e.key === '.' || e.key === ',') {
      if (target.value.includes('.')) {
        e.preventDefault();
        return;
      }
    }
  }, true);

  // 2. Input listener (Capture phase) to undo invalid paste, drag-and-drop, or autocomplete
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (!isNumericInput(target)) return;

    // Check validity and block signs (+/-) or any alphabets that might have slipped through
    const hasInvalidChar = /[a-zA-Z+-]/.test(target.value);

    if (target.validity.badInput || hasInvalidChar) {
      // Restore to the last known valid value
      target.value = target._lastValidValue || '';
    } else {
      // Keep track of the last valid value
      target._lastValidValue = target.value;
    }
  }, true);

  // Initialize existing inputs on focus
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (isNumericInput(target) && target._lastValidValue === undefined) {
      target._lastValidValue = target.value;
    }
  }, true);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

