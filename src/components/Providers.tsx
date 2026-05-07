"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { RealtimeProvider } from "@upstash/realtime/client";

const queryClient = new QueryClient();

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RealtimeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </RealtimeProvider>
  );
}
