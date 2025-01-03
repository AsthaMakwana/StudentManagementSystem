// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from './App.jsx'
// import { Provider } from 'react-redux'
// import { PersistGate } from 'redux-persist/integration/react';
// import store, { persistor } from './redux/store'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <App />
//       </PersistGate>
//     </Provider>
//   </StrictMode>,
// )

// import React from 'react';
// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import App from './App';
// import store, { persistor } from './redux/store';

// const rootElement = document.getElementById('root');
// if (rootElement) {
//   createRoot(rootElement).render(
//     <StrictMode>
//       <Provider store={store}>
//         <PersistGate loading={null} persistor={persistor}>
//           <App />
//         </PersistGate>
//       </Provider>
//     </StrictMode>
//   );
// }

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react'; // MobX Provider
import App from './App';
import studentStore from './mobx/studentStore'; // Import your MobX store here
import React from 'react';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider studentStore={studentStore}> {/* Provide your MobX store here */}
        <App />
      </Provider>
    </StrictMode>
  );
}


