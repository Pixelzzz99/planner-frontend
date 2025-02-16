import { LoginForm } from "@/features/auth-by-credentials/ui/LoginForm";
import { authOptions } from "@/shared/config/next-auth/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
