"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell min-h-[70vh] py-20">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-4 text-2xl font-bold">
          This doorway could not open.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#557089]">
          Your marketplace data was not changed. Try loading this screen again.
        </p>
        <button
          className="focus-ring mt-6 rounded-full bg-[#177245] px-6 py-3 font-bold text-white"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
