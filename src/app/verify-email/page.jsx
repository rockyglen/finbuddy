"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient"; // adjust import if needed

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const resendConfirmation = async () => {
    const userEmail = localStorage.getItem("pending_email");
    if (!userEmail) {
      alert("Email not found. Please sign up again.");
      router.push("/sign-up");
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: userEmail,
    });

    if (error) {
      alert("Failed to resend confirmation. Try again.");
    } else {
      alert("Confirmation email sent. Check your inbox.");
    }
  };

  useEffect(() => {
    const token = searchParams.get("token_hash");
    const type = searchParams.get("type");

    // If the email confirmation link was clicked
    if (token && type === "signup") {
      supabase.auth
        .verifyOtp({ token_hash: token, type: "signup" })
        .then(({ data, error }) => {
          if (error) {
            console.error("Verification error:", error);
          } else {
            // Session is now active, redirect to dashboard
            router.replace("/dashboard");
          }
        });
    } else {
      // Fallback: check if already signed in
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.replace("/dashboard");
        }
      });
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p className="mb-6 text-gray-600 max-w-md">
        We’ve sent a confirmation link to your email. Please click it to
        complete your registration.
      </p>

      <Button onClick={resendConfirmation}>Resend Confirmation Email</Button>

      <p className="mt-6 text-sm text-gray-500">
        Already confirmed?{" "}
        <span
          onClick={() => router.push("/sign-in")}
          className="text-blue-600 cursor-pointer underline"
        >
          Sign In
        </span>
      </p>
    </div>
  );
}
