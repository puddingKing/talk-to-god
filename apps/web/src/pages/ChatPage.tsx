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

  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto bg-chat-gradient">
      <header className="flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-md border-b border-white/50 shrink-0">
        <button
          onClick={() => navigate("/conversations")}
          className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-text-muted shadow-sm"
        >
          ←
        </button>
        <button
          onClick={() => philosopherId && navigate(`/philosopher/${philosopherId}`)}
          className="flex items-center gap-2.5 flex-1"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm">
            <span className="text-sm font-serif text-white">{philosopherName.slice(0, 1) || "?"}</span>
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm text-text block">{philosopherName || "对话中"}</span>
            <span className="text-[10px] text-text-light">AI 思辨对话</span>
          </div>
        </button>
      </header>

      {isGuest && quota && !limitReached && (
        <div className="px-4 py-2 bg-primary/10 text-xs text-primary text-center shrink-0 border-b border-primary/10">
          游客模式：还可发送 {quota.remaining} 条消息，
          <Link to="/profile" className="underline font-medium">
            登录
          </Link>
          后解锁无限对话
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center pt-8 pb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-cyan-200 shadow-card mb-5 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-violet-400/80 blur-[1px]" />
            </div>
            <h2 className="text-lg font-semibold text-text mb-1">与 {philosopherName || "哲学家"} 对话</h2>
            <p className="text-sm text-text-muted text-center max-w-[260px] leading-relaxed">
              提出你的问题，AI 将以这位哲学家的视角与风格回应你
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                <span className="text-xs font-serif text-white">{philosopherName.slice(0, 1)}</span>
              </div>
            )}
            <div
              className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-2xl rounded-br-md shadow-sm"
                  : "glass-card rounded-2xl rounded-bl-md !shadow-sm"
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0 mr-2 mt-1">
              <span className="text-xs font-serif text-white">{philosopherName.slice(0, 1)}</span>
            </div>
            <div className="max-w-[82%] glass-card rounded-2xl rounded-bl-md px-4 py-3 text-sm !shadow-sm">
              <ReactMarkdown>{streamContent}</ReactMarkdown>
              <span className="inline-block w-1.5 h-4 bg-primary/40 animate-pulse ml-0.5 rounded-sm" />
            </div>
          </div>
        )}

        {streaming && !streamContent && (
          <div className="flex justify-start pl-10">
            <div className="glass-card px-4 py-2.5 text-xs text-text-muted animate-pulse">思考中…</div>
          </div>
        )}

        {(limitReached || limitHint) && (
          <div className="glass-card mx-1 p-5 text-center">
            <p className="text-sm text-primary font-medium">
              {limitHint || `您处于游客模式，最多只能发送 ${quota?.limit ?? 3} 条消息`}
            </p>
            <p className="text-xs text-text-muted mt-1">请登录后继续与哲学家对话</p>
            <Link to="/profile" className="inline-block mt-4 btn-primary">
              去登录
            </Link>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 bg-white/70 backdrop-blur-xl border-t border-white/60 shrink-0">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={limitReached ? "请先登录后继续对话" : "输入你的问题…"}
            disabled={streaming || limitReached}
            className="flex-1 field-input !py-2.5 !rounded-full disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim() || limitReached}
            className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-fab disabled:opacity-40 shrink-0"
            aria-label="发送"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
