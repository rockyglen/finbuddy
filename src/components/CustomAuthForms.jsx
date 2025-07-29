"use client";

import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaGithub, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import { SignedIn } from "@clerk/nextjs";

const inputStyle =
  "w-full px-4 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

const authCardVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const AuthLayout = ({ children }) => (
  <div className="min-h-screen grid md:grid-cols-2 bg-white dark:bg-black">
    {/* Left: Branding and Visual */}
    <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-10 space-y-6">
      <Image src="/logo.svg" alt="FinBuddy Logo" width={48} height={48} />
      <h1 className="text-4xl font-bold">FinBuddy</h1>
      <p className="text-lg max-w-sm text-center">
        Your intelligent financial sidekick. Track expenses, scan receipts, and
        get AI insights — daily.
      </p>
      <Image
        src="/assets/illustration.svg"
        alt="Finance Illustration"
        width={400}
        height={300}
        className="mt-6"
      />
    </div>

    {/* Right: Form Section */}
    <div className="flex flex-col items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950 space-y-6">
      {children}

      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </div>
  </div>
);

function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      className="flex items-center gap-2 text-sm"
    >
      <FaSignOutAlt /> Sign Out
    </Button>
  );
}

function AuthFooterLink({ type }) {
  return (
    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
      {type === "signin" ? (
        <>
          Don’t have an account?{" "}
          <a
            href="/sign-up"
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Sign Up
          </a>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Sign In
          </a>
        </>
      )}
    </p>
  );
}

// ---------------- SIGN IN ----------------
export function CustomSignIn() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Failed to sign in");
    }
  };

  const handleOAuth = async (strategy) => {
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/dashboard",
      });
    } catch (err) {
      setError(`Sign in with ${strategy} failed`);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md space-y-6"
        variants={authCardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Login to your FinBuddy account
        </p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="space-y-3">
          <Button
            onClick={() => handleOAuth("oauth_google")}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border hover:bg-gray-50"
          >
            <FaGoogle /> Continue with Google
          </Button>
          <Button
            onClick={() => handleOAuth("oauth_github")}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-black"
          >
            <FaGithub /> Continue with GitHub
          </Button>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4 pt-4">
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
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Sign In
          </Button>
        </form>
      </motion.div>
      <AuthFooterLink type="signin" />
    </AuthLayout>
  );
}

// ---------------- SIGN UP ----------------
export function CustomSignUp() {
  const { signUp, setActive } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Failed to sign up");
    }
  };

  const handleOAuth = async (strategy) => {
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/dashboard",
      });
    } catch (err) {
      setError(`Sign up with ${strategy} failed`);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md space-y-6"
        variants={authCardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">
          Join FinBuddy
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Create an account to get started
        </p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="space-y-3">
          <Button
            onClick={() => handleOAuth("oauth_google")}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border hover:bg-gray-50"
          >
            <FaGoogle /> Sign up with Google
          </Button>
          <Button
            onClick={() => handleOAuth("oauth_github")}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-black"
          >
            <FaGithub /> Sign up with GitHub
          </Button>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4 pt-4">
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
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputStyle}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Sign Up
          </Button>
        </form>
      </motion.div>
      <AuthFooterLink type="signup" />
    </AuthLayout>
  );
}
