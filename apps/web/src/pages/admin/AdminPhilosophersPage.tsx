import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PhilosopherAdmin } from "@talk-to-god/shared";
import AdminLayout from "../../components/AdminLayout";
import { getAdminKey } from "../../lib/admin";
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

  return (
    <AdminLayout
      title="哲学家管理"
      subtitle={`共 ${list.length} 位哲学家`}
      action={
        <Link to="/admin/philosophers/new" className="admin-btn-primary">
          新增哲学家
        </Link>
      }
    >
      {loading ? (
        <p className="text-center text-text-muted py-12">加载中…</p>
      ) : list.length === 0 ? (
        <p className="text-center text-text-muted py-12">暂无哲学家</p>
      ) : (
        <>
          <div className="admin-card-list">
            {list.map((p) => (
              <PhilosopherRowMobile key={p.id} philosopher={p} onDelete={handleDelete} />
            ))}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>ID</th>
                  <th>流派</th>
                  <th>时代</th>
                  <th>地域</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td className="font-mono text-xs text-text-muted">{p.id}</td>
                    <td className="text-text-muted">{p.school.join("、")}</td>
                    <td className="text-text-muted">{p.era || "—"}</td>
                    <td className="text-text-muted">{p.region || "—"}</td>
                    <td className="text-right whitespace-nowrap">
                      <Link
                        to={`/admin/philosophers/${p.id}`}
                        className="text-primary hover:underline mr-4"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-500 hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function PhilosopherRowMobile({
  philosopher: p,
  onDelete,
}: {
  philosopher: PhilosopherAdmin;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-surface rounded-xl border border-gray-100 p-4">
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{p.name}</div>
        <div className="text-xs text-text-muted truncate">
          {p.id} · {p.school.join("、")}
        </div>
      </div>
      <Link to={`/admin/philosophers/${p.id}`} className="admin-btn-ghost !text-primary !border-primary/20">
        编辑
      </Link>
      <button onClick={() => onDelete(p.id, p.name)} className="admin-btn-ghost !text-red-500 !border-red-100">
        删除
      </button>
    </div>
  );
}
