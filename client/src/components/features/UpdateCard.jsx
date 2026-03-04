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
        "bg-background-app border border-stroke-default-primary-v2 rounded-sm p-lg flex flex-col gap-md w-full",
        className,
      )}
    >
      {/* Header: Department + Author */}
      <div className="flex items-center justify-between gap-sm">
        <div className="bg-background-card-secondary border border-stroke-default-primary rounded-2xs px-2 py-1 flex items-center gap-1 h-6">
          <span className="text-xs font-medium text-text-default-primary">
            {departmentType === "Product" ? "📦" : "🏷️"} {department}
          </span>
        </div>
        <span className="text-xs text-text-default-secondary">
          {authorEmail}
        </span>
      </div>

      {/* Title + Status + Edit */}
      <div className="flex items-start gap-sm w-full">
        <h3 className="flex-1 font-bold text-base text-text-default-primary">
          {title}
        </h3>
        <div className="flex items-center gap-sm shrink-0">
          <StatusChips status={status} state={getChipState(status)} />
          {isAuthor && (
            <div className="flex items-center gap-1">
              {/* Status progression button */}
              {canProgress && (
                <button
                  type="button"
                  onClick={handleStatusProgress}
                  title={`Progress to ${nextStatus}`}
                  className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-background-actions-success-subtle border border-stroke-actions-success transition-colors text-xs font-medium"
                >
                  →
                </button>
              )}

              {/* Full edit button (for authors) */}
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  title="Edit this update"
                  className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-background-card-secondary transition-colors opacity-40 hover:opacity-100"
                >
                  <img
                    src="/assets/edit-icon.svg"
                    alt="Edit"
                    className="w-4 h-4 dark-invert"
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-stroke-default-primary-v2" />

      {/* Description — renders rich text HTML */}
      <div
        className="text-sm text-text-default-secondary rich-editor-content"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Footer: Status Log + Time */}
      <div className="flex flex-col gap-sm mt-auto">
        {statusLog.length > 0 && (
          <>
            <div className="h-px w-full bg-stroke-default-primary-v2" />
            <div className="flex flex-col gap-xs">
              {statusLog.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-sm"
                >
                  <div className="flex items-center gap-xs">
                    <StatusChips
                      status={entry.from}
                      state={getChipState(entry.from)}
                    />
                    <span className="text-text-default-secondary text-xs">
                      →
                    </span>
                    <StatusChips
                      status={entry.to}
                      state={getChipState(entry.to)}
                    />
                  </div>
                  <span className="text-xs text-text-default-secondary whitespace-nowrap">
                    {entry.date}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Time and Date */}
        <div className="w-full flex justify-end">
          <span className="text-sm text-text-default-secondary">
            {fullDateTime}
          </span>
        </div>
      </div>
    </div>
  );
}
