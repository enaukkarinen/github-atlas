import { useOrg } from "../../../app/OrgContext";
import { trpc } from "../../../trpc";
import { AtlasShell } from "../components/AtlasShell";

export function AtlasPage() {
  const { org } = useOrg();

  const profiles = trpc.atlas.profiles.useQuery(
    { org: org ?? "", force: false },
    {
      enabled: Boolean(org),
    },
  );

  if (!org) {
    return <div>Select an organisation</div>;
  }

  if (profiles.isLoading) {
    return <div>Loading profiles…</div>;
  }

  if (profiles.isError) {
    return <div>Failed to load profiles</div>;
  }

  return <AtlasShell profiles={profiles.data?.profiles ?? []} />;
}
