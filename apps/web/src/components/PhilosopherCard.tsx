import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Philosopher, Conversation } from "@talk-to-god/shared";
import { createConversation, fetchConversations } from "../lib/api";

interface Props {
  philosopher: Philosopher;
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

export default function PhilosopherCard({ philosopher }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dialogConvs, setDialogConvs] = useState<Conversation[] | null>(null);
  const initials = philosopher.name.slice(0, 1);

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
      <div className="flex items-center bg-surface rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <Link
          to={`/philosopher/${philosopher.philosopherId}`}
          className="flex flex-1 gap-3 min-w-0 p-4"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {philosopher.avatarUrl ? (
              <img
                src={philosopher.avatarUrl}
                alt={philosopher.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-serif text-primary">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-medium truncate">{philosopher.name}</h3>
            {philosopher.nameEn && (
              <p className="text-xs text-text-muted truncate">{philosopher.nameEn}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {philosopher.school.slice(0, 2).map((s) => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 bg-accent/15 text-accent rounded">
                  {s}
                </span>
              ))}
            </div>
            {philosopher.tagline && (
              <p className="text-sm text-text-muted mt-1.5 line-clamp-1">{philosopher.tagline}</p>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={handleChatClick}
          disabled={loading}
          aria-label={`与${philosopher.name}对话`}
          className="shrink-0 mr-3 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-light disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ChatIcon />
          )}
        </button>
      </div>

      {dialogConvs && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-surface rounded-t-2xl w-full max-w-lg p-4 pb-8">
            <h3 className="font-medium mb-4">你已有与 {philosopher.name} 的对话</h3>
            <button
              onClick={() => goToChat(dialogConvs[0].id)}
              className="w-full py-3 mb-2 bg-primary/10 text-primary rounded-lg text-sm"
            >
              继续上次对话
            </button>
            <button
              onClick={() => goToChat()}
              className="w-full py-3 mb-2 bg-primary text-white rounded-lg text-sm"
            >
              发起新对话
            </button>
            <button
              onClick={() => setDialogConvs(null)}
              className="w-full py-2 text-text-muted text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}
