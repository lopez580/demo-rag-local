import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">
          RAG Demo
        </h1>
        <p className="text-gray-400">
          Sistema de consulta de documentación técnica
        </p>
        <Link
          href="/chat"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Entrar al sistema
        </Link>
      </div>
    </main>
  );
}