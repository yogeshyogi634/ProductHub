import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useStore } from "@/lib/store";

function Avatar({ size = 16 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src="/assets/profilex-logo.png"
        alt="User"
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function ReplyItem({ reply, feedbackId, onDelete }) {
  const { currentUser } = useStore();
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!reply.createdAt) return 0;
    const elapsed = Math.floor((Date.now() - reply.createdAt) / 1000);
    const remaining = Math.max(0, 60 - elapsed);
    return remaining;
  });

  // Countdown timer for delete window
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft > 0]);

  // Check if current user is the author of this reply AND within 60 seconds
  const isReplyAuthor = currentUser.email === reply.authorEmail;
  const canShowDeleteTimer = isReplyAuthor && secondsLeft > 0;

  return (
    <div className="flex flex-col gap-2xs pl-sm border-l-2 border-blue-500/30 bg-gradient-to-r from-blue-50/40 to-orange-50/20 rounded-r-xl py-2 backdrop-blur-sm shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-default-secondary">
          {reply.authorEmail}
        </span>
        {canShowDeleteTimer && (
          <button
            className="px-2 py-1 rounded-lg border border-red-300 text-xs text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 font-semibold shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => onDelete(feedbackId, reply.id)}
          >
            Delete ({secondsLeft}s)
          </button>
        )}
      </div>
      <p className="text-sm text-text-default-primary leading-relaxed">{reply.content}</p>
      <span className="text-xs text-text-default-secondary/70 font-medium">
        {reply.postedDate}
      </span>
    </div>
  );
}

