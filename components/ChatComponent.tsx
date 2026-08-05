"use client";
import {
  startTransition,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { BotIcon, Loader2Icon, SendIcon, UserIcon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { askQuestion } from "@/actions/askQuestion";
import { toast } from "sonner";
import axios from "axios";

// ---- Types -------------------------------------------------------------

type ChatRole = "human" | "ai";

interface ChatMessagePart {
  type: "text";
  text: string;
}

interface ChatMessage {
  role: ChatRole;
  message: string;
  createdAt: Date;
  id?: string;
}

// ---- Component -------------------------------------------------------------

function ChatComponent({ id }: { id: string }) {
  const { user } = useUser();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isPending, setTransition] = useTransition();

  const [snapshot, setSnapshot, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt", "asc"),
      ),
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!snapshot) return;

    const lastMessage = messages.pop();
    if (
      lastMessage &&
      lastMessage.role === "ai" &&
      lastMessage.message === "Thinking..."
    ) {
      return;
    }

    const newMessages = snapshot.docs.map((doc) => {
      const { role, message, createdAt } = doc.data();

      return {
        id: doc.id,
        role,
        message,
        createdAt: createdAt.toDate(),
      };
    });

    setMessages(newMessages);
  }, [snapshot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // TODO: you fill in the actual sending/fetching logic

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const q = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "human",
        message: q,
        createdAt: new Date(),
      },
      {
        role: "ai",
        message: "Thinking...",
        createdAt: new Date(),
      },
    ]);

    startTransition(async () => {
      const res = await axios.post(`/api/chat`, {
        id,
        question: q,
      })

      const { success, message } = res.data;
       
      console.log("success", success, message);

      if (!success) {

        toast("Something went wrong", {
            
          description: message ?? "Please try again later.",
          duration: 5000,
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        });

        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            {
              role: "ai",
              message: message ?? "Something went wrong",
              createdAt: new Date(),
            },
          ]),
        );
        return;
      }

      setMessages((prev) => {
        return prev.slice(0, prev.length - 1).concat({
          role: "ai",
          message: message ?? "Something went wrong",
          createdAt: new Date(),
        });
      });
    });
  }

  return (
    <div className="flex h-full flex-col bg-[#FAFAF7]">
      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E4E2DC] bg-[#F5F3EE]">
              <BotIcon className="h-6 w-6 text-[#4F46E5]" />
            </div>
            <p className="max-w-xs text-sm text-[#8A8D97]">
              Ask a question about this document to get started.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "human";
          return (
            <div
              key={message.id ?? index}
              className={`flex items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14161F]">
                  <BotIcon className="h-4 w-4 text-[#FFE066]" />
                </div>
              )}

              <div
                className={`group max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "rounded-br-sm bg-[#14161F] text-[#FAFAF7]"
                    : "rounded-bl-sm border border-[#E4E2DC] bg-white text-[#14161F]"
                }`}
              >
                {message.message}
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E4E2DC] bg-[#F5F3EE]">
                  <UserIcon className="h-4 w-4 text-[#4A4D57]" />
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-[#E4E2DC] bg-[#FAFAF7]/80 p-3 backdrop-blur-sm sm:p-4"
      >
        <input
          value={input ?? ""}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask something about this document..."
          className="flex-1 rounded-full border border-[#E4E2DC] bg-[#F5F3EE] px-4 py-2.5 text-sm placeholder:text-[#8A8D97] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
        />
        <button
          type="submit"
          disabled={!input?.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14161F] text-[#FAFAF7] shadow-sm transition hover:bg-[#4F46E5] disabled:opacity-40 disabled:hover:bg-[#14161F]"
        >
          {isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatComponent;
