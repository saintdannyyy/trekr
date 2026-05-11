"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle size={22} className="text-destructive" />
        </div>

        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          An unexpected error occurred. If this keeps happening, try refreshing
          the page or heading back to the dashboard.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono bg-muted rounded-lg px-3 py-2 mb-8">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw size={14} />
            Try again
          </Button>
          <Button asChild className="gap-2">
            <Link href="/dashboard">
              <Home size={14} />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
