"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AccountPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
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
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile({ ...user, ...data });
      setDisplayName(data.display_name || "");
    } else {
      setProfile(user); // fallback if profiles table missing
    }

    setLoading(false);
  }

  async function updateProfile() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName });

    if (error) console.error(error);
    else alert("Profile updated!");
    setLoading(false);
  }

  async function deleteAccount() {
    if (!confirm("This will delete your account permanently. Continue?"))
      return;
    await fetch("/api/delete-user", { method: "POST" });
    await supabase.auth.signOut();
  }

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Account</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="text"
          value={profile?.email || ""}
          disabled
          className="border rounded w-full p-2 bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="border rounded w-full p-2"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={updateProfile}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={deleteAccount}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
