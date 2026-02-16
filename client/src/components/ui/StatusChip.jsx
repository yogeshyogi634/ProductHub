import { cn } from "../../lib/utils";

export function StatusChips({ className, status, state = "Success" }) {
    const isWarning = state === "Warning";
    const isSuccess = state === "Success";
    const isNeutral = state === "Neutral";

    return (
        <div
            className={cn(
                "border border-solid flex gap-[4px] h-[24px] items-center overflow-clip px-[8px] py-[4px] relative rounded-2xs w-fit",
                isWarning && "bg-background-actions-warning-subtle border-stroke-actions-warning text-text-actions-warning",
                isSuccess && "bg-background-actions-success-subtle border-stroke-actions-success text-text-actions-success",
                isNeutral && "bg-background-card-secondary border-stroke-default-primary text-text-default-primary",
                className
            )}
        >
            <span className="font-medium text-[12px] leading-none">
                {status}
            </span>
        </div>
    );
}
