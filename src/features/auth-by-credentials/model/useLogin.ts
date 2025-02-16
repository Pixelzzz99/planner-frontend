"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useLogin() {
  const [error, setError] = useState("");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: () => {
      router.push("/dashboard/year");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return {
    login: mutation.mutate,
    error,
    isLoading: mutation.isPending,
  };
}
