import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@github-atlas/api-router";

export const trpc = createTRPCReact<AppRouter>({});