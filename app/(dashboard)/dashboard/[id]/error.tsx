"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ApplicationDetailError({
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
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-4 w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={18} className="text-destructive" />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-1">
          Failed to load application
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          There was a problem fetching this application. It may have been
          deleted or there was a network issue.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground bg-muted rounded-md px-3 py-1.5 mb-6 inline-block">
            {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-2">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw size={14} />
            Try again
          </Button>
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft size={14} />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
