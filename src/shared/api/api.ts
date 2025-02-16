import axios from "axios";
import { getSession } from "next-auth/react";

export const api = axios.create({
  baseURL: "http://localhost:4000",
  // withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return config;
});
