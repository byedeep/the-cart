import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { addToCart } from '../lib/api';

function Popup() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const openCart = () => {
    chrome.tabs.create({ url: 'http://localhost:3001/' });
  };

  const handleAddToCart = async () => {
    setLoading(true);
    setStatus('Adding...');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setStatus('No URL found');
        return;
      }

      await addToCart(tab.url);
      setStatus('Added!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add';
      setStatus(message);
      console.error('Add to cart failed:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <div style={{ padding: '16px', minWidth: '200px' }}>
      <h1 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>The Cart</h1>

      <button
        onClick={handleAddToCart}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: loading ? '#666' : '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          marginBottom: '8px'
        }}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>

      <button
        onClick={openCart}
        style={{
          width: '100%',
          padding: '12px',
          background: '#fff',
          color: '#000',
          border: '1px solid #000',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Open Cart
      </button>

      {status && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          {status}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
