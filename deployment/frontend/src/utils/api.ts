/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import { type AppRouter } from '@/server/api/root';
import { MutationCache, QueryCache } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { toast } from 'react-toastify';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,

      // Custom global error callback
      queryClientConfig: {
        defaultOptions: {
          queries: {
            // Avoid refetching every query whenever the window regains
            // focus; most data on the catalog changes infrequently and
            // individual queries can override this where freshness matters.
            refetchOnWindowFocus: false,
            staleTime: 30 * 1000,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            verifyAuthorizationError(error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            verifyAuthorizationError(error);
          },
        }),
      },

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) => {
            if (
              process.env.NODE_ENV === 'production' &&
              opts.direction === 'down' &&
              opts.result instanceof Error &&
              opts.result.data?.code === 'FORBIDDEN'
            )
              return false;
            return (
              process.env.NODE_ENV === 'development' ||
              (opts.direction === 'down' &&
                opts.result instanceof Error)
            );
          },
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

function verifyAuthorizationError(error: any) {
  // Only sign the user out when tRPC explicitly reports that the session is
  // invalid (UNAUTHORIZED). CKAN "Access denied" errors from individual
  // procedures don't mean the session itself expired, and treating them as
  // such caused false logouts.
  if (error?.data?.code === 'UNAUTHORIZED') {
    console.log('Authorization error detected.', error);
    toast('Your session is no longer valid, please sign in again.', {
      type: 'warning',
    });
    setTimeout(() => {
      signOut();
    }, 3000);
  }
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
type RouterOutputs = inferRouterOutputs<AppRouter>;
