import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ingestOrgProfiles } from "../src/ingest/ingest-org-profiles";

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const org = getArg("org") ?? process.env.GITHUB_ORG ?? "backstage";
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");

  const profiles = await ingestOrgProfiles({ org, githubToken: token });

  const out = getArg("out");
  if (out) {
    const outPath = path.resolve(out);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(profiles, null, 2), "utf-8");
    console.log(`Wrote ${profiles.length} repo profiles to ${outPath}`);
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outPath = path.resolve(
    __dirname,
    "../../../apps/web/src/features/atlas/mock/repo-profiles.json",
  );

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(profiles, null, 2), "utf-8");
  console.log(`Wrote ${profiles.length} repo profiles to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
