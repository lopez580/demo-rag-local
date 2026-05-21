"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/NavBar";

interface Document {
  id: number;
  title: string;
  author: string;
  project: string;
  file_name: string;
  uploaded_at: string;
}

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("http://localhost:8000/api/documentos/");
        const data = await res.json();
        setDocuments(data.documentos);
      } catch {
        console.error("Error al cargar documentos");
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-white text-xl font-semibold mb-6">
          Documentos indexados
        </h2>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : documents.length === 0 ? (
          <p className="text-gray-400">No hay documentos aún</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-900 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-white font-medium">{doc.title}</p>
                  <p className="text-gray-400 text-sm">
                    {doc.project} — {doc.author}
                  </p>
                  <p className="text-gray-600 text-xs">{doc.file_name}</p>
                </div>
                <div className="text-gray-600 text-xs text-right">
                  {new Date(doc.uploaded_at).toLocaleDateString("es-MX")}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}