import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Search size={22} className="text-muted-foreground" />
        </div>

        <p className="font-display text-6xl font-bold text-brand mb-4">404</p>

        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft size={14} />
              Back home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
