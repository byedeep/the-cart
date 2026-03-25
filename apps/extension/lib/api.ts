// API client for extension using tRPC

import { createTRPCClient, httpBatchLink } from '@trpc/client';

const API_BASE_URL = 'http://localhost:3000';

// Create tRPC client
const trpcClient = createTRPCClient<any>({
  links: [
    httpBatchLink({
      url: `${API_BASE_URL}/trpc`,
      fetch(url: string | URL | Request, options?: RequestInit) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});

export async function addToCart(url: string) {
  // @ts-ignore - Runtime shape is correct
  return trpcClient.cart.create.mutate({ url });
}

export async function getRecentItems() {
  // @ts-ignore - Runtime shape is correct
  const items = await trpcClient.cart.getAll.query();
  return items;
}
