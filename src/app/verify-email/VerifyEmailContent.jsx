"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (token && type === "signup") {
      // Instantly verify and log in
      supabase.auth
        .verifyOtp({ token_hash: token, type: "signup" })
        .then(({ error }) => {
          if (error) {
            console.error("Verification error:", error);
          } else {
            router.replace("/dashboard"); // Redirect instantly
          }
        });
    } else {
      // If no token, but session exists, redirect
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.replace("/dashboard");
        }
      });
    }
  }, [router, searchParams]);

  return null; // nothing to render — instant redirect
}
