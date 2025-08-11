"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

export default function AccountSettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    setUser(user);
    setDisplayName(data?.display_name || "");
    setLoading(false);
  }

  async function saveDisplayName() {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName });
    if (!error) setEditingName(false);
  }

  async function resetPassword() {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (!error) {
      alert("Password reset email sent.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function deleteAccount() {
    if (!confirm("⚠️ This will permanently delete your account. Continue?"))
      return;
    await fetch("/api/delete-user", { method: "POST" });
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        <span className="animate-pulse">Loading account...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="mb-4 text-gray-600">You are not signed in.</p>
        <a
          href="/sign-in"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
        >
          Sign In
        </a>
      </div>
    );
  }

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "security", label: "Security" },
    { key: "danger", label: "Danger Zone" },
  ];

  return (
    <motion.div
      className="max-w-3xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-2xl border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Account Settings
      </h1>

      {/* Tab Navigation */}
      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-sm font-medium ${
              activeTab === tab.key
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div>
          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Email Address
            </label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Display Name
            </label>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveDisplayName}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-gray-700 font-medium">
                  {displayName || "No name set"}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <button
            onClick={resetPassword}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow"
          >
            Reset Password
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium shadow"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === "danger" && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account is irreversible. All your data will be
            permanently removed.
          </p>
          <button
            onClick={deleteAccount}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow transition"
          >
            Delete Account
          </button>
        </div>
      )}
    </motion.div>
  );
}
