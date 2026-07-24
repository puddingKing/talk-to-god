import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Philosopher, Conversation } from "@talk-to-god/shared";
import { fetchPhilosopher, fetchConversations, createConversation } from "../lib/api";

type Tab = "intro" | "works";

export default function PhilosopherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [philosopher, setPhilosopher] = useState<Philosopher | null>(null);
  const [existingConvs, setExistingConvs] = useState<Conversation[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("intro");

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
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-text-muted">加载中…</p>
      </div>
    );
  }

  const lifeSpan =
    philosopher.birthYear && philosopher.deathYear
      ? `${philosopher.birthYear < 0 ? `前${Math.abs(philosopher.birthYear)}` : philosopher.birthYear} — ${
          philosopher.deathYear < 0 ? `前${Math.abs(philosopher.deathYear)}` : philosopher.deathYear
        }`
      : null;

  return (
    <div className="pb-28 md:pb-8">
      <div className="bg-hero-gradient px-0 md:rounded-2xl pt-6 pb-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-4 bottom-0 w-24 h-24 rounded-full bg-white/10 blur-xl" />

        <button
          onClick={() => navigate(-1)}
          className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm mb-5"
        >
          ←
        </button>

        <div className="relative flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/30">
            {philosopher.avatarUrl ? (
              <img src={philosopher.avatarUrl} alt={philosopher.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-3xl font-serif text-white">{philosopher.name.slice(0, 1)}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{philosopher.name}</h1>
            {philosopher.nameEn && <p className="text-white/75 text-sm">{philosopher.nameEn}</p>}
            {lifeSpan && <p className="text-white/60 text-xs mt-1">{lifeSpan}</p>}
          </div>
        </div>

        <div className="relative flex flex-wrap gap-1.5 mt-4">
          {philosopher.school.map((s) => (
            <span key={s} className="text-[11px] px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="px-0 -mt-5 relative">
        <div className="flex gap-1 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm mb-4">
          <button
            onClick={() => setTab("intro")}
            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-colors ${
              tab === "intro" ? "bg-primary text-white shadow-sm" : "text-text-muted"
            }`}
          >
            简介
          </button>
          <button
            onClick={() => setTab("works")}
            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-colors ${
              tab === "works" ? "bg-primary text-white shadow-sm" : "text-text-muted"
            }`}
          >
            著作
          </button>
        </div>

        {tab === "intro" && (
          <>
            <div className="glass-card p-4 mb-4">
              {philosopher.tagline && (
                <p className="font-serif text-primary italic text-center mb-4 text-sm">「{philosopher.tagline}」</p>
              )}
              {philosopher.bio && (
                <p className="text-sm leading-relaxed text-text-muted">{philosopher.bio}</p>
              )}
            </div>

            {philosopher.keyConcepts.length > 0 && (
              <div className="glass-card p-4 mb-4">
                <h2 className="section-title mb-3">核心概念</h2>
                <div className="flex flex-wrap gap-2">
                  {philosopher.keyConcepts.map((c) => (
                    <span key={c} className="text-xs px-3 py-1.5 bg-tag-blue text-tag-blue-text rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "works" && philosopher.representativeWorks.length > 0 && (
          <div className="space-y-2">
            {philosopher.representativeWorks.map((w) => (
              <div key={w.title} className="glass-card p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-200 flex items-center justify-center shrink-0">
                  <span className="text-primary text-sm">📖</span>
                </div>
                <div>
                  <span className="font-medium text-sm text-text">{w.title}</span>
                  {w.year && (
                    <span className="text-text-light ml-2 text-xs">
                      ({w.year < 0 ? `前${Math.abs(w.year)}` : w.year})
                    </span>
                  )}
                  {w.intro && <p className="text-xs text-text-muted mt-1 leading-relaxed">{w.intro}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "works" && philosopher.representativeWorks.length === 0 && (
          <div className="glass-card p-8 text-center text-text-muted text-sm">暂无著作信息</div>
        )}
      </div>

      <div className="fixed-action-bar">
        <div className="fixed-action-inner">
        <button
          onClick={handleStartClick}
          disabled={loading}
          className="w-full py-3.5 bg-primary text-white rounded-2xl font-medium shadow-fab disabled:opacity-50"
        >
          {loading ? "准备中…" : `开始与 ${philosopher.name} 对话`}
        </button>
        </div>
      </div>

      {showDialog && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="font-semibold text-center mb-5">你已有与 {philosopher.name} 的对话</h3>
            <button
              onClick={() => startChat(existingConvs[0].id)}
              className="w-full py-3.5 mb-2 bg-primary/10 text-primary rounded-2xl text-sm font-medium"
            >
              继续上次对话
            </button>
            <button onClick={() => startChat()} className="w-full py-3.5 mb-2 btn-primary !rounded-2xl">
              发起新对话
            </button>
            <button onClick={() => setShowDialog(false)} className="w-full py-2.5 text-text-muted text-sm">
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
