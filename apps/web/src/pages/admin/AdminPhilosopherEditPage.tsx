import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PhilosopherAdmin } from "@talk-to-god/shared";
import AdminLayout from "../../components/AdminLayout";
import { getAdminKey } from "../../lib/admin";
import {
  createAdminPhilosopher,
  fetchAdminPhilosopher,
  updateAdminPhilosopher,
} from "../../lib/admin-api";

const EMPTY: PhilosopherAdmin = {
  id: "",
  name: "",
  nameEn: "",
  avatarUrl: "",
  school: [],
  keyConcepts: [],
  representativeWorks: [],
  personaPrompt: "",
  tagline: "",
  bio: "",
  openingLine: "",
  era: "",
  region: "",
};

function toFormData(p: PhilosopherAdmin) {
  return {
    ...p,
    schoolText: p.school.join("，"),
    keyConceptsText: p.keyConcepts.join("，"),
    worksJson: JSON.stringify(p.representativeWorks, null, 2),
  };
}

type FormData = ReturnType<typeof toFormData>;

export default function AdminPhilosopherEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(toFormData(EMPTY));
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAdminKey()) {
      navigate("/admin");
      return;
    }
    if (isNew || !id) return;

    fetchAdminPhilosopher(id)
      .then((p) => setForm(toFormData(p)))
      .catch(() => navigate("/admin"))
      .finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  const update = (patch: Partial<FormData>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    let works = [];
    try {
      works = form.worksJson.trim() ? JSON.parse(form.worksJson) : [];
    } catch {
      setError("代表著作 JSON 格式不正确");
      setSaving(false);
      return;
    }

    const payload: PhilosopherAdmin = {
      id: form.id.trim(),
      name: form.name.trim(),
      nameEn: form.nameEn?.trim() || undefined,
      avatarUrl: form.avatarUrl?.trim() || undefined,
      birthYear: form.birthYear,
      deathYear: form.deathYear,
      school: form.schoolText.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      era: form.era?.trim() || undefined,
      region: form.region?.trim() || undefined,
      tagline: form.tagline?.trim() || undefined,
      bio: form.bio?.trim() || undefined,
      keyConcepts: form.keyConceptsText.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      representativeWorks: works,
      personaPrompt: form.personaPrompt.trim(),
      openingLine: form.openingLine?.trim() || undefined,
    };

    try {
      if (isNew) {
        await createAdminPhilosopher(payload);
      } else {
        await updateAdminPhilosopher(id!, payload);
      }
      navigate("/admin/philosophers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isNew ? "新增哲学家" : "编辑哲学家"} backTo="/admin/philosophers">
        <p className="text-center text-text-muted py-12">加载中…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "新增哲学家" : "编辑哲学家"}
      subtitle={isNew ? "创建新的哲学家条目" : form.name || form.id}
      backTo="/admin/philosophers"
    >
      <form onSubmit={handleSubmit} className="admin-form-grid">
        <section className="admin-form-section">
          <h3 className="text-sm font-medium text-accent mb-1">基本信息</h3>

          <Field label="ID（slug）" hint="英文小写，如 nietzsche，创建后不可改">
            <input
              value={form.id}
              onChange={(e) => update({ id: e.target.value })}
              disabled={!isNew}
              className="field-input disabled:bg-gray-50"
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="中文姓名">
              <input value={form.name} onChange={(e) => update({ name: e.target.value })} className="field-input" required />
            </Field>
            <Field label="英文姓名">
              <input value={form.nameEn} onChange={(e) => update({ nameEn: e.target.value })} className="field-input" />
            </Field>
          </div>

          <Field label="头像 URL">
            <input value={form.avatarUrl} onChange={(e) => update({ avatarUrl: e.target.value })} className="field-input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="出生年">
              <input
                type="number"
                value={form.birthYear ?? ""}
                onChange={(e) => update({ birthYear: e.target.value ? Number(e.target.value) : undefined })}
                className="field-input"
              />
            </Field>
            <Field label="卒年">
              <input
                type="number"
                value={form.deathYear ?? ""}
                onChange={(e) => update({ deathYear: e.target.value ? Number(e.target.value) : undefined })}
                className="field-input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="时代">
              <input value={form.era} onChange={(e) => update({ era: e.target.value })} className="field-input" placeholder="近代" />
            </Field>
            <Field label="地域">
              <input value={form.region} onChange={(e) => update({ region: e.target.value })} className="field-input" placeholder="西方" />
            </Field>
          </div>

          <Field label="流派标签" hint="逗号分隔">
            <input value={form.schoolText} onChange={(e) => update({ schoolText: e.target.value })} className="field-input" required />
          </Field>

          <Field label="一句话标签">
            <input value={form.tagline} onChange={(e) => update({ tagline: e.target.value })} className="field-input" />
          </Field>

          <Field label="简介">
            <textarea value={form.bio} onChange={(e) => update({ bio: e.target.value })} className="field-input min-h-24" />
          </Field>
        </section>

        <section className="admin-form-section">
          <h3 className="text-sm font-medium text-accent mb-1">对话与内容</h3>

          <Field label="核心概念" hint="逗号分隔">
            <input value={form.keyConceptsText} onChange={(e) => update({ keyConceptsText: e.target.value })} className="field-input" required />
          </Field>

          <Field label="代表著作" hint='JSON 数组，如 [{"title":"书名","year":1883,"intro":"简介"}]'>
            <textarea value={form.worksJson} onChange={(e) => update({ worksJson: e.target.value })} className="field-input min-h-28 font-mono text-xs" />
          </Field>

          <Field label="开场白">
            <input value={form.openingLine} onChange={(e) => update({ openingLine: e.target.value })} className="field-input" />
          </Field>

          <Field label="系统提示词（人设 Prompt）" hint="不对用户展示，用于 AI 对话">
            <textarea
              value={form.personaPrompt}
              onChange={(e) => update({ personaPrompt: e.target.value })}
              className="field-input min-h-48 lg:min-h-64"
              required
            />
          </Field>
        </section>

        <div className="admin-form-full space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/philosophers")}
              className="admin-btn-ghost py-2.5 sm:px-6 order-2 sm:order-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50 order-1 sm:order-2 sm:min-w-[120px]"
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">{label}</label>
      {hint && <p className="text-[10px] text-text-muted/70 mb-1">{hint}</p>}
      {children}
    </div>
  );
}
