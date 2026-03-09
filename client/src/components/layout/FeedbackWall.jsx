import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { matchesDateFilter } from "@/lib/data";
import { FeedbackCard } from "../features/FeedbackCard";

export function FeedbackWall() {
  const { activeProduct, feedback, addFeedback, dateRangeStart, dateRangeEnd } =
    useStore();

  const [message, setMessage] = useState("");
  const listRef = useRef(null);

  const productFeedback = (feedback[activeProduct] ?? []).filter((fb) =>
    matchesDateFilter(fb.postedDate, dateRangeStart, dateRangeEnd),
  );

  // Scroll to top when new feedback is posted or product changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [activeProduct, productFeedback.length]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    addFeedback(trimmed);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-background-app flex flex-col h-full overflow-hidden relative w-1/2">
      {/* Header */}
      <div className="px-lg-2 py-lg shrink-0">
        <h2 className="text-text-default-primary font-semibold text-base text-center">
          {activeProduct} Feedback Wall
        </h2>
      </div>

      <div className="w-full h-px bg-stroke-default-primary-v2 shrink-0" />

      {/* Cards */}
      <div
        ref={listRef}
        className="flex flex-col gap-md p-lg overflow-y-auto flex-1 pb-[88px]"
      >
        {productFeedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-xl gap-sm">
            <span className="text-2xl">💬</span>
            <p className="text-sm text-text-default-secondary text-center">
              No feedback for {activeProduct} yet.
              <br />
              Be the first to share!
            </p>
          </div>
        ) : (
          (() => {
            // Group feedback by date part of postedDate ("hh:mm AM/PM | DD Mon YYYY")
            const today = new Date();
            const todayStr = today.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            // Build ordered groups
            const groups = [];
            let currentDateKey = null;

            productFeedback.forEach((fb) => {
              const parts = fb.postedDate.split(" | ");
              const dateKey =
                parts.length > 1 ? parts[1].trim() : fb.postedDate;

              if (dateKey !== currentDateKey) {
                currentDateKey = dateKey;
                groups.push({ dateKey, items: [] });
              }
              groups[groups.length - 1].items.push(fb);
            });

            return groups.map((group) => {
              let label;
              if (group.dateKey === todayStr) {
                label = "Today";
              } else if (group.dateKey === yesterdayStr) {
                label = "Yesterday";
              } else {
                label = group.dateKey;
              }

              return (
                <div key={group.dateKey} className="flex flex-col gap-md">
                  {/* WhatsApp-style date separator */}
                  <div className="flex items-center gap-md py-sm">
                    <div className="flex-1 h-px bg-stroke-default-primary-v2" />
                    <span className="text-xs font-medium text-text-default-secondary bg-background-card-secondary px-md py-1 rounded-max whitespace-nowrap">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-stroke-default-primary-v2" />
                  </div>

                  {group.items.map((fb) => (
                    <FeedbackCard
                      key={fb.id}
                      feedbackId={fb.id}
                      authorEmail={fb.authorEmail}
                      content={fb.content}
                      createdAt={fb.createdAt}
                      postedDate={fb.postedDate}
                      likes={fb.likes}
                      likedBy={fb.likedBy}
                      comments={fb.comments}
                      isOwner={fb.isOwner}
                      canDelete={fb.canDelete}
                      canReply={fb.canReply}
                    />
                  ))}
                </div>
              );
            });
          })()
        )}
      </div>

      {/* Composer — pinned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background-app border-t border-stroke-default-primary-v2 p-lg flex gap-lg-2 items-center">
        {/* Input field */}
        <div className="flex-1 relative">
          <div className="absolute -top-[11px] left-3 bg-background-app px-1 z-10">
            <span className="text-xs text-text-default-secondary">
              Type message
            </span>
          </div>
          <div className="border border-stroke-default-primary rounded-sm h-[50px] flex items-center px-md w-full gap-sm">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share feedback or ask a question…"
              className="flex-1 bg-transparent outline-none text-text-default-primary placeholder:text-text-default-secondary text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="shrink-0 disabled:opacity-30 transition-opacity"
            >
              <SendHorizontal className="w-5 h-5 text-icon-default-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
