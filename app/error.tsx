"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="text-sm text-left bg-muted p-4 rounded overflow-auto max-h-48">
              {error.message}
            </pre>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
