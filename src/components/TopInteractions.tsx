import { MessageCircleHeart } from "lucide-react";
import type { InteractedUser } from "@/types/stats";

interface TopInteractionsProps {
  users: InteractedUser[];
}

const TopInteractions = ({ users }: TopInteractionsProps) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-background-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
          <MessageCircleHeart className="h-5 w-5 text-white/80" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-semibold text-text-main">
            Interacciones principales
          </h3>
          <p className="text-sm text-text-muted">
            Usuarios con más comentarios tuyos
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {users.slice(0, 10).map((user) => (
          <details
            key={user.username}
            className="group overflow-hidden rounded-xl border border-border bg-background transition-all open:bg-background-card"
          >
            <summary className="flex cursor-pointer items-center justify-between p-4 outline-none hover:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 overflow-hidden items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary border border-border shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="uppercase">{user.username.slice(0, 2)}</span>
                  )}
                </div>
                <span className="font-semibold text-text-main">
                  {user.username}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-400">
                  {user.interactionCount} comentarios
                </span>
                <span className="text-text-muted transition-transform group-open:rotate-180">
                  ▼
                </span>
              </div>
            </summary>
            <div className="border-t border-border p-4 space-y-3 bg-background/50">
              {user.comments.map((comment, index) => (
                <div
                  key={`${user.username}-comment-${index}`}
                  className="flex gap-3 rounded-lg border border-border/50 bg-background p-3 shadow-sm transition-colors hover:bg-white/5"
                >
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-background-card border border-border">
                    {comment.posterUrl ? (
                      <img
                        src={comment.posterUrl}
                        alt={comment.movie || "Poster"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] text-text-muted">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold text-primary">
                        {comment.movie ? comment.movie : "Carta / Lista"}
                      </span>
                      <span className="whitespace-nowrap text-[10px] font-medium text-text-muted">
                        {comment.date}
                      </span>
                    </div>
                    <p className="break-words text-sm italic text-text-main">
                      "{comment.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default TopInteractions;
