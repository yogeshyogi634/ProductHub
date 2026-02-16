"use client";

import { cn } from "../../lib/utils";
import { StatusChips } from "../ui/StatusChip";

function getChipState(status) {
    if (status === "WIP") return "Warning";
    if (status === "Completed") return "Success";
    return "Neutral";
}

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
    className,
}) {
    const timeOnly = postedDate.split(" | ")[0];

    return (
        <div
            className={cn(
                "bg-background-app border border-stroke-default-primary-v2 rounded-sm p-lg flex flex-col gap-md w-full",
                className
            )}
        >
            {/* Header: Department + Author */}
            <div className="flex items-center justify-between gap-sm">
                <div className="bg-background-card-secondary border border-stroke-default-primary rounded-2xs px-2 py-1 flex items-center gap-1 h-6">
                    <span className="text-xs font-medium text-text-default-primary">
                        {departmentType === "Product" ? "📦" : "🏷️"}{" "}
                        {department}
                    </span>
                </div>
                <span className="text-xs text-text-default-secondary">{authorEmail}</span>
            </div>

            {/* Title + Status + Edit */}
            <div className="flex items-start gap-sm w-full">
                <h3 className="flex-1 font-bold text-base text-text-default-primary">
                    {title}
                </h3>
                <div className="flex items-center gap-sm shrink-0">
                    <StatusChips
                        status={status}
                        state={getChipState(status)}
                    />
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
                                        <span className="text-text-default-secondary text-xs">→</span>
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

                {/* Time only */}
                <div className="w-full flex justify-end">
                    <span className="text-sm text-text-default-secondary">
                        {timeOnly}
                    </span>
                </div>
            </div>
        </div>
    );
}
