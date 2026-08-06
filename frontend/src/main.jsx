import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryProvider } from './context/QueryProvider';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryProvider>
        <App />
      </QueryProvider>
    </Provider>
  </StrictMode>,
);
