"use client";

import { Hero } from "@/widgets/hero/Hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold text-foreground">Calendrium</h1>
        <ThemeToggle />
      </div>
      <div className="space-y-8">
        <Hero />
        <div className="rounded-2xl glass border border-black/8 dark:border-white/8 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Перейти к планировщику</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Цели, недели, задачи и привычки — всё в одном месте.
            </p>
          </div>
          <Button asChild className="rounded-xl shrink-0">
            <Link href="/dashboard">
              Открыть обзор
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