export function FeedbackCard({
  feedbackId,
  authorEmail,
  content,
  createdAt,
  postedDate,
  likes = 0,
  likedBy = [],
  comments = [],
  isOwner = false,
  canDelete = false,
  canReply = false,
  className,
}) {
  const { toggleLike, addReply, deleteReply, deleteFeedback, currentUser } =
    useStore();
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!createdAt) return 0;
    const elapsed = Math.floor((Date.now() - createdAt) / 1000);
    const remaining = Math.max(0, 60 - elapsed);
    return remaining;
  });

  // Calculate if user can delete based on frontend timer (for display)
  // Use the isOwner prop from backend, fallback to email comparison
  const userIsOwner = isOwner || currentUser.email === authorEmail;
  const canShowDeleteTimer = userIsOwner && secondsLeft > 0;

  // Countdown timer for delete window
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft > 0]);

  // Use backend permissions instead of local calculation
  // const isOwner = currentUser.email === authorEmail;
  // const canDelete = isOwner && secondsLeft > 0;

  const hasLiked = likedBy.includes(currentUser.email);

  const handleReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    addReply(feedbackId, trimmed);
    setReplyText("");
  };

  const handleReplyKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-background-app/95 to-background-card-primary/80 border border-stroke-default-primary-v2/40 rounded-xl p-sm flex flex-col gap-xs w-full backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.005] hover:border-blue-500/30 relative overflow-hidden group",
        className,
      )}
    >
      {/* Card glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      {/* Enhanced Header */}
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="bg-background-card-secondary/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-stroke-default-primary/30">
          <span className="text-xs text-text-default-secondary font-medium">
            {authorEmail}
          </span>
        </div>
        {canShowDeleteTimer && (
          <button
            onClick={() => deleteFeedback(feedbackId)}
            className="px-2.5 py-1 rounded-lg border border-red-400 text-xs text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 bg-red-50/50"
            disabled={!canDelete && !canShowDeleteTimer}
          >
            {canShowDeleteTimer
              ? `Delete (${secondsLeft}s)`
              : canDelete
                ? "Delete"
                : "Cannot Delete"}
          </button>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="bg-gradient-to-r from-background-card-secondary/30 to-transparent p-2 rounded-lg border border-stroke-default-primary/20 relative z-10">
        <p className="text-sm text-text-default-secondary/90 w-full whitespace-pre-wrap leading-snug font-medium">
          {content}
        </p>
      </div>

      {/* Enhanced Actions + Date */}
      <div className="flex flex-wrap gap-2 items-center justify-between w-full relative z-10">
        <div className="flex gap-3 items-center">
          {/* Enhanced Like Button */}
          <button
            onClick={() => toggleLike(feedbackId)}
            className="flex gap-2 items-center group cursor-pointer transition-all duration-300 hover:scale-105"
            aria-label={hasLiked ? "Unlike" : "Like"}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300 shadow-sm hover:shadow-md transform group-hover:scale-105",
                hasLiked
                  ? "bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-green-500/20"
                  : "bg-gradient-to-br from-background-card-secondary to-background-card-primary border-stroke-default-primary-v2/60 group-hover:border-green-400/50 group-hover:bg-green-50/50",
              )}
            >
              <img
                src="/assets/like-icon.svg"
                alt="Like"
                width={12}
                height={12}
                className="w-3 h-3 dark-invert transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-text-default-primary">
                {String(likes).padStart(2, "0")}
              </span>
              <span className="text-xs text-text-default-secondary/70 font-medium">
                {hasLiked ? "Liked" : "Like"}
              </span>
            </div>
          </button>

          {/* Enhanced Comments toggle */}
          <button
            onClick={() => setRepliesOpen((v) => !v)}
            className="flex gap-2 items-center group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-background-card-secondary to-background-card-primary border border-stroke-default-primary-v2/60 group-hover:border-blue-400/50 group-hover:bg-blue-50/50 transition-all duration-300 shadow-sm hover:shadow-md transform group-hover:scale-105">
              <MessageSquare className="w-3 h-3 text-icon-default-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-text-default-primary">
                {String(comments.length).padStart(2, "0")}
              </span>
              <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                {repliesOpen ? "Hide" : "Reply"}
                {repliesOpen ? (
                  <ChevronUp className="w-2 h-2" />
                ) : (
                  <ChevronDown className="w-2 h-2" />
                )}
              </span>
            </div>
          </button>
        </div>

        {/* Enhanced Time */}
        <div className="bg-gradient-to-r from-background-card-secondary/80 to-background-card-primary/60 backdrop-blur-xl px-2 py-1 rounded-lg border border-stroke-default-primary/30 shadow-sm">
          <span className="text-xs font-bold text-text-default-secondary">
            {postedDate.split(" | ")[0]}
          </span>
        </div>
      </div>

      {/* Expandable replies */}
      {repliesOpen && (
        <div className="flex flex-col gap-xs pt-xs border-t border-gradient-to-r from-transparent via-stroke-default-primary-v2/60 to-transparent relative z-10">
          {comments.length > 0 ? (
            <div className="flex flex-col">
              {comments.map((r, index) => (
                <div key={r.id}>
                  <ReplyItem
                    reply={r}
                    feedbackId={feedbackId}
                    onDelete={deleteReply}
                  />
                  {index < comments.length - 1 && (
                    <div className="h-px bg-gradient-to-r from-transparent via-stroke-default-primary-v2/40 to-transparent my-sm" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-text-default-secondary/80 font-medium bg-background-card-secondary/30 px-4 py-2 rounded-lg border border-stroke-default-primary/20 inline-block">
                💬 No replies yet. Be the first!
              </p>
            </div>
          )}

          {/* Enhanced Reply composer */}
          {(canReply || userIsOwner) && (
            <div className="flex gap-xs items-center group">
              <div className="flex-1 border border-blue-500/40 rounded-lg flex items-center px-3 h-8 gap-2 bg-gradient-to-r from-background-app/90 to-background-card-primary/70 backdrop-blur-xl group-hover:border-blue-500/60 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/15 transition-all duration-300 shadow-sm group-hover:shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleReplyKeyDown}
                  placeholder="Write a thoughtful reply..."
                  className="flex-1 bg-transparent outline-none text-sm text-text-default-primary placeholder:text-text-default-secondary/70 font-medium relative z-10"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="shrink-0 disabled:opacity-40 p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-orange-500/20 hover:from-blue-500 hover:to-orange-500 disabled:hover:from-blue-500/20 disabled:hover:to-orange-500/20 transition-all duration-300 group/send cursor-pointer disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 relative z-10"
                >
                  <Send className="w-3 h-3 text-blue-600 group-hover/send:text-white transition-all duration-300 group-hover/send:scale-110 group-hover/send:rotate-12 transform" />
                </button>
              </div>
            </div>
          )}

          {/* Message for users who cannot reply */}
          {!canReply && !userIsOwner && (
            <div className="text-center py-2">
              <div className="text-sm text-text-default-secondary/70 font-medium bg-background-card-secondary/20 px-4 py-2 rounded-lg border border-stroke-default-primary/20 inline-block">
                🔒 You don't have access to reply
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
