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
    <div className="flex flex-col gap-2xs pl-lg border-l-2 border-stroke-default-primary-v2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-default-secondary">
          {reply.authorEmail}
        </span>
        {canShowDeleteTimer && (
          <button
            className="px-2 py-1 rounded-sm border border-background-actions-error text-xs text-background-actions-error hover:bg-background-actions-error hover:text-white transition-colors font-medium"
            onClick={() => onDelete(feedbackId, reply.id)}
          >
            Delete ({secondsLeft}s)
          </button>
        )}
      </div>
      <p className="text-xs text-text-default-secondary">{reply.content}</p>
      <span className="text-xs text-text-default-secondary opacity-60">
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
        "bg-background-app border border-stroke-default-primary-v2 rounded-sm p-lg flex flex-col gap-md w-full",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-text-default-secondary">
          {authorEmail}
        </span>
        {canShowDeleteTimer && (
          <button
            onClick={() => deleteFeedback(feedbackId)}
            className="px-2 py-1 rounded-sm border border-background-actions-error text-xs text-background-actions-error hover:bg-background-actions-error hover:text-white transition-colors font-medium"
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

      {/* Content */}
      <p className="text-sm text-text-default-secondary w-full whitespace-pre-wrap">
        {content}
      </p>

      {/* Actions + Date */}
      <div className="flex flex-wrap gap-2 items-center justify-between w-full">
        <div className="flex gap-lg items-center">
          {/* Like */}
          <button
            onClick={() => toggleLike(feedbackId)}
            className="flex gap-2 items-center group"
            aria-label={hasLiked ? "Unlike" : "Like"}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
                hasLiked
                  ? "bg-background-actions-success-subtle border-stroke-actions-success"
                  : "bg-background-card-secondary border-stroke-default-primary-v2 group-hover:bg-background-card-primary",
              )}
            >
              <img
                src="/assets/like-icon.svg"
                alt="Like"
                width={16}
                height={16}
                className="w-4 h-4 dark-invert"
              />
            </div>
            <span className="text-sm font-medium text-text-default-primary">
              {String(likes).padStart(2, "0")}
            </span>
          </button>

          {/* Comments toggle */}
          <button
            onClick={() => setRepliesOpen((v) => !v)}
            className="flex gap-2 items-center group"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-background-card-secondary border border-stroke-default-primary-v2 group-hover:bg-background-card-primary transition-colors">
              <MessageSquare className="w-4 h-4 text-icon-default-primary" />
            </div>
            <span className="text-sm font-medium text-text-default-primary">
              {String(comments.length).padStart(2, "0")}
            </span>
            <span className="text-sm font-medium text-text-default-primary underline decoration-solid flex items-center gap-1">
              reply
              {repliesOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </span>
          </button>
        </div>

        {/* Time */}
        <span className="text-sm text-text-default-secondary">
          {postedDate.split(" | ")[0]}
        </span>
      </div>

      {/* Expandable replies */}
      {repliesOpen && (
        <div className="flex flex-col gap-md pt-sm border-t border-stroke-default-primary-v2">
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
                    <div className="h-px bg-stroke-default-primary-v2 my-sm" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-default-secondary opacity-60">
              No replies yet. Be the first!
            </p>
          )}

          {/* Reply composer - show if user can reply OR is the author */}
          {(canReply || userIsOwner) && (
            <div className="flex gap-sm items-center">
              <div className="flex-1 border border-stroke-default-primary rounded-sm flex items-center px-sm h-8 gap-sm">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleReplyKeyDown}
                  placeholder="Write a reply…"
                  className="flex-1 bg-transparent outline-none text-xs text-text-default-primary placeholder:text-text-default-secondary"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="shrink-0 disabled:opacity-30 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5 text-icon-default-primary" />
                </button>
              </div>
            </div>
          )}

          {/* Message for users who cannot reply */}
          {!canReply && !userIsOwner && (
            <div className="text-xs text-text-default-secondary opacity-60 italic">
              You don't have access to reply
            </div>
          )}
        </div>
      )}
    </div>
  );
}
