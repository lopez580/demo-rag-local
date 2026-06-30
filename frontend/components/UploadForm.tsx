"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function UploadForm({
  proyectoId,
  proyectoNombre,
}: {
  proyectoId: number | null;
  proyectoNombre: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setMessage("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("project", proyectoNombre || "General");

    try {
      const res = await apiFetch("/api/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.ok) {
        setMessage(data.mensaje);
        setSuccess(true);
        setFile(null);
        
      } else {
        setMessage(data.error);
        setSuccess(false);
      }
    } catch {
      setMessage("Error al conectar con el servidor.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="border-l-4 border-[#E8174A] pl-3">
        <h3 className="text-[#2B4BA8] text-sm font-semibold">Subir documento</h3>
        {proyectoNombre && (
          <p className="text-gray-400 text-xs mt-1">Proyecto: {proyectoNombre}</p>
        )}
      </div>


      <label className="block w-full cursor-pointer border border-dashed border-gray-300 hover:border-[#2B4BA8] text-gray-400 hover:text-[#2B4BA8] rounded-lg px-3 py-2 text-sm transition-colors text-center">
        {file ? file.name : "Seleccionar PDF..."}
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-[#2B4BA8] hover:bg-[#1E3A8A] disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        {loading ? "Indexando..." : "Subir e indexar"}
      </button>

      {message && (
        <p className={`text-xs ${success ? "text-green-600" : "text-red-500"}`}>
          {success ? "" : ""}{message}
        </p>
      )}
    </div>
  );
}