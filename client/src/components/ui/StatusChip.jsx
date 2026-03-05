import { cn } from "@/lib/utils";

export function StatusChips({ className, status, state = "Success" }) {
    const isWarning = state === "Warning";
    const isSuccess = state === "Success";
    const isNeutral = state === "Neutral";

    return (
        <div
            className={cn(
                "border border-solid flex gap-[4px] h-[28px] items-center overflow-clip px-[12px] py-[6px] relative rounded-xl w-fit shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105",
                isWarning && "bg-yellow-100/80 border-yellow-300 text-yellow-800 hover:bg-yellow-200/80 hover:shadow-yellow-500/20",
                isSuccess && "bg-green-100/80 border-green-300 text-green-800 hover:bg-green-200/80 hover:shadow-green-500/20",
                isNeutral && "bg-blue-100/80 border-blue-300 text-blue-800 hover:bg-blue-200/80 hover:shadow-blue-500/20",
                className
            )}
        >
            <span className="font-semibold text-[12px] leading-none tracking-wide uppercase">
                {status}
            </span>
        </div>
    );
}
