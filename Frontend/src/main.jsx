import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store.js';     
import App from './App.jsx';
import { AuthProvider } from '../context/authContext.jsx'; 
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>                 
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>
);
