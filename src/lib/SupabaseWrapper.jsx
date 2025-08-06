"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "./supabaseClient";

export default function SupabaseWrapper({ children }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
