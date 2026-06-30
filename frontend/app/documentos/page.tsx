"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { apiFetch } from "@/lib/api";

interface Document {
  id: number;
  title: string;
  author: string;
  project: string;
  file_name: string;
  uploaded_at: string;
}

export default function DocumentosPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await apiFetch("/api/documentos/");
        const data = await res.json();
        setDocuments(data.documentos ?? []);
      } catch {
        console.error("Error al cargar documentos");
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  function toggleSelect(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  async function handleOpen(id: number) {
    try {
      const res = await apiFetch(`/api/documentos/${id}/url/`);
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank");
    } catch {
      console.error("Error al abrir documento");
    }
  }

  function handleConsultar() {
    if (selected.length === 0) return;
    router.push(`/chat?docs=${selected.join(",")}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#E8174A] rounded-full" />
            <h2 className="text-[#2B4BA8] text-xl font-semibold">
              Documentos indexados
            </h2>
          </div>

          {selected.length > 0 && (
            <button
              onClick={handleConsultar}
              className="bg-[#2B4BA8] hover:bg-[#1E3A8A] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Consultar {selected.length} documento{selected.length > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-400">No hay documentos indexados aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleOpen(doc.id)}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:border-[#2B4BA8] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div
                    onClick={(e) => toggleSelect(e, doc.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                      selected.includes(doc.id)
                        ? "bg-[#2B4BA8] border-[#2B4BA8]"
                        : "border-gray-300 hover:border-[#2B4BA8]"
                    }`}
                  >
                    {selected.includes(doc.id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Icono PDF */}
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2B4BA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <p className="text-gray-800 font-medium">{doc.title}</p>
                    <p className="text-gray-400 text-sm">
                      {doc.project} — {doc.author}
                    </p>
                    <p className="text-gray-300 text-xs">{doc.file_name}</p>
                  </div>
                </div>

                <div className="text-right space-y-2 flex-shrink-0">
                  <span className="inline-block bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                    Indexado
                  </span>
                  <p className="text-gray-400 text-xs">
                    {new Date(doc.uploaded_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}