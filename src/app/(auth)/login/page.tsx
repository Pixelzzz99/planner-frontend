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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Calendrium</h1>
      <LoginForm />
    </div>
  );
}
