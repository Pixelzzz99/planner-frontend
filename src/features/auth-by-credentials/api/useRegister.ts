import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user.api";
import { RegisterDTO } from "@/entities/user/model/auth.dto";

export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: (credentials: RegisterDTO) => userApi.register(credentials),
  });

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
  };
};
