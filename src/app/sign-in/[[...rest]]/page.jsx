"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

const inputStyle =
  "w-full px-4 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Failed to sign in");
      return;
    }

    router.push("/dashboard");
  };

  const handleOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider, // "google" or "github"
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });

    if (error) {
      setError(`Sign in with ${provider} failed`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <motion.div
        className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">
          Sign In to FinBuddy
        </h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="space-y-3">
          <Button
            onClick={() => handleOAuth("google")}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border hover:bg-gray-100"
          >
            <FaGoogle /> Sign in with Google
          </Button>
          <Button
            onClick={() => handleOAuth("github")}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-black"
          >
            <FaGithub /> Sign in with GitHub
          </Button>
        </div>

        <div className="border-t pt-6 space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Sign In
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Don’t have an account?{" "}
            <a
              href="/sign-up"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
