"use client";

import { useState, useRef, useEffect } from "react";
import UploadForm from "@/components/UploadForm";
import MessageList from "@/components/MessageList";

export interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: Source[];
}

export interface Source {
    archivo: string;
    pagina: number;
    score: number;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSubmit() {
        if (!input.trim() || loading) return;

        const pregunta = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: pregunta }]);
        setLoading(true);

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        try {
            const res = await fetch("http://localhost:8000/api/query/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pregunta }),
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
        } catch (err) {
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
        <div className="min-h-screen bg-gray-950 flex">
            {/* Sidebar */}
            <aside className="w-80 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-4">
                <h2 className="text-white font-semibold text-lg">RAG Demo </h2>
                <UploadForm />
            </aside>

            {/* Chat */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                    <MessageList messages={messages} />
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-800 p-4 flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="Escribe tu pregunta..."
                        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 outline-none placeholder-gray-500"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        {loading ? "..." : "Enviar"}
                    </button>
                </div>
            </main>
        </div>
    );
}