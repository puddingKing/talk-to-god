import { Link } from "react-router-dom";
import type { Philosopher } from "@talk-to-god/shared";

interface Props {
  philosopher: Philosopher;
}

export default function PhilosopherCard({ philosopher }: Props) {
  const initials = philosopher.name.slice(0, 1);

  return (
    <Link
      to={`/philosopher/${philosopher.philosopherId}`}
      className="block bg-surface rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {philosopher.avatarUrl ? (
            <img src={philosopher.avatarUrl} alt={philosopher.name} className="w-full h-full rounded-full object-cover" />
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
      </div>
    </Link>
  );
}
