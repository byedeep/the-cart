// API client for extension

const API_BASE_URL = 'http://localhost:3000';

export async function addToCart(url: string) {
  const response = await fetch(`${API_BASE_URL}/trpc/cart.create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      json: { url }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to add item: ${response.statusText}`);
  }

  return response.json();
}

export async function getRecentItems() {
  const response = await fetch(`${API_BASE_URL}/trpc/cart.getAll`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }

  const result = await response.json();
  return result.result?.data?.json || [];
}
