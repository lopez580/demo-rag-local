import { Message } from "@/app/chat/page";

export default function MessageList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-600">
        <p>Sube un documento y haz una pregunta</p>
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
          <div
            className={`max-w-2xl rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-100"
            }`}
          >
            {msg.content || (
              <span className="animate-pulse text-gray-500">Pensando...</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}