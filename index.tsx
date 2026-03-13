
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import App from './App';
import RegulaminPage from './components/RegulaminPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/regulamin" element={<RegulaminPage />} />
          <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
