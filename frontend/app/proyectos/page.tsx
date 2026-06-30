"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { apiFetch, apiJSON } from "@/lib/api";

export default function ProyectosPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<{ id: number, nombre: string, created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoProyecto, setNuevoProyecto] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [creating, setCreating] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    async function fetchProyectos() {
      try {
        const res = await apiFetch("/api/proyectos/");
        const data = await res.json();
        setProyectos(data.proyectos);
      } catch {
        console.error("Error al cargar proyectos");
      } finally {
        setLoading(false);
      }
    }
    fetchProyectos();
  }, []);

  async function handleNuevoProyecto() {
    if (!nuevoProyecto.trim()) return;
    setCreating(true);

    try {
      const res = await apiJSON("/api/proyectos/crear/", {
        method: "POST",
        body: JSON.stringify({ nombre: nuevoProyecto.trim() }),
      });
      const data = await res.json();
      console.log("Respuesta servidor:", data);
      if (data.ok) {
        router.push(`/chat?proyecto=${encodeURIComponent(nuevoProyecto.trim())}&proyecto_id=${data.id}`);
      }
    } catch (err) {
      console.error("Error al crear proyecto,", err);
    } finally {
      setCreating(false);
    }
  }

  function handleAbrirProyecto(proyecto: { id: number, nombre: string }) {
    router.push(`/chat?proyecto=${encodeURIComponent(proyecto.nombre)}&proyecto_id=${proyecto.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-3xl mx-auto p-6">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-[#E8174A] rounded-full" />
          <h2 className="text-[#2B4BA8] text-xl font-semibold">
            ¿Con qué proyecto trabajarás hoy?
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Nuevo proyecto */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-[#2B4BA8] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2B4BA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-gray-800 font-semibold mb-1">Nuevo proyecto</h3>
            <p className="text-gray-400 text-sm mb-4">Crea un espacio para un nuevo proyecto técnico</p>

            {showInput ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nombre del proyecto"
                  value={nuevoProyecto}
                  onChange={(e) => setNuevoProyecto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNuevoProyecto()}
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#2B4BA8] transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleNuevoProyecto}
                    disabled={!nuevoProyecto.trim() || creating}
                    className="flex-1 bg-[#2B4BA8] hover:bg-[#1E3A8A] disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {creating ? "Creando..." : "Crear"}
                  </button>
                  <button
                    onClick={() => { setShowInput(false); setNuevoProyecto(""); }}
                    className="px-3 py-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowInput(true)}
                className="w-full bg-[#2B4BA8] hover:bg-[#1E3A8A] text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                Crear proyecto
              </button>
            )}
          </div>

          {/* Proyectos existentes */}
          <div
            onClick={() => {
              setHighlight(true);
              setTimeout(() => setHighlight(false), 1500);
              document.getElementById("lista-proyectos")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-[#2B4BA8] transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#E8174A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-gray-800 font-semibold mb-1">Proyectos existentes</h3>
            <p className="text-gray-400 text-sm">
              {loading ? "Cargando..." : `${proyectos.length} proyecto${proyectos.length !== 1 ? "s" : ""} disponible${proyectos.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Lista de proyectos */}
        {!loading && proyectos.length > 0 && (
          <div
            className={`space-y-3 transition-all duration-300 ${highlight ? "ring-2 ring-[#2B4BA8] rounded-xl p-2" : ""}`}
            id="lista-proyectos"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-[#2B4BA8] rounded-full" />
              <h3 className="text-gray-600 font-medium text-sm">Proyectos recientes</h3>
            </div>
            {proyectos.map((proyecto) => (
              <div
                key={proyecto.id}
                onClick={() => handleAbrirProyecto(proyecto)}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:border-[#2B4BA8] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2B4BA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{proyecto.nombre}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(proyecto.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-[#2B4BA8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}