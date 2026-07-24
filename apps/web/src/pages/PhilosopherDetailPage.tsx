import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Philosopher, Conversation } from "@talk-to-god/shared";
import { fetchPhilosopher, fetchConversations, createConversation } from "../lib/api";

export default function PhilosopherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [philosopher, setPhilosopher] = useState<Philosopher | null>(null);
  const [existingConvs, setExistingConvs] = useState<Conversation[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchPhilosopher(id).then(setPhilosopher).catch(console.error);
    fetchConversations()
      .then((convs) => setExistingConvs(convs.filter((c) => c.philosopherId === id)))
      .catch(console.error);
  }, [id]);

  const startChat = async (continueExisting?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      if (continueExisting) {
        navigate(`/chat/${continueExisting}`);
        return;
      }
      const conv = await createConversation(id);
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClick = () => {
    if (existingConvs.length > 0) {
      setShowDialog(true);
    } else {
      startChat();
    }
  };

  if (!philosopher) {
    return <p className="text-center text-text-muted py-12">加载中…</p>;
  }

  const lifeSpan =
    philosopher.birthYear && philosopher.deathYear
      ? `${philosopher.birthYear < 0 ? `前${Math.abs(philosopher.birthYear)}` : philosopher.birthYear} — ${
          philosopher.deathYear < 0 ? `前${Math.abs(philosopher.deathYear)}` : philosopher.deathYear
        }`
      : null;

  return (
    <div className="pb-24">
      <div className="bg-primary text-white px-4 pt-8 pb-10">
        <button onClick={() => navigate(-1)} className="text-white/70 text-sm mb-4">
          ← 返回
        </button>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl font-serif">{philosopher.name.slice(0, 1)}</span>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">{philosopher.name}</h1>
            {philosopher.nameEn && <p className="text-white/70 text-sm">{philosopher.nameEn}</p>}
            {lifeSpan && <p className="text-white/60 text-xs mt-1">{lifeSpan}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {philosopher.school.map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 bg-white/15 rounded">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-gray-100">
          {philosopher.tagline && (
            <p className="font-serif text-primary italic text-center mb-4">「{philosopher.tagline}」</p>
          )}
          {philosopher.bio && (
            <p className="text-sm leading-relaxed text-text-muted">{philosopher.bio}</p>
          )}
        </div>

        {philosopher.keyConcepts.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-medium mb-2">核心概念</h2>
            <div className="flex flex-wrap gap-2">
              {philosopher.keyConcepts.map((c) => (
                <span key={c} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {philosopher.representativeWorks.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-medium mb-2">代表著作</h2>
            <ul className="space-y-2">
              {philosopher.representativeWorks.map((w) => (
                <li key={w.title} className="text-sm bg-surface rounded-lg p-3 border border-gray-100">
                  <span className="font-medium">{w.title}</span>
                  {w.year && <span className="text-text-muted ml-2">({w.year < 0 ? `前${Math.abs(w.year)}` : w.year})</span>}
                  {w.intro && <p className="text-xs text-text-muted mt-1">{w.intro}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-4">
        <button
          onClick={handleStartClick}
          disabled={loading}
          className="w-full py-3.5 bg-primary text-white rounded-xl font-medium shadow-lg disabled:opacity-50"
        >
          {loading ? "准备中…" : `开始与 ${philosopher.name} 对话`}
        </button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-surface rounded-t-2xl w-full max-w-lg p-4 pb-8">
            <h3 className="font-medium mb-4">你已有与 {philosopher.name} 的对话</h3>
            <button
              onClick={() => startChat(existingConvs[0].id)}
              className="w-full py-3 mb-2 bg-primary/10 text-primary rounded-lg text-sm"
            >
              继续上次对话
            </button>
            <button
              onClick={() => startChat()}
              className="w-full py-3 mb-2 bg-primary text-white rounded-lg text-sm"
            >
              发起新对话
            </button>
            <button onClick={() => setShowDialog(false)} className="w-full py-2 text-text-muted text-sm">
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
