"use client";
import React, { useState } from "react";
import { useLogin } from "../model/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function LoginForm() {
  const { login, error, isLoading } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Calendrium</h1>
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl">
        <h1 className="text-3xl font-bold text-center text-foreground mb-8">
          Добро пожаловать
        </h1>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full transition-all duration-200"
            />
          </div>

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Загрузка...
              </span>
            ) : (
              "Войти"
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/register"
              className="text-foreground hover:text-foreground/80 transition-colors duration-200"
            >
              Нет аккаунта? Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
