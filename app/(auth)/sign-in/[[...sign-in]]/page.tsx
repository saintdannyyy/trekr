import { SignIn } from '@clerk/nextjs';
import { Logo } from '@/components/site/Logo';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="mb-8">
        <Logo />
      </div>
      <SignIn />
    </div>
  );
}
