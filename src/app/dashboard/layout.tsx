import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <nav className="space-y-4">
          <Link href="/dashboard/year" className="block hover:underline">
            Год
          </Link>
          <Link href="/dashboard/month" className="block hover:underline">
            Неделя
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
