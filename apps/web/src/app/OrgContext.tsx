import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ORG_STORAGE_KEY = "github-atlas:lastOrg";

type OrgState = {
  org: string | null;
  setOrg: (org: string | null) => void;
  clearOrg: () => void;
};

const OrgContext = createContext<OrgState | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrgState] = useState<string | null>(() => {
    const saved = localStorage.getItem(ORG_STORAGE_KEY);
    return saved?.trim() ? saved.trim() : null;
  });

  const setOrg = (next: string | null) => {
    const trimmed = next?.trim() ?? "";
    setOrgState(trimmed ? trimmed : null);
  };

  const clearOrg = () => setOrgState(null);

  useEffect(() => {
    if (org) localStorage.setItem(ORG_STORAGE_KEY, org);
    else localStorage.removeItem(ORG_STORAGE_KEY);
  }, [org]);

  const value = useMemo(() => ({ org, setOrg, clearOrg }), [org]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
