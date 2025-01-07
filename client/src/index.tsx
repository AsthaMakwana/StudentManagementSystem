import studentStore from './mobx/studentStore';
import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';
import { StrictMode } from 'react';
import React from 'react';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider studentStore={studentStore}>
        <App />
      </Provider>
    </StrictMode>
  );
}


