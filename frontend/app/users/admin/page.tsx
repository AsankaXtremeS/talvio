import { redirect } from "next/navigation";

// /users/admin → redirect to dashboard
export default function AdminRootPage() {
  redirect("/users/admin/dashboard");
}