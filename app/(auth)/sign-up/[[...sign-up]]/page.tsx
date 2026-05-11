import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center mb-8 absolute top-12">
        <span className="font-semibold text-2xl tracking-tight text-stone-900">
          Trekr<span className="text-amber-500">.</span>
        </span>
      </div>
      <SignUp />
    </div>
  );
}
