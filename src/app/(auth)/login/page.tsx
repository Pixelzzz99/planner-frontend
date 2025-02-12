"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //   const { mutate: login, isPending } = useMutation(() => {}, {
  //     onSuccess: (data) => {},
  //     onError: (err) => {
  //       console.log("Login error", err);
  //     },
  //   });

  const handleLogin = () => {
    // login({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-6">Вход</h1>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button onClick={handleLogin} className="w-full">
          Войти
        </Button>
      </div>
    </div>
  );
}
