"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { FaSignOutAlt } from "react-icons/fa";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function NavBar() {
  const user = useUser();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 shadow-sm">
      <nav className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 hover:opacity-90 transition"
        >
          FinBuddy
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4">
          {/* Dashboard link */}
          {user && (
            <Link href="/dashboard">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 dark:bg-gray-800 dark:hover:bg-indigo-900 dark:text-gray-300 dark:hover:text-indigo-300 transition-all duration-200 shadow">
                Dashboard
              </span>
            </Link>
          )}

          {/* Add Expense */}
          {user && (
            <Link href="/add-expense">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow">
                + Add Expense
              </span>
            </Link>
          )}

          {/* About */}
          <Link href="/about">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 dark:bg-gray-800 dark:hover:bg-indigo-900 dark:text-gray-300 dark:hover:text-indigo-300 transition-all duration-200 shadow">
              About
            </span>
          </Link>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Auth */}
          {!user ? (
            <>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-full px-4 py-2 text-sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2 text-sm shadow">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2 text-sm hover:bg-red-100 hover:text-red-600 border-gray-300 dark:border-gray-700 dark:hover:bg-red-900 dark:hover:text-red-400 rounded-full px-4 py-2 transition"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Sign Out
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
