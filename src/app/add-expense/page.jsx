import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AddExpenseForm from "./AddExpenseForm";

export const dynamic = "force-dynamic";

export default async function AddExpensePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <AddExpenseForm />;
}
