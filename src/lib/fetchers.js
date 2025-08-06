import { supabase } from "@/lib/supabaseClient";

export const getExpenses = async (uid) => {
  console.log("🔥 getExpenses called with", uid);
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", uid)
    .order("date", { ascending: false });

  if (error) {
    console.error("❌ Supabase error in getExpenses:", error);
    throw error;
  }

  return data;
};

export const getSmartSummary = async (uid) => {
  console.log("✨ getSmartSummary called with", uid);
  const { data, error } = await supabase
    .from("ai_summary")
    .select("summary_text, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("❌ Supabase error in getSmartSummary:", error);
    throw error;
  }

  return data?.summary_text ?? null;
};
