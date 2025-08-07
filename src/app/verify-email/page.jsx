"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient"; // adjust import if needed

export default function VerifyEmailPage() {
  const router = useRouter();

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
    const timer = setTimeout(() => {
      // Optionally, prompt users to sign in if they have already verified
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.push("/dashboard");
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
