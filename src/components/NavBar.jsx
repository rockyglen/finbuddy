"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import clsx from "clsx";

export default function NavBar() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 shadow-sm">
      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 hover:opacity-90 transition"
        >
          FinBuddy
        </Link>

        {/* Hamburger - visible on small screens only */}
        <button
          onClick={toggleMenu}
          className="lg:hidden text-gray-700 dark:text-gray-300 text-xl focus:outline-none"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/about">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 dark:bg-gray-800 dark:hover:bg-indigo-900 dark:text-gray-300 dark:hover:text-indigo-300 transition-all duration-200 shadow">
              About
            </span>
          </Link>

          <Link href="/#features">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 dark:bg-gray-800 dark:hover:bg-indigo-900 dark:text-gray-300 dark:hover:text-indigo-300 transition-all duration-200 shadow">
              Features
            </span>
          </Link>

          {user && (
            <Link href="/dashboard">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 dark:bg-gray-800 dark:hover:bg-indigo-900 dark:text-gray-300 dark:hover:text-indigo-300 transition-all duration-200 shadow">
                Dashboard
              </span>
            </Link>
          )}

          {user && (
            <Link href="/add-expense">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow">
                + Add Expense
              </span>
            </Link>
          )}

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

      {/* Mobile Menu */}
      <div
        className={clsx(
          "lg:hidden transition-all duration-300 px-4 pb-4",
          menuOpen ? "block" : "hidden"
        )}
      >
        <div className="flex flex-col gap-3">
          {user && (
            <Link href="/dashboard" onClick={toggleMenu}>
              <span className="block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition">
                Dashboard
              </span>
            </Link>
          )}

          {user && (
            <Link href="/add-expense" onClick={toggleMenu}>
              <span className="block px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                + Add Expense
              </span>
            </Link>
          )}

          <Link href="/about" onClick={toggleMenu}>
            <span className="block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition">
              About
            </span>
          </Link>

          <div className="flex justify-between items-center px-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Dark Mode
            </span>
            <DarkModeToggle />
          </div>

          {!user ? (
            <>
              <Link href="/sign-in" onClick={toggleMenu}>
                <Button
                  variant="ghost"
                  className="w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-full px-4 py-2 text-sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" onClick={toggleMenu}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2 text-sm shadow">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <Button
              onClick={() => {
                handleSignOut();
                toggleMenu();
              }}
              variant="outline"
              className="flex items-center justify-center gap-2 text-sm hover:bg-red-100 hover:text-red-600 border-gray-300 dark:border-gray-700 dark:hover:bg-red-900 dark:hover:text-red-400 rounded-full px-4 py-2 transition"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
