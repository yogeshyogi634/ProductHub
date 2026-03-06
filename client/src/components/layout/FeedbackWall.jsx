import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { matchesDateFilter } from "@/lib/data";
import { FeedbackCard } from "../features/FeedbackCard";
import { SkeletonFeedback } from "../ui/Skeleton";

export function FeedbackWall() {
  const { activeProduct, feedback, addFeedback, dateRangeStart, dateRangeEnd, isLoading } =
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
    <div className="bg-gradient-to-br from-background-app/90 via-background-card-primary/70 to-background-app/95 backdrop-blur-2xl flex flex-col h-full overflow-hidden relative w-1/2 shadow-xl">
      {/* Enhanced glow effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Modern Header */}
      <div className="px-lg py-sm shrink-0 relative z-10">
        <div className="text-center">
          <h2 className="text-text-default-primary font-black text-lg bg-gradient-to-r from-blue-600 via-text-default-primary to-orange-600 bg-clip-text leading-tight">
            {activeProduct} Feedback Wall
          </h2>
        </div>
      </div>

      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent shrink-0" />

      {/* Enhanced Cards Area */}
      <div
        ref={listRef}
        className="flex flex-col gap-sm px-lg overflow-y-auto flex-1 pb-[120px] relative z-10 scroll-smooth"
      >
        {isLoading ? (
          <div className="space-y-sm">
            {Array.from({ length: 3 }, (_, i) => (
              <SkeletonFeedback key={i} />
            ))}
          </div>
        ) : productFeedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-2xl gap-lg">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200/80 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 transform -rotate-2">
                <span className="text-6xl transform rotate-2">💬</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">+</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-black text-text-default-primary bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text">
                Start the Conversation
              </h3>
              <p className="text-lg text-text-default-secondary/90 leading-relaxed font-medium">
                No feedback for{" "}
                <span className="text-blue-600 font-bold">{activeProduct}</span>{" "}
                yet.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-2xl border border-blue-200/50 shadow-lg">
                <p className="text-base font-bold text-blue-800 mb-2">
                  ✨ Be the first to share your thoughts!
                </p>
                <p className="text-sm text-blue-700/80 leading-relaxed">
                  Your feedback helps shape the future of {activeProduct}. Share
                  ideas, report issues, or ask questions.
                </p>
              </div>
            </div>
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
                <div key={group.dateKey} className="flex flex-col gap-sm">
                  {/* Enhanced date separator */}
                  <div className="flex items-center gap-sm py-xs">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-blue-500/40 to-blue-300/20" />
                    <div className="bg-gradient-to-r from-background-card-secondary to-background-card-primary/80 backdrop-blur-xl px-3 py-1 rounded-lg border border-blue-500/20 shadow-sm shadow-blue-500/10 relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <span className="text-xs font-bold text-text-default-primary bg-gradient-to-r from-blue-600 to-text-default-primary bg-clip-text whitespace-nowrap tracking-wide relative z-10">
                        {label}
                      </span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300/20 via-blue-500/40 to-transparent" />
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

      {/* Enhanced Composer — pinned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background-app/95 to-background-app/80 backdrop-blur-2xl border-t border-blue-500/30 p-lg flex gap-md items-center relative z-20 shadow-xl">
        {/* Enhanced composer glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-white/5 to-transparent pointer-events-none" />

        {/* Enhanced input field */}
        <div className="flex-1 relative group">
          <div className="absolute -top-[12px] left-4 bg-gradient-to-r from-background-app/95 to-background-card-primary/90 backdrop-blur-xl px-3 py-1 z-10 rounded-lg border border-blue-500/30 shadow-md">
            <span className="text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1">
              💬 <span>Share Your Thoughts</span>
            </span>
          </div>
          <div className="border-2 border-blue-500/40 rounded-2xl h-[56px] flex items-center px-4 w-full gap-3 bg-gradient-to-r from-background-app/90 to-background-card-primary/70 backdrop-blur-xl group-hover:border-blue-500/60 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your feedback, ideas, or questions..."
              className="flex-1 bg-transparent outline-none text-text-default-primary placeholder:text-text-default-secondary/70 text-sm font-medium relative z-10"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="shrink-0 disabled:opacity-40 p-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-orange-500/20 hover:from-blue-500 hover:to-orange-500 disabled:hover:from-blue-500/20 disabled:hover:to-orange-500/20 transition-all duration-300 group/btn border border-blue-400/40 hover:border-blue-500 cursor-pointer disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 relative z-10"
            >
              <SendHorizontal className="w-5 h-5 text-blue-600 group-hover/btn:text-white transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12 transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
