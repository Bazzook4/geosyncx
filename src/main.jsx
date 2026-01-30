// /src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRouter from './AppRouter.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </HelmetProvider>
);