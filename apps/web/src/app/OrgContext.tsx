import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ORG_STORAGE_KEY = "github-atlas:lastOrg";

type OrgState = {
  org: string;
  setOrg: (org: string) => void;
};

const OrgContext = createContext<OrgState | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrgState] = useState(
    localStorage.getItem(ORG_STORAGE_KEY) ?? "backstage",
  );

  const setOrg = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) return;
    setOrgState(trimmed);
  };

  useEffect(() => {
    localStorage.setItem(ORG_STORAGE_KEY, org);
  }, [org]);

  const value = useMemo(() => ({ org, setOrg }), [org]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
