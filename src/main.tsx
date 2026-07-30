// Ensure window.fetch has both getter and setter in iframe environments before libraries attempt monkey patching
if (typeof window !== 'undefined' && window.fetch) {
  try {
    let _fetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get() {
        return _fetch;
      },
      set(fn) {
        _fetch = fn;
      },
      configurable: true,
      enumerable: true
    });
  } catch {
    // Ignore if already configurable or fails
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

