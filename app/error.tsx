'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log only the digest in production — no stack traces leaked
    if (error.digest) {
      console.error(`Page error [${error.digest}]`);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-gray-400 mb-8">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded font-semibold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
