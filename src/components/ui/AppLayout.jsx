"use client";

import {
  LayoutDashboard,
  Receipt,
  PlusSquare,
  BarChart2,
  LogOut,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Menu } from "@headlessui/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Add Expense", href: "/add", icon: PlusSquare },
  { label: "Upload Receipt", href: "/upload", icon: Receipt },
  { label: "Insights", href: "/insights", icon: BarChart2 },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const supabase = useSupabaseClient();
  const user = useUser();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

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
                pathname === href &&
                  "bg-indigo-100 text-indigo-700 font-semibold"
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
        <header className="h-16 bg-white shadow-sm flex items-center justify-end px-6 border-b relative">
          {/* Supabase avatar and dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center gap-2 focus:outline-none">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-gray-600" />
              )}
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-gray-700`}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
