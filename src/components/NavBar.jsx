"use client";

import Link from "next/link";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header className="w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800 sticky top-0 z-50">
      <div className="mx-auto w-full max-w-screen-xl px-6 py-4 flex items-center justify-between">
        {/* Left placeholder to balance flex */}
        <div className="w-1/3"></div>

        {/* Logo centered */}
        <div className="w-1/3 text-center">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            <Link href="/">FinBuddy</Link>
          </h1>
        </div>

        {/* Right Auth & Toggle */}
        <div className="w-1/3 flex justify-end items-center space-x-4">
          <DarkModeToggle />

          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="flex items-center gap-2 text-sm"
            >
              <FaSignOutAlt />
              Sign Out
            </Button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
