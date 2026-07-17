import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell min-h-[70vh] py-20">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="eyebrow">404 · Doorway not found</p>
        <h1 className="mt-4 text-3xl font-bold">This page has moved.</h1>
        <p className="mt-3 text-[#557089]">
          Return home to choose work, produce or books.
        </p>
        <Link
          className="focus-ring mt-7 inline-block rounded-full bg-[#177245] px-6 py-3 font-bold text-white"
          href="/"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
