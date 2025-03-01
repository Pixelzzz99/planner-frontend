"use client";

import { Hero } from "@/widgets/hero/Hero";
import { UserStats } from "@/widgets/stats/UserStats";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-6">
        <ThemeToggle />
      </div>
      <div className="space-y-8">
        <Hero />
        {session && (
          <>
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Ваша статистика
              </h2>
              <UserStats />
            </div>
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Недавние действия
              </h2>
              <div className="bg-muted rounded-lg p-4">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-3 bg-background rounded-md shadow-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Завершена задача : Разработать интерфейс
                        </p>
                        <p className="text-xs text-gray-500">2 часа назад</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
