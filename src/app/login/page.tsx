"use client";

import { useState } from "react";
import { useAuthStore } from "@/entities/user/auth";
import { api } from "../../shared/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { email, password });
      setToken(response.data.token);
      router.push("/");
    } catch {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Вход</h2>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleLogin}>Войти</Button>
      </div>
    </div>
  );
}
