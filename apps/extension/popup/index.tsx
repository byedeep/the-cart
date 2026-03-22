import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { getRecentItems } from '../lib/api';

interface CartItem {
  id: string;
  title: string;
  source: string;
  imageUrl?: string;
}

function Popup() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentItems();
  }, []);

  const loadRecentItems = async () => {
    try {
      const data = await getRecentItems();
      setItems(data.slice(0, 5)); // Show last 5 items
    } catch (err) {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const openCart = () => {
    chrome.tabs.create({ url: 'http://localhost:3001/cart' });
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
          marginBottom: '16px',
          fontSize: '14px'
        }}
      >
        Open Cart
      </button>

      <h2 style={{ fontSize: '14px', margin: '0 0 8px 0', color: '#666' }}>
        Recently Added
      </h2>

      {loading ? (
        <p style={{ color: '#666' }}>Loading...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>{error}</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#666' }}>No items yet. Right-click any link and select "Add to Cart"!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item) => (
            <div 
              key={item.id}
              style={{
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt=""
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '4px' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  {item.source}
                </p>
              </div>
            </div>
          ))}
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
