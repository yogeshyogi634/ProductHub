"use client";

import { useState, useMemo } from "react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateStr(str) {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function isSameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(day, start, end) {
    if (!start || !end) return false;
    return day >= start && day <= end;
}

export function DateRangeCalendar({ startDate, endDate, onRangeChange, onClear }) {
    // Which month we're currently viewing
    const today = new Date();
    const initial = startDate ? parseDateStr(startDate) : today;
    const [viewYear, setViewYear] = useState(initial.getFullYear());
    const [viewMonth, setViewMonth] = useState(initial.getMonth());

    // Selection state: null = nothing selected, "start" = picking end
    const [selecting, setSelecting] = useState(null);
    const [hoverDate, setHoverDate] = useState(null);

    const startObj = parseDateStr(startDate);
    const endObj = parseDateStr(endDate);

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const cells = [];

        // Previous month trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            cells.push({ day: daysInPrevMonth - i, inMonth: false, month: viewMonth - 1, year: viewYear });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, inMonth: true, month: viewMonth, year: viewYear });
        }

        // Next month leading days
        const remaining = 42 - cells.length;
        for (let d = 1; d <= remaining; d++) {
            cells.push({ day: d, inMonth: false, month: viewMonth + 1, year: viewYear });
        }

        return cells;
    }, [viewYear, viewMonth]);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
        else setViewMonth((m) => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
        else setViewMonth((m) => m + 1);
    };

    const handleDayClick = (cell) => {
        const dateStr = toDateStr(cell.year, cell.month, cell.day);
        const dateObj = new Date(cell.year, cell.month, cell.day);

        if (!selecting) {
            // First click = set start, wait for end
            onRangeChange(dateStr, null);
            setSelecting("end");
        } else {
            // Second click = set end
            if (startObj && dateObj < startObj) {
                // Clicked before start — swap
                onRangeChange(dateStr, startDate);
            } else {
                onRangeChange(startDate, dateStr);
            }
            setSelecting(null);
            setHoverDate(null);
        }
    };

    const handleMouseEnter = (cell) => {
        if (selecting === "end") {
            setHoverDate(new Date(cell.year, cell.month, cell.day));
        }
    };

    const getDayClasses = (cell) => {
        const dateObj = new Date(cell.year, cell.month, cell.day);
        const isToday = isSameDay(dateObj, today);
        const isStart = isSameDay(dateObj, startObj);
        const isEnd = isSameDay(dateObj, endObj);
        const isSelected = isStart || isEnd;

        // Determine range highlight
        let inRange = false;
        if (startObj && endObj) {
            inRange = isInRange(dateObj, startObj, endObj);
        } else if (startObj && selecting === "end" && hoverDate) {
            const rangeStart = hoverDate < startObj ? hoverDate : startObj;
            const rangeEnd = hoverDate < startObj ? startObj : hoverDate;
            inRange = isInRange(dateObj, rangeStart, rangeEnd);
        }

        const base = "w-9 h-9 text-sm rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer relative";

        if (!cell.inMonth) {
            return `${base} text-text-default-secondary/30 hover:bg-background-card-secondary`;
        }

        if (isSelected) {
            return `${base} bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-xl shadow-orange-500/30`;
        }

        if (inRange && !isSelected) {
            return `${base} bg-orange-100 text-orange-800 font-medium`;
        }

        if (isToday) {
            return `${base} border-2 border-orange-500 text-orange-600 font-semibold hover:bg-orange-50`;
        }

        return `${base} text-text-default-primary hover:bg-background-card-secondary`;
    };

    const formatRangeLabel = () => {
        if (!startDate && !endDate) return null;
        const fmt = (str) => {
            const d = parseDateStr(str);
            return d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "";
        };
        if (startDate && endDate) return `${fmt(startDate)} — ${fmt(endDate)}`;
        if (startDate) return `${fmt(startDate)} — ...`;
        return null;
    };

    return (
        <div className="flex flex-col gap-sm">
            {/* Month / Year nav */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-card-secondary transition-colors text-text-default-primary"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <span className="text-sm font-semibold text-text-default-primary">
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                    type="button"
                    onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background-card-secondary transition-colors text-text-default-primary"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0">
                {DAYS.map((d) => (
                    <div key={d} className="w-9 h-8 flex items-center justify-center text-xs font-medium text-text-default-secondary">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0">
                {calendarDays.map((cell, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => handleDayClick(cell)}
                        onMouseEnter={() => handleMouseEnter(cell)}
                        className={getDayClasses(cell)}
                    >
                        {cell.day}
                    </button>
                ))}
            </div>

            {/* Selected range display */}
            {(startDate || endDate) && (
                <div className="flex items-center justify-between pt-sm border-t border-stroke-default-primary-v2">
                    <span className="text-xs font-medium text-text-default-primary">
                        {formatRangeLabel()}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            onClear();
                            setSelecting(null);
                            setHoverDate(null);
                        }}
                        className="text-xs text-background-actions-error hover:underline"
                    >
                        ✕ Clear
                    </button>
                </div>
            )}

            {/* Hint text */}
            {selecting === "end" && (
                <p className="text-xs text-text-default-secondary text-center animate-pulse">
                    Click another date to set end of range
                </p>
            )}
        </div>
    );
}
