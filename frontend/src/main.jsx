import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import './index.css'
import App from './App.jsx'

// Configure Monaco Editor to use local bundle (eliminates external CDN Tracking Prevention warnings & enables offline use)
loader.config({ monaco });

// Suppress Monaco Editor benign internal cancellation signals and logService noise in the browser console
const rawConsoleError = console.error;
console.error = (...args) => {
  const isMonacoCanceled = args.some(
    (arg) =>
      (typeof arg === 'string' && (arg.includes('Canceled') || arg.includes('ERR Canceled'))) ||
      arg?.name === 'Canceled' ||
      arg?.message === 'Canceled' ||
      arg?.type === 'cancelation'
  );
  if (isMonacoCanceled) return;
  rawConsoleError.apply(console, args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.name === 'Canceled' ||
    event.reason?.message === 'Canceled' ||
    event.reason?.type === 'cancelation' ||
    (typeof event.reason === 'string' && event.reason.includes('Canceled'))
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
