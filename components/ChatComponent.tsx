"use client";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { BotIcon, Loader2Icon, SendIcon, UserIcon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";

function ChatComponent({ id }: { id: string }) {
  const { user } = useUser();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [snapshot, setSnapshot, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt", "asc"),
      ),
  );

  const { messages, sendMessage  } = useChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center mt-16 gap-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <BotIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Ask a question about this document to get started.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="h-7 w-7 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center">
                  <BotIcon className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={`group max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-900 rounded-bl-sm"
                }`}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return <div key={`${message.id}-${i}`}>{part.text}</div>;
                  }
                })}
              </div>

              {isUser && (
                <div className="h-7 w-7 shrink-0 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-gray-700" />
                </div>
              )}
            </div>
          );
        })}

        {false && (
          <div className="flex items-end gap-2 justify-start">
            <div className="h-7 w-7 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center">
              <BotIcon className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-100 flex gap-1 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          // setInput(''); // Remove this line as input state is not managed here
        }}
        className="border-t bg-white/80 backdrop-blur-sm p-3 sm:p-4 flex gap-2 items-center"
      >
        <input
          value={input ?? ""}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask something about this document..."
          className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!input?.trim()}
          className="h-10 w-10 shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full disabled:opacity-40 disabled:hover:bg-indigo-600 transition shadow-sm"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default ChatComponent;