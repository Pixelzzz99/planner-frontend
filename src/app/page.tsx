"use client";

import { Hero } from "@/widgets/hero/Hero";
import { UserStats } from "@/widgets/stats/UserStats";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <Hero />
        {session && (
          <>
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-4">Ваша статистика</h2>
              <UserStats />
            </div>
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold">Недавние действия</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-3 bg-white rounded-md shadow-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Завершена задача "Подготовка к презентации"
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
