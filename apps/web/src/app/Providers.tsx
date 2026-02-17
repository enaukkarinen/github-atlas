import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";

import { trpc } from "../trpc";
import { OrgProvider } from "./OrgContext";

const Provider = trpc.Provider;

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_TRPC_URL,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include", 
        });
      },
    }),
  ],
});

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  shape: {
    borderRadius: 10,
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <OrgProvider>
            <CssBaseline />
            <ReactQueryDevtools initialIsOpen={false} />
            {children}
          </OrgProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}
