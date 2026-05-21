"use client";

import { useState } from "react";
interface Document {
  id: number;
  title: string;
  author: string;
  project: string;
  file_name: string;
  uploaded_at: string;
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [project, setProject] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("author", author || "Desconocido");
    formData.append("project", project || "General");

    try {
      const res = await fetch("http://localhost:8000/api/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.ok) {
        setMessage(` ${data.mensaje}`);
        setFile(null);
        setTitle("");
        setAuthor("");
        setProject("");
      } else {
        setMessage(` ${data.error}`);
      }
    } catch {
      setMessage(" Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
        Subir documento
      </h3>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder-gray-500"
      />

      <input
        type="text"
        placeholder="Autor"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder-gray-500"
      />

      <input
        type="text"
        placeholder="Proyecto"
        value={project}
        onChange={(e) => setProject(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder-gray-500"
      />

      <label className="block w-full cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg px-3 py-2 text-sm transition-colors">
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
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        {loading ? "Indexando..." : "Subir e indexar"}
      </button>

      {message && (
        <p className="text-xs text-gray-400">{message}</p>
      )}
    </div>
  );
}