import { useSession } from "next-auth/react";

export const useUserId = () => {
  const { data: session } = useSession();
  return session?.user?.id as string;
};
