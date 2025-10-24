"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push("/admin");
    } else {
      setError("Credenciais inválidas");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Best Brownie — Admin</h1>
          <p className="text-sm text-zinc-600">Acesse para gerenciar produtos</p>
        </div>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-zinc-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-700">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-zinc-600 hover:underline">Voltar para a home</Link>
        </div>
      </div>
    </div>
  );
}