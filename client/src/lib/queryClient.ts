import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity, // Since we're not using real APIs, data never goes stale
    },
    mutations: {
      retry: false,
    },
  },
});
