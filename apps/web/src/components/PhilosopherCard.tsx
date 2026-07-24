import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Philosopher, Conversation } from "@talk-to-god/shared";
import { createConversation, fetchConversations } from "../lib/api";

interface Props {
  philosopher: Philosopher;
  existingConversation?: Conversation;
}

const AVATAR_COLORS = [
  "from-blue-400 to-blue-500",
  "from-violet-400 to-violet-500",
  "from-cyan-400 to-cyan-500",
  "from-indigo-400 to-indigo-500",
  "from-sky-400 to-sky-500",
];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ContinueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 10h8M8 14h5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.217-1.338A9.955 9.955 0 0012 22z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PhilosopherCard({ philosopher, existingConversation }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dialogConvs, setDialogConvs] = useState<Conversation[] | null>(null);
  const initials = philosopher.name.slice(0, 1);
  const avatarColor = colorForId(philosopher.philosopherId);
  const hasExisting = !!existingConversation;

  const goToChat = async (continueId?: string) => {
    setLoading(true);
    setDialogConvs(null);
    try {
      if (continueId) {
        navigate(`/chat/${continueId}`);
        return;
      }
      const conv = await createConversation(philosopher.philosopherId);
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const convs = await fetchConversations();
      const existing = convs.filter((c) => c.philosopherId === philosopher.philosopherId);
      if (existing.length > 0) {
        setDialogConvs(existing);
      } else {
        await goToChat();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glass-card-hover flex items-center gap-3 p-3.5">
        <Link to={`/philosopher/${philosopher.philosopherId}`} className="flex flex-1 gap-3 min-w-0 items-center">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center shrink-0 shadow-sm`}
          >
            {philosopher.avatarUrl ? (
              <img
                src={philosopher.avatarUrl}
                alt={philosopher.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-lg font-serif text-white font-medium">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold truncate text-text">{philosopher.name}</h3>
              <span className="status-running shrink-0">可对话</span>
            </div>
            {philosopher.nameEn && (
              <p className="text-[11px] text-text-light truncate mt-0.5">{philosopher.nameEn}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {philosopher.school.slice(0, 2).map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 bg-tag-blue text-tag-blue-text rounded-full">
                  {s}
                </span>
              ))}
              {philosopher.era && (
                <span className="text-[10px] px-2 py-0.5 bg-tag-purple text-tag-purple-text rounded-full">
                  {philosopher.era}
                </span>
              )}
            </div>
            {philosopher.tagline && (
              <p className="text-xs text-text-muted mt-1 line-clamp-1">{philosopher.tagline}</p>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={handleChatClick}
          disabled={loading}
          aria-label={hasExisting ? `继续与${philosopher.name}对话` : `与${philosopher.name}对话`}
          className="shrink-0 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-fab hover:bg-primary-dark disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : hasExisting ? (
            <ContinueIcon />
          ) : (
            <ChatIcon />
          )}
        </button>
      </div>

      {dialogConvs && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-8 shadow-card">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="font-semibold text-center mb-5">你已有与 {philosopher.name} 的对话</h3>
            <button
              onClick={() => goToChat(dialogConvs[0].id)}
              className="w-full py-3.5 mb-2 bg-primary/10 text-primary rounded-2xl text-sm font-medium"
            >
              继续上次对话
            </button>
            <button
              onClick={() => goToChat()}
              className="w-full py-3.5 mb-2 btn-primary !rounded-2xl"
            >
              发起新对话
            </button>
            <button onClick={() => setDialogConvs(null)} className="w-full py-2.5 text-text-muted text-sm">
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}
