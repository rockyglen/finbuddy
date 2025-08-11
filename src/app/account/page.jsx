"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AccountPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);

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

    const { data, error } = await supabase
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
    if (!error) setEditing(false);
  }

  async function deleteAccount() {
    if (!confirm("This will permanently delete your account. Continue?"))
      return;
    await fetch("/api/delete-user", { method: "POST" });
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">Loading account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="mb-4 text-gray-600">You are not signed in.</p>
        <a
          href="/sign-in"
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Account Settings
      </h1>

      {/* Email */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-500 mb-1">
          Email
        </label>
        <input
          type="text"
          value={user.email}
          disabled
          className="w-full border border-gray-200 rounded-lg p-2 bg-gray-100 text-gray-700"
        />
      </div>

      {/* Display Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-500 mb-1">
          Display Name
        </label>
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2"
            />
            <button
              onClick={saveDisplayName}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center border border-gray-200 rounded-lg p-2">
            <span className="text-gray-700">
              {displayName || "No name set"}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Delete Account */}
      <div className="mt-8 border-t pt-6">
        <button
          onClick={deleteAccount}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
