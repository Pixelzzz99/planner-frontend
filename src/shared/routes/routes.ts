export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  DASHBOARD: "/dashboard",
  PROJECTS: {
    LIST: "/projects",
    DETAIL: (id: string) => `/projects/${id}`,
    CREATE: "/projects/create",
    EDIT: (id: string) => `/projects/${id}/edit`,
  },
  TASKS: {
    LIST: "/tasks",
    DETAIL: (id: string) => `/tasks/${id}`,
    CREATE: "/tasks/create",
  },
  PROFILE: {
    SETTINGS: "/profile/settings",
    NOTIFICATIONS: "/profile/notifications",
  },
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
] as const;

export const isPublicRoute = (route: string): boolean => {
  return PUBLIC_ROUTES.includes(route as (typeof PUBLIC_ROUTES)[number]);
};

export const getProjectRoute = (id: string): string =>
  ROUTES.PROJECTS.DETAIL(id);
export const getTaskRoute = (id: string): string => ROUTES.TASKS.DETAIL(id);
