"use client";

import Link from "next/link";

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="min-h-dvh bg-slate-50 px-8 py-12 text-slate-950">
      <section
        aria-labelledby="error-heading"
        className="mx-auto max-w-2xl border-t-4 border-amber-400 bg-white p-8 shadow-sm"
        role="alert"
      >
        <p className="text-base font-semibold uppercase tracking-[0.12em] text-blue-800">
          Saúde Nutricional
        </p>
        <h1
          className="mt-3 text-3xl font-bold text-blue-950"
          id="error-heading"
        >
          Não foi possível carregar esta área
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          Tente novamente. Se o problema continuar, retorne ao início e
          procure o suporte responsável.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded bg-blue-900 px-5 py-3 font-semibold text-white outline-none hover:bg-blue-800 focus-visible:ring-4 focus-visible:ring-amber-300"
            onClick={reset}
            type="button"
          >
            Tentar novamente
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded border-2 border-blue-900 px-5 py-3 font-semibold text-blue-950 outline-none hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-amber-300"
            href="/inicio"
          >
            Voltar ao início
          </Link>
        </div>
      </section>
    </main>
  );
}
