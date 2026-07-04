import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user.api";
import { RegisterDTO } from "@/entities/user/model/auth.dto";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";

export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: (credentials: RegisterDTO) => userApi.register(credentials),
  });

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error
      ? getApiErrorMessage(mutation.error, "Не удалось зарегистрироваться")
      : null,
  };
};
