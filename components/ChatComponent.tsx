"use client";
import { startTransition, useEffect, useRef, useState, useTransition } from "react";
import { BotIcon, Loader2Icon, SendIcon, UserIcon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { askQuestion } from "@/actions/askQuestion";

// ---- Types -------------------------------------------------------------

type ChatRole = "human" | "ai";

interface ChatMessagePart {
  type: "text";
  text: string;
}

interface ChatMessage {
  role: ChatRole;
  message : string;
  createdAt: Date;
  id?: string;
}

// ---- Component -------------------------------------------------------------

function ChatComponent({ id }: { id: string }) {
  const { user } = useUser();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isPending , setTransition] = useTransition();


  const [snapshot, setSnapshot, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt", "asc"),
      ),
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if(!snapshot) return;
   
    const lastMessage = messages.pop();
    if(lastMessage && lastMessage.role === "ai" && lastMessage.message === "Thinking..."){
      return 
    }

    const newMessages = snapshot.docs.map((doc)=>{
      const {role , message , createdAt} = doc.data();

      return {
        id : doc.id ,
        role ,
        message ,
        createdAt: createdAt.toDate()
      }
    })

    setMessages(newMessages);

  }, [snapshot]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  } , [messages])
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

      const {success , message} = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, question: q }),
      }).then((res) => res.json())
      .then((res) => {
        console.log(res);
        return res;
      }).catch((err) => {
        console.error(err);
        return { success: false, message: "Something went wrong" };
      });

      console.log("success" , success , message);


      

      if(!success){
        setMessages((prev) => 
             prev.slice(0 , prev.length -1).concat([
              {
                role : "ai",
                message : message ?? "Something went wrong",
                createdAt : new Date()
              }])
        );
        return;
      }

      setMessages((prev) => {
        return prev.slice(0 , prev.length -1).concat({
            role : "ai",
            message : message ?? "Something went wrong",
            createdAt : new Date()
        });
      });
    });
  }

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

        {messages.map((message , index) => {
          const isUser = message.role === "human";
          return (
            <div
              key={message.id ?? index}
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
                {message.message}
              </div>

              {isUser && (
                <div className="h-7 w-7 shrink-0 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-gray-700" />
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
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
          {
            isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )
          }
        </button>
      </form>
    </div>
  );
}

export default ChatComponent;