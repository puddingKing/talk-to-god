import { useEffect, useState } from "react";
import type { Conversation, Philosopher } from "@talk-to-god/shared";
import { fetchConversations, fetchPhilosophers } from "../lib/api";
import PhilosopherCard from "../components/PhilosopherCard";

const LOGO_URL =
  "https://lhcos-bc64d-1325353783.cos.ap-beijing.myqcloud.com/talk-to-god/logo_min.png";

const ERAS = ["全部", "古希腊", "春秋", "战国", "近代", "现代"];
const REGIONS = ["全部", "西方", "东方"];

export default function GalleryPage() {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [era, setEra] = useState("全部");
  const [region, setRegion] = useState("全部");

  useEffect(() => {
    setLoading(true);
    fetchPhilosophers({
      q: search || undefined,
      era: era === "全部" ? undefined : era,
      region: region === "全部" ? undefined : region,
    })
      .then(setPhilosophers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, era, region]);

  useEffect(() => {
    fetchConversations().then(setConversations).catch(console.error);
  }, []);

  const conversationByPhilosopher = new Map(
    conversations.map((c) => [c.philosopherId, c])
  );

  return (
    <div className="px-4 pt-5 pb-4">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="与哲对话" className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
          <div>
            <h1 className="text-lg font-semibold text-accent">与哲对话</h1>
            <p className="text-xs text-text-muted">选择一位哲学家，开启思辨之旅</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/70 border border-white/80 flex items-center justify-center shadow-sm">
          <span className="text-accent-gold font-serif font-bold text-sm">哲</span>
        </div>
      </header>

      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="搜索哲学家、流派或概念…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input pl-10"
        />
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={region === r ? "pill-active" : "pill-inactive"}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {ERAS.map((e) => (
          <button key={e} onClick={() => setEra(e)} className={era === e ? "pill-active" : "pill-inactive"}>
            {e}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">哲学家图鉴</h2>
        {!loading && <span className="text-[11px] text-text-light">{philosophers.length} 位</span>}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-text-muted">加载中…</p>
        </div>
      ) : philosophers.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-text-muted">未找到匹配的哲学家</p>
        </div>
      ) : (
        <div className="space-y-3">
          {philosophers.map((p) => (
            <PhilosopherCard
              key={p.philosopherId}
              philosopher={p}
              existingConversation={conversationByPhilosopher.get(p.philosopherId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
