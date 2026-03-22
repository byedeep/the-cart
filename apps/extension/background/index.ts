// Background service worker for The Cart extension

import { addToCart } from '../lib/api';

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addToCart',
    title: 'Add to Cart',
    contexts: ['page', 'link', 'selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'addToCart') {
    const url = info.linkUrl || info.pageUrl || tab?.url;
    
    if (url) {
      try {
        // Show loading notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'The Cart',
          message: 'Adding item to your cart...'
        });

        // Send to API
        await addToCart(url);

        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'The Cart',
          message: 'Item added successfully!'
        });
      } catch (error) {
        console.error('Failed to add item:', error);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'The Cart',
          message: 'Failed to add item. Please try again.'
        });
      }
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url) {
    try {
      await addToCart(tab.url);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'The Cart',
        message: 'Current page added to cart!'
      });
    } catch (error) {
      console.error('Failed to add page:', error);
    }
  }
});
