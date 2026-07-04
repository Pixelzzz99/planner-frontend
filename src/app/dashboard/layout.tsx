"use client";
import { ReactNode } from "react";
import { DashboardNav } from "@/widgets/dashboard/DashboardNav";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <main className="flex-1">
        <ErrorBoundary title="Ошибка на странице">{children}</ErrorBoundary>
      </main>
    </div>
  );
}
