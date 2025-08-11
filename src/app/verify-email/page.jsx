"use client";

import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p>Verifying your email...</p>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
