'use client';

import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Receipt, PlusSquare, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Add Expense", href: "/add", icon: PlusSquare },
  { label: "Upload Receipt", href: "/upload", icon: Receipt },
  { label: "Insights", href: "/insights", icon: BarChart2 },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-4 border-r">
        <h1 className="text-xl font-bold mb-8 text-indigo-600">FinBuddy</h1>
        <nav className="space-y-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center px-4 py-2 rounded hover:bg-indigo-100",
                pathname === href && "bg-indigo-100 text-indigo-700 font-semibold"
              )}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content with top bar */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-end px-6 border-b">
          <UserButton afterSignOutUrl="/sign-in" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
