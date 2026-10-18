import { redirect } from "next/navigation";

/** /account redirects to /profile — single source of truth for the customer account area */
export default function AccountRedirect() {
  redirect("/profile");
}
