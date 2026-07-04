import { useSession } from "next-auth/react";

export const useUserId = (): string | undefined => {
  const { data: session } = useSession();
  return session?.user?.id;
};
