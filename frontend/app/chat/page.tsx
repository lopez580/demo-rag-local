"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import MessageList from "@/components/MessageList";
import Navbar from "@/components/NavBar";
import { apiFetch, apiJSON } from "@/lib/api";

export interface Message {
    role: "user" | "assistant";
    content: string;
}

function ChatContent() {
    const searchParams = useSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [selectedDocs, setSelectedDocs] = useState<{ id: number, title: string }[]>([]);
    const [proyectoId, setProyectoId] = useState<number | null>(null);
    const [proyectoNombre, setProyectoNombre] = useState<string>("");

    useEffect(() => {
        const docsParam = searchParams.get("docs");
        const pId = searchParams.get("proyecto_id");
        const pNombre = searchParams.get("proyecto");

        if (pId) setProyectoId(Number(pId));
        if (pNombre) setProyectoNombre(decodeURIComponent(pNombre));

        if (docsParam) {
            const ids = docsParam.split(",").map(Number);
            async function fetchDocs() {
                const res = await apiFetch("/api/documentos/");
                const data = await res.json();
                const filtered = data.documentos.filter((d: any) => ids.includes(d.id));
                setSelectedDocs(filtered);
            }
            fetchDocs();
        }
    }, [searchParams]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function removeDoc(id: number) {
        setSelectedDocs((prev) => prev.filter((d) => d.id !== id));
    }

    async function handleSubmit() {
        if (!input.trim() || loading) return;

        const pregunta = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: pregunta }]);
        setLoading(true);
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        try {
            const res = await apiJSON("/api/query/", {
                method: "POST",
                body: JSON.stringify({
                    pregunta,
                    documento_ids: selectedDocs.map((d) => d.id),
                }),
            });

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();

            let fullContent = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullContent += chunk;
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: fullContent,
                    };
                    return updated;
                });
            }
        } catch {
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = "Error al conectar con el servidor.";
                return updated;
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto shadow-sm">
                    <div className="border-l-4 border-[#E8174A] pl-3">
                        <h2 className="text-[#2B4BA8] font-semibold text-sm">Gestión de documentos</h2>
                        {proyectoNombre && (
                            <p className="text-gray-400 text-xs mt-1">Proyecto: {proyectoNombre}</p>
                        )}
                    </div>
                    <UploadForm proyectoId={proyectoId} proyectoNombre={proyectoNombre} />
                </aside>

                {/* Chat */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">
                        <MessageList messages={messages} />
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 bg-white p-4 space-y-3">
                        <div className="flex flex-wrap gap-2 min-h-6">
                            {selectedDocs.length === 0 ? (
                                <span className="text-gray-400 text-xs">Buscando en todos los documentos</span>
                            ) : (
                                selectedDocs.map((doc) => (
                                    <span
                                        key={doc.id}
                                        className="flex items-center gap-1 bg-blue-50 text-[#2B4BA8] border border-blue-200 text-xs px-3 py-1 rounded-full"
                                    >
                                        {doc.title}
                                        <button
                                            onClick={() => removeDoc(doc.id)}
                                            className="hover:text-[#E8174A] transition-colors ml-1"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                placeholder="Escribe tu pregunta..."
                                className="flex-1 border border-gray-200 text-gray-800 rounded-lg px-4 py-3 outline-none focus:border-[#2B4BA8] transition-colors placeholder-gray-400"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-[#2B4BA8] hover:bg-[#1E3A8A] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                {loading ? "..." : "Enviar"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense>
            <ChatContent />
        </Suspense>
    );
}