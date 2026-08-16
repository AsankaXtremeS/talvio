export type AppRole = "STUDENT" | "PROFESSIONAL" | "EMPLOYER" | "ADMIN";

const roleSegmentMap: Record<AppRole, string> = {
  STUDENT: "candidate",
  PROFESSIONAL: "candidate",
  EMPLOYER: "employer",
  ADMIN: "admin",
};

export const getRoleRootRoute = (role: AppRole, userId?: string): string => {
  const segment = roleSegmentMap[role];
  return `/users/${segment}`;
};

export const getRoleHomeRoute = (role: AppRole, userId?: string): string =>
  `${getRoleRootRoute(role, userId)}/dashboard`;
