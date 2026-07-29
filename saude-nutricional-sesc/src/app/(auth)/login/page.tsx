"use client";

import { useActionState } from "react";
import {
  signIn,
  type ActionState,
} from "../../../modules/access/actions";

const initialState: ActionState = Object.freeze({ error: null });

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-12 text-slate-950">
      <section className="mx-auto max-w-md border-t-8 border-amber-400 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
          Saúde Nutricional
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-950">
          Acesso profissional
        </h1>
        <p className="mt-3 text-slate-600">
          Acesso exclusivo para profissionais convidados.
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label
              className="block text-sm font-semibold text-slate-800"
              htmlFor="email"
            >
              E-mail
            </label>
            <input
              autoComplete="email"
              className="mt-2 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-800"
              htmlFor="password"
            >
              Senha
            </label>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
              id="password"
              minLength={12}
              name="password"
              required
              type="password"
            />
          </div>

          <p aria-live="polite" className="min-h-6 text-sm text-red-700">
            {state.error}
          </p>

          <button
            className="w-full rounded bg-blue-900 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={pending}
            type="submit"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
