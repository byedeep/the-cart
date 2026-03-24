import React from 'react';
import ReactDOM from 'react-dom/client';

function Popup() {
  const openCart = () => {
    chrome.tabs.create({ url: 'http://localhost:3001/' });
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>The Cart</h1>
      
      <button 
        onClick={openCart}
        style={{
          width: '100%',
          padding: '12px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Open Cart
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
