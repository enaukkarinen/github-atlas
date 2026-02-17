


export type Context = {
  // db: PostgresJsDatabase<typeof schema>;
  // user: SessionUser | null;

  cacheScope: string;
  githubToken: string;
  req?: {
    originalUrl?: string;
    method?: string;
  };
};
