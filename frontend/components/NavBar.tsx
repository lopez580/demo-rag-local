"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  function handleLogout() {
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    window.location.href = "/login";
  }

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Barra roja superior */}
      <div className="h-2 w-full bg-[#E8174A]" />

      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo + nombre */}
        <div className="flex items-center gap-5">
          <img src="/images/logo.jpg" alt="Intesc" className="h-12 object-contain" />
          <div>
            <p className="text-[#2B4BA8] font-bold text-sm leading-tight">Sistema RAG</p>
            <p className="text-gray-400 text-xs leading-tight">Documentación Técnica</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex gap-2">
          <Link
            href="/chat"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/chat"
              ? "bg-[#2B4BA8] text-white"
              : "text-gray-500 hover:text-[#2B4BA8] hover:bg-blue-50"
              }`}
          >
            Chat
          </Link>
          <Link
            href="/documentos"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/documentos"
              ? "bg-[#2B4BA8] text-white"
              : "text-gray-500 hover:text-[#2B4BA8] hover:bg-blue-50"
              }`}
          >
            Documentos
          </Link>
        </nav>

        {/* Usuario */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2B4BA8] flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-gray-600 text-sm">Admin</span>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="ml-2 text-gray-400 hover:text-[#E8174A] transition-colors"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}