


export type Context = {
  // db: PostgresJsDatabase<typeof schema>;
  // user: SessionUser | null;

  githubToken: string;
  req?: {
    originalUrl?: string;
    method?: string;
  };
};
