"use client";
import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <nav className="space-y-4">
          <Link href="/" className="block hover:underline">
            Главная
          </Link>
          <Link href="/dashboard/year" className="block hover:underline">
            Год
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
