import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/site/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — Trekr",
};
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="mb-8">
        <Logo />
      </div>
      <SignUp />
    </div>
  );
}
