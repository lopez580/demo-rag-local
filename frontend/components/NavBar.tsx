"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <h1 className="text-white font-semibold">RAG Demo </h1>
      <div className="flex gap-2">
        <Link
          href="/chat"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/chat"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Chat
        </Link>
        <Link
          href="/documentos"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/documentos"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Documentos
        </Link>
      </div>
    </nav>
  );
}