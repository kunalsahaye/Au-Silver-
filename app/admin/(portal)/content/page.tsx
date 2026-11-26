import { redirect } from "next/navigation";

/** Old address: site content now lives under Homepage and Shop settings. */
export default function Content() { redirect("/admin/settings"); }
