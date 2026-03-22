// Content script for The Cart extension
// Injected into all web pages

console.log('The Cart extension loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    // Extract basic page info
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      image: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || 
             document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || ''
    };
    
    sendResponse(pageInfo);
  }
  
  return true;
});
