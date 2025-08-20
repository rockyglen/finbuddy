"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import clsx from "clsx";

export default function NavBar() {
  const pathname = usePathname();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const scrollToFeatures = (e) => {
    e.preventDefault();
    const section = document.querySelector("#features");
    section?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
        {/* Brand + Dark Mode */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
          >
            FinBuddy
          </Link>
          <DarkModeToggle />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <NavLink href="/about" label="About" />
          {pathname === "/" && (
            <NavLink
              href="#features"
              label="Features"
              onClick={scrollToFeatures}
            />
          )}
          {user && <NavLink href="/dashboard" label="Dashboard" />}
          {user && (
            <NavLink href="/add-expense" label="+ Add Expense" primary />
          )}
          {user && <NavLink href="/account" label="Account" />}
          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
                asChild
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSignOut}
              variant="outline"
              disabled={signingOut}
              className="flex items-center gap-2"
            >
              <FaSignOutAlt className="w-4 h-4" />
              {signingOut ? "Signing Out..." : "Sign Out"}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden text-gray-700 dark:text-gray-300 text-xl"
          aria-label="Open Menu"
        >
          <FaBars />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-950 shadow-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-800">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 dark:text-gray-300 text-xl"
                aria-label="Close Menu"
              >
                <FaTimes />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col p-4 gap-4">
              <NavLink
                href="/about"
                label="About"
                onClick={() => setMenuOpen(false)}
              />
              {pathname === "/" && (
                <NavLink
                  href="#features"
                  label="Features"
                  onClick={scrollToFeatures}
                />
              )}
              {user && (
                <>
                  <NavLink
                    href="/dashboard"
                    label="Dashboard"
                    onClick={() => setMenuOpen(false)}
                  />
                  <NavLink
                    href="/add-expense"
                    label="+ Add Expense"
                    primary
                    onClick={() => setMenuOpen(false)}
                  />
                  <NavLink
                    href="/account"
                    label="Account"
                    onClick={() => setMenuOpen(false)}
                  />
                </>
              )}
              {!user ? (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
                    asChild
                    onClick={() => setMenuOpen(false)}
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  variant="outline"
                  disabled={signingOut}
                  className="flex items-center gap-2"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  {signingOut ? "Signing Out..." : "Sign Out"}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, label, onClick, primary }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "relative text-sm font-medium transition-colors duration-200 group",
        primary
          ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 rounded-full shadow"
          : "text-gray-700 dark:text-gray-300 hover:text-indigo-500"
      )}
    >
      {!primary && (
        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
      )}
      {label}
    </Link>
  );
}
