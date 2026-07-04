export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
  DASHBOARD: "/dashboard",
  YEAR: "/dashboard/year",
  WEEK: "/dashboard/week",
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
] as const;

export const isPublicRoute = (route: string): boolean => {
  return PUBLIC_ROUTES.includes(route as (typeof PUBLIC_ROUTES)[number]);
};
