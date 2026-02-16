import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@github-atlas/api-contract";

export const trpc = createTRPCReact<AppRouter>({});