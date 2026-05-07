"use client";
import useUserName from "@/app/hooks/useUserName";
import { client } from "@/lib/client";
import { formateTimeRemaining } from "@/lib/formateTimeRemaining";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRealtime } from "@/lib/realtime-client";

const RoomIdPage = () => {
  const { username } = useUserName();
  const params = useParams();
  const roomId = params.roomId as string;
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [timeRemaining, setTimeRemainig] = useState<number | null>(250);
  const [textInput, setTextInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopyStatus("Copied!");
    toast.success(`Successfully Copy- ${roomId}`, { position: "top-right" });
    setTimeout(() => setCopyStatus("Copy"), 2000);
  };

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } });
      return res.data;
    },
  });

  // message post send mutation .
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post(
        { sender: username, text },
        { query: { roomId } },
      );
    },
  });

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") refetch();
    },
  });

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">ROOM ID</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-500">{roomId}</span>
              <button
                onClick={copyLink}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-md text-zinc-100 hover:text-zinc-300 transition-colors"
              >
                {copyStatus}
              </button>
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-700" />
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">
              Self-destruct
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-2 ${timeRemaining !== null && timeRemaining < 60 ? "text-red-500" : "text-green-500"}`}
            >
              {timeRemaining !== null
                ? formateTimeRemaining(timeRemaining)
                : "--000--"}
            </span>
          </div>
        </div>
        <button className="text-sm bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded-md text-zinc-300 hover:text-gray-100 font-bold transition-all group flex items-center gap-1.5 disabled:opacity-50">
          <span className="group-hover:animate-pulse text-2xl">💥</span>
          DESTROY NOW
        </button>
      </header>
      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages?.messages.length === 0 && (
          <div className="flex items-center justify-center text-center h-full">
            <p className="text-zinc-500 text-xl font-mono">
              No messages yet, start the conversation.
            </p>
          </div>
        )}
        {messages?.messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[80%] group">
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  className={`text-xs font-bold ${msg.sender === username ? "text-green-500" : "text-blue-500"}`}
                >
                  {msg.sender === username ? "YOU" : msg.sender}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {format(msg.timestamp, "HH:mm")}
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed break-all">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* input section */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 text-2xl animate-pulse">
              {">"}
            </span>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // send message
                  sendMessage({ text: textInput });
                  inputRef.current?.focus();
                }
              }}
              placeholder="Type Message..."
              className="w-full bg-black border-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors text-zinc-100 placeholder:text-zinc-600 py-3 pl-8 pr-4 text-sm"
            />
          </div>
          <button
            onClick={() => {
              (sendMessage({ text: textInput }), inputRef.current?.focus());
            }}
            disabled={isPending || !textInput.trim()}
            className="bg-zinc-800 text-zinc-100 px-6 text-sm font-bold hover:text-zinc-200 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            SEND
          </button>
        </div>
      </div>
    </main>
  );
};

export default RoomIdPage;
