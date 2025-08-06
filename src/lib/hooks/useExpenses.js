import useSWR from "swr";
import { supabase } from "@/lib/supabaseClient";

const fetchExpenses = async (uid) => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", uid)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export default function useExpenses(uid) {
  const { data, error, isLoading, mutate } = useSWR(
    uid ? ["expenses", uid] : null, // cache key
    () => fetchExpenses(uid), // fetcher function
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute = 60,000 ms
    }
  );

  return {
    expenses: data || [],
    isLoading,
    error,
    mutate, // use this to manually refresh data
  };
}
