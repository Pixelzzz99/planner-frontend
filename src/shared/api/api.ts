import axios from "axios";
import { signOut, getSession } from "next-auth/react";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      const token = session?.user?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await signOut({ redirect: true, callbackUrl: "/auth/login" });
      } catch (signOutError) {
        console.error("Error during sign out:", signOutError);
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
