import { redirect } from "next/navigation";

// FIRST VIEWPORT contract: the canvas opens straight on the active task's
// input row, no hero, no chooser page — the sidebar is the sole navigation
// surface (see Sidebar.tsx), so "/" is not a landing page in its own right.
export default function Home() {
  redirect("/recommend");
}
