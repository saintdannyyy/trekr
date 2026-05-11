import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — Trekr",
};

export default function SignUpPage() {
  return <SignUp />;
}
