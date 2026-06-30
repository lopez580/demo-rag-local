import { Message } from "@/app/chat/page";

export default function MessageList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>Selecciona documentos y haz una pregunta</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {/* Avatar asistente */}
          {msg.role === "assistant" && (
            <div className="w-8 h-8 rounded-full bg-[#2B4BA8] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div
            className={`max-w-2xl rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-[#E8174A] text-white rounded-tr-sm"
                : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm"
            }`}
          >
            {msg.content || (
              <span className="flex items-center gap-2 text-gray-400">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </span>
            )}
          </div>

          {/* Avatar usuario */}
          {msg.role === "user" && (
            <div className="w-8 h-8 rounded-full bg-[#E8174A] flex items-center justify-center ml-2 flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}