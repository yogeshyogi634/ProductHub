"use client";

import { cn } from "@/lib/utils";
import { StatusChips } from "../ui/StatusChip";

function getChipState(status) {
  if (status === "WIP") return "Warning";
  if (status === "DONE") return "Success";
  return "Neutral";
}

// Define the status progression flow
const STATUS_PROGRESSION = {
  WIP: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "DONE", // End state
};

export function UpdateCard({
  id,
  title,
  description,
  status,
  statusLog = [],
  postedDate,
  authorEmail,
  department,
  departmentType = "Product",
  onEdit,
  onStatusProgress,
  canEdit = false,
  canProgressStatus = false,
  currentUserEmail,
  className,
}) {
  // Extract both time and date parts
  const dateParts = postedDate.split(" | ");
  const timeOnly = dateParts[0];
  const dateOnly = dateParts[1] || "";
  const fullDateTime = dateOnly ? `${timeOnly} | ${dateOnly}` : timeOnly;

  // Check if user is the author
  const isAuthor = currentUserEmail === authorEmail;

  // Get next status in progression
  const nextStatus = STATUS_PROGRESSION[status];
  const canProgress =
    canProgressStatus && isAuthor && nextStatus && nextStatus !== status;

  // Handle status progression
  const handleStatusProgress = () => {
    if (canProgress && onStatusProgress) {
      onStatusProgress(id, nextStatus);
    }
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-background-app/95 to-background-card-primary/80 border border-stroke-default-primary-v2/40 rounded-xl p-lg flex flex-col gap-md w-full backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.01] hover:border-orange-500/30 relative overflow-hidden group",
        className,
      )}
    >
      {/* Card glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      {/* Enhanced Header: Department + Author */}
      <div className="flex items-center justify-between gap-sm relative z-10">
        <div className="bg-gradient-to-r from-background-card-secondary to-background-card-primary/80 border border-stroke-default-primary/50 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-md backdrop-blur-sm">
          <span className="text-xs font-bold text-text-default-primary">
            {departmentType === "Product" ? "📦" : "🏷️"} {department}
          </span>
        </div>
        <div className="bg-background-card-secondary/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-stroke-default-primary/30">
          <span className="text-xs text-text-default-secondary font-medium">
            {authorEmail}
          </span>
        </div>
      </div>

      {/* Enhanced Title + Status + Edit */}
      <div className="flex items-start gap-sm w-full relative z-10">
        <h3 className="flex-1 font-bold text-base text-text-default-primary bg-gradient-to-r from-text-default-primary to-orange-600 bg-clip-text leading-tight">
          {title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <StatusChips status={status} state={getChipState(status)} />
          {isAuthor && (
            <div className="flex items-center gap-1.5">
              {/* Enhanced Status progression button */}
              {canProgress && (
                <button
                  type="button"
                  onClick={handleStatusProgress}
                  title={`Progress to ${nextStatus}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200 border border-green-300 hover:border-green-400 transition-all duration-300 text-xs font-bold cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 bg-green-50/50 text-green-700 hover:text-green-800"
                >
                  →
                </button>
              )}

              {/* Enhanced edit button (for authors) */}
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  title="Edit this update"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gradient-to-br hover:from-orange-100 hover:to-orange-200 border border-orange-300 hover:border-orange-400 transition-all duration-300 opacity-80 hover:opacity-100 shadow-md hover:shadow-lg group/edit cursor-pointer transform hover:scale-105 active:scale-95 bg-orange-50/50"
                >
                  <img
                    src="/assets/edit-icon.svg"
                    alt="Edit"
                    className="w-4 h-4 dark-invert transition-transform duration-300 group-hover/edit:scale-110 group-hover/edit:rotate-6"
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-500/40 to-transparent relative z-10" />

      {/* Enhanced Description */}
      <div
        className="text-sm text-text-default-secondary/90 rich-editor-content relative z-10 leading-relaxed font-medium bg-gradient-to-r from-background-card-secondary/30 to-transparent p-3 rounded-lg border border-stroke-default-primary/20"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Enhanced Footer: Status Log + Time */}
      <div className="flex flex-col gap-lg mt-auto relative z-10">
        {statusLog.length > 0 && (
          <>
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            <div className="bg-gradient-to-r from-background-card-secondary/40 to-transparent p-4 rounded-xl border border-stroke-default-primary/20">
              <h4 className="text-xs font-bold text-text-default-primary/60 uppercase tracking-wider mb-3">Progress History</h4>
              <div className="flex flex-col gap-3">
                {statusLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-sm p-2 bg-background-app/50 rounded-lg border border-stroke-default-primary/10"
                  >
                    <div className="flex items-center gap-2">
                      <StatusChips
                        status={entry.from}
                        state={getChipState(entry.from)}
                      />
                      <span className="text-orange-500 text-sm font-bold">
                        →
                      </span>
                      <StatusChips
                        status={entry.to}
                        state={getChipState(entry.to)}
                      />
                    </div>
                    <span className="text-xs text-text-default-secondary/70 whitespace-nowrap font-medium bg-background-card-secondary/60 px-2 py-1 rounded-lg">
                      {entry.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Enhanced Time and Date */}
        <div className="w-full flex justify-end">
          <div className="bg-gradient-to-r from-background-card-secondary/60 to-background-card-primary/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-stroke-default-primary/30 shadow-md">
            <span className="text-xs text-text-default-secondary font-medium">
              {fullDateTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
