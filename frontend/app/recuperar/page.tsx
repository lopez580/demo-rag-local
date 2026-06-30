"use client";

import { useState } from "react";
import Link from "next/link";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    // Por ahora simulamos el envío hasta tener el SMTP configurado
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img src="/images/logo.jpg" alt="Intesc" className="h-16 object-contain" />
          <p className="text-gray-400 text-sm">Recuperar contraseña</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">Correo enviado</p>
            <p className="text-gray-400 text-sm">
              Si el correo está registrado recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link
              href="/login"
              className="block w-full text-center bg-[#2B4BA8] hover:bg-[#1E3A8A] text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm text-center">
              Ingresa tu correo o usuario y te enviaremos un enlace para recuperar tu cuenta.
            </p>

            <input
              type="text"
              placeholder="Correo o usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 outline-none focus:border-[#2B4BA8] transition-colors placeholder-gray-400"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!email.trim() || loading}
              className="w-full bg-[#2B4BA8] hover:bg-[#1E3A8A] disabled:opacity-50 text-white rounded-lg px-4 py-3 font-medium transition-colors"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-gray-400 hover:text-[#2B4BA8] transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}