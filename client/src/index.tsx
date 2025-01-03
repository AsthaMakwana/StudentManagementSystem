import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';
import App from './App';
import studentStore from './mobx/studentStore';
import React from 'react';

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


