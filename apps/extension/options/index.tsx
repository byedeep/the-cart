import React from 'react';
import ReactDOM from 'react-dom/client';

function Options() {
  return (
    <div>
      <h1>The Cart - Settings</h1>
      <p>Extension settings will appear here.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
