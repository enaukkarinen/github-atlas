
export interface RepoTextFiles {
  readme: string | null;
  codeowners: {
    path: string | null;
    text: string | null;
  };
}