import { useEffect, useState } from "react";
import type { Philosopher } from "@talk-to-god/shared";
import { fetchPhilosophers } from "../lib/api";
import PhilosopherCard from "../components/PhilosopherCard";

const LOGO_URL =
  "https://lhcos-bc64d-1325353783.cos.ap-beijing.myqcloud.com/talk-to-god/logo_min.png";

const ERAS = ["全部", "古希腊", "春秋", "战国", "近代", "现代"];
const REGIONS = ["全部", "西方", "东方"];

export default function GalleryPage() {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
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

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-6">
        <div className="flex items-center gap-2.5">
          <img
            src={LOGO_URL}
            alt="与哲对话"
            className="w-9 h-9 rounded-lg object-cover shrink-0"
          />
          <h1 className="font-serif text-2xl font-bold text-accent">与哲对话</h1>
        </div>
        <p className="text-sm text-text-muted mt-1">选择一位哲学家，开启思辨之旅</p>
      </header>

      <input
        type="search"
        placeholder="搜索哲学家、流派或概念…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs ${
              region === r ? "bg-primary text-white" : "bg-gray-100 text-text-muted"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {ERAS.map((e) => (
          <button
            key={e}
            onClick={() => setEra(e)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs ${
              era === e ? "bg-accent text-white" : "bg-gray-100 text-text-muted"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-text-muted py-12">加载中…</p>
      ) : philosophers.length === 0 ? (
        <p className="text-center text-text-muted py-12">未找到匹配的哲学家</p>
      ) : (
        <div className="space-y-3">
          {philosophers.map((p) => (
            <PhilosopherCard key={p.philosopherId} philosopher={p} />
          ))}
        </div>
      )}
    </div>
  );
}
