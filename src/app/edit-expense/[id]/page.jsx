import EditExpenseClient from "./EditExpenseClient";

export default function EditExpensePage({ params }) {
  const id = params.id;

  return <EditExpenseClient id={id} />;
}
