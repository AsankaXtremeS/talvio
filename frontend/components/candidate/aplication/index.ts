// Export all application components and types
export { default as ApplicationCard } from "@/components/candidate/aplication/ApplicationCard";
export { default as ApplicationsFilters } from "@/components/candidate/aplication/ApplicationsFilters";
export { default as ApplicationsTabs } from "@/components/candidate/aplication/ApplicationsTabs";
export { default as ApplicationsHeader } from "@/components/candidate/aplication/ApplicationsHeader";
export { default as ApplicationsListView } from "@/components/candidate/aplication/ApplicationsListView";

export type {
  ApplicationCard as ApplicationCardType,
  ApplicationTab,
  ApplicationStatus,
  ApplicationMeta,
  JobSummary,
  CompanyBadge,
} from "@/components/candidate/aplication/types";

export {
  JOBS,
  APPLICATION_META,
  TAB_LABELS,
  STEP_LABELS,
  STEP_HINTS,
  STAGE_SHORT_LABELS,
  COMPANY_BADGES,
  LOCATION_OPTIONS,
  JOB_TYPE_OPTIONS,
  ALL_JOB_IDS,
} from "@/components/candidate/aplication/types";
