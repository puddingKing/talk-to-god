import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PhilosopherAdmin } from "@talk-to-god/shared";
import { clearAdminKey, getAdminKey } from "../../lib/admin";
import { deleteAdminPhilosopher, fetchAdminPhilosophers } from "../../lib/admin-api";

export default function AdminPhilosophersPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<PhilosopherAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!getAdminKey()) {
      navigate("/admin");
      return;
    }
    setLoading(true);
    fetchAdminPhilosophers()
      .then(setList)
      .catch((err) => {
        if (err.message.includes("无效") || err.message.includes("401")) navigate("/admin");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [navigate]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除「${name}」？此操作不可恢复。`)) return;
    await deleteAdminPhilosopher(id);
    load();
  };

  const handleLogout = () => {
    clearAdminKey();
    navigate("/admin");
  };

  return (
    <div className="min-h-dvh bg-bg max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-accent">哲学家管理</h1>
          <p className="text-xs text-text-muted mt-1">共 {list.length} 位哲学家</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/philosophers/new"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            新增
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-text-muted">
            退出
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-text-muted py-12">加载中…</p>
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 bg-surface rounded-xl border border-gray-100 p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-text-muted truncate">
                  {p.id} · {p.school.join("、")}
                </div>
              </div>
              <Link
                to={`/admin/philosophers/${p.id}`}
                className="px-3 py-1.5 text-sm text-primary border border-primary/20 rounded-lg"
              >
                编辑
              </Link>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                className="px-3 py-1.5 text-sm text-red-500 border border-red-100 rounded-lg"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
