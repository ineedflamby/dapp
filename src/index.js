import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Add these lines to set the document title
document.title = "AlmostHyperInscribedLiquidGoose";

// Set favicon link
const link = document.createElement('link');
link.rel = 'icon';
link.href = `${process.env.PUBLIC_URL}/favicon.png`;
document.head.appendChild(link);

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'AlmostHyperInscribedLiquidGoose';
document.head.appendChild(metaDescription);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();