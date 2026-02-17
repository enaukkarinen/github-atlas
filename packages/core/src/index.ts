export { ingestOrgProfiles } from "./ingest/ingest-org-profiles";

// Optional: token-based convenience APIs (nice for apps/api)
export {
  listViewerOrgs,
  searchOrgsByLogin,
} from "./github/fetchers/organisations";
