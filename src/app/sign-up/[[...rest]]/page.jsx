"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOAuth = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setError(`Sign up with ${provider} failed`);
      console.error(error);
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message || "Failed to sign up");
      setLoading(false);
      return;
    } else {
      setSuccess(true);
      setTimeout(() => {
        localStorage.setItem("pending_email", email);
        router.push("/verify-email");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <motion.div
        className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
          Join <span className="text-indigo-600">FinBuddy</span>
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
          Your smarter financial journey starts here.
        </p>

        <AnimatePresence>
          {error && (
            <motion.p
              className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 px-4 rounded-lg"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <Button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border hover:bg-gray-50 transition rounded-lg py-2 font-medium shadow-sm"
          >
            <FaGoogle /> Continue with Google
          </Button>
          <Button
            onClick={() => handleOAuth("github")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 transition rounded-lg py-2 font-medium shadow-sm"
          >
            <FaGithub /> Continue with GitHub
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white dark:bg-gray-900 text-gray-500">
              Or sign up with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {[
            { label: "First Name", value: firstName, setValue: setFirstName },
            { label: "Last Name", value: lastName, setValue: setLastName },
            { label: "Email", value: email, setValue: setEmail, type: "email" },
            {
              label: "Password",
              value: password,
              setValue: setPassword,
              type: "password",
            },
            {
              label: "Confirm Password",
              value: confirmPassword,
              setValue: setConfirmPassword,
              type: "password",
            },
          ].map((field, i) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="relative"
            >
              <input
                type={field.type || "text"}
                value={field.value}
                onChange={(e) => field.setValue(e.target.value)}
                placeholder=" "
                required
                className="peer w-full px-4 pt-5 pb-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600">
                {field.label}
              </label>
            </motion.div>
          ))}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center"
          >
            {loading ? (
              <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              >
                ✅
              </motion.div>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="text-indigo-600 hover:underline font-medium"
          >
            Sign In
          </a>
        </p>
      </motion.div>
    </div>
  );
}
