import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import type { GuestQuota, Message } from "@talk-to-god/shared";
import { useAuth } from "../context/AuthContext";
import { fetchGuestQuota, fetchMessages, sendMessageStream, fetchConversations } from "../lib/api";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [philosopherName, setPhilosopherName] = useState("");
  const [philosopherId, setPhilosopherId] = useState("");
  const [quota, setQuota] = useState<GuestQuota | null>(null);
  const [limitHint, setLimitHint] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const isGuest = quota?.isGuest ?? !user;
  const limitReached = isGuest && quota !== null && quota.remaining <= 0;

  const loadQuota = () => {
    fetchGuestQuota().then(setQuota).catch(console.error);
  };

  useEffect(() => {
    if (!id) return;

    fetchMessages(id).then(setMessages).catch(console.error);
    loadQuota();

    const storedName = sessionStorage.getItem(`conv-${id}-name`);
    const storedPhilId = sessionStorage.getItem(`conv-${id}-philosopher`);
    if (storedName) setPhilosopherName(storedName);
    if (storedPhilId) setPhilosopherId(storedPhilId);

    fetchConversations()
      .then((convs) => {
        const conv = convs.find((c) => c.id === id);
        if (conv) {
          setPhilosopherName(conv.philosopherName);
          setPhilosopherId(conv.philosopherId);
          sessionStorage.setItem(`conv-${id}-name`, conv.philosopherName);
          sessionStorage.setItem(`conv-${id}-philosopher`, conv.philosopherId);
        }
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (user) loadQuota();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent, limitHint]);

  const handleSend = async () => {
    if (!id || !input.trim() || streaming || limitReached) return;
    const content = input.trim();
    setInput("");
    setStreaming(true);
    setStreamContent("");
    setLimitHint("");

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: id,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    let accumulated = "";
    await sendMessageStream(
      id,
      content,
      (token) => {
        accumulated += token;
        setStreamContent(accumulated);
      },
      (messageId) => {
        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            conversationId: id,
            role: "assistant",
            content: accumulated,
            createdAt: new Date().toISOString(),
          },
        ]);
        setStreamContent("");
        setStreaming(false);
        loadQuota();
      },
      (error) => {
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setInput(content);
        setStreamContent("");
        setStreaming(false);
        setLimitHint(error);
        loadQuota();
      }
    );
  };

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto bg-bg">
      <header className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-gray-100 shrink-0">
        <button onClick={() => navigate("/conversations")} className="text-text-muted text-sm">
          ←
        </button>
        <button
          onClick={() => philosopherId && navigate(`/philosopher/${philosopherId}`)}
          className="flex items-center gap-2 flex-1"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-serif text-primary">{philosopherName.slice(0, 1) || "?"}</span>
          </div>
          <span className="font-medium text-sm">{philosopherName || "对话中"}</span>
        </button>
      </header>

      {isGuest && quota && !limitReached && (
        <div className="px-4 py-2 bg-accent/10 text-xs text-accent text-center shrink-0">
          游客模式：还可发送 {quota.remaining} 条消息，
          <Link to="/profile" className="underline font-medium">
            登录
          </Link>
          后解锁无限对话
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                <span className="text-xs font-serif text-primary">{philosopherName.slice(0, 1)}</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-surface border border-gray-100 rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {streaming && streamContent && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
              <span className="text-xs font-serif text-primary">{philosopherName.slice(0, 1)}</span>
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-surface border border-gray-100">
              <ReactMarkdown>{streamContent}</ReactMarkdown>
              <span className="inline-block w-1.5 h-4 bg-primary/50 animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        {streaming && !streamContent && (
          <div className="flex justify-start">
            <div className="ml-9 text-xs text-text-muted animate-pulse">思考中…</div>
          </div>
        )}

        {(limitReached || limitHint) && (
          <div className="mx-2 p-4 rounded-xl bg-primary/5 border border-primary/15 text-center">
            <p className="text-sm text-primary font-medium">
              {limitHint || `您处于游客模式，最多只能发送 ${quota?.limit ?? 3} 条消息`}
            </p>
            <p className="text-xs text-text-muted mt-1">请登录后继续与哲学家对话</p>
            <Link
              to="/profile"
              className="inline-block mt-3 px-5 py-2 bg-primary text-white rounded-full text-sm"
            >
              去登录
            </Link>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 bg-surface border-t border-gray-100 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={limitReached ? "请先登录后继续对话" : "输入你的问题…"}
            disabled={streaming || limitReached}
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim() || limitReached}
            className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
