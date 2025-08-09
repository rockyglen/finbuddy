"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import clsx from "clsx";

const inputStyle =
  "w-full px-4 py-3 mt-1 border rounded-lg transition-all duration-200 " +
  "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white " +
  "border-gray-300 dark:border-gray-700 focus:outline-none " +
  "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 " +
  "placeholder-gray-400 dark:placeholder-gray-500";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Failed to sign in");
      return;
    }

    router.push("/dashboard");
  };

  const handleOAuth = async (provider) => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });

    setLoading(false);

    if (error) {
      setError(`Sign in with ${provider} failed`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <motion.div
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 border border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">
          Sign In to{" "}
          <span className="text-gray-900 dark:text-white">FinBuddy</span>
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className={clsx(
              "w-full flex items-center justify-center gap-2 border font-medium py-2",
              "bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            )}
          >
            <FaGoogle /> {loading ? "Loading..." : "Sign in with Google"}
          </Button>
          <Button
            onClick={() => handleOAuth("github")}
            disabled={loading}
            className={clsx(
              "w-full flex items-center justify-center gap-2 font-medium py-2",
              "bg-gray-900 text-white hover:bg-black"
            )}
          >
            <FaGithub /> {loading ? "Loading..." : "Sign in with GitHub"}
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-gray-200 dark:bg-gray-700"></span>
          <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 dark:text-gray-400 text-sm z-10">
            Or continue with
          </span>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
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
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-transform active:scale-[0.98]"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Don’t have an account?{" "}
          <a
            href="/sign-up"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Sign Up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
