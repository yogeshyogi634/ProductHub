"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { matchesDateFilter } from "@/lib/data";
import { UpdateCard } from "../features/UpdateCard";

const STATUS_TABS = ["WIP", "Backlog", "Completed"];

export function ProductUpdates() {
    const { activeProduct, activeStatusFilter, setActiveStatusFilter, updates, openEditModal, dateRangeStart, dateRangeEnd } = useStore();
    const [searchQuery, setSearchQuery] = useState("");

    const productUpdates = updates[activeProduct] ?? [];
    const filtered = productUpdates
        .filter((u) => u.status === activeStatusFilter)
        .filter((u) => matchesDateFilter(u.postedDate, dateRangeStart, dateRangeEnd))
        .filter((u) => u.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="bg-background-card-primary border-r border-stroke-default-primary-v2 flex flex-col h-full overflow-hidden w-[420px] shrink-0">
            {/* Header */}
            <div className="flex flex-col gap-md px-lg-2 pt-lg pb-md shrink-0 border-b border-stroke-default-primary-v2">
                <div className="flex justify-between items-center">
                    <h2 className="text-text-default-primary font-medium text-sm">
                        {activeProduct} | Product updates
                    </h2>

                    {/* Filter Tabs */}
                    <div className="flex gap-sm items-center">
                        {STATUS_TABS.map((tab) => {
                            const isActive = tab === activeStatusFilter;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveStatusFilter(tab)}
                                    className={[
                                        "px-md py-xs rounded-max text-sm font-medium border transition-colors",
                                        isActive
                                            ? "bg-background-card-secondary border-stroke-default-inverse text-text-default-primary"
                                            : "bg-background-card-primary border-stroke-default-primary text-text-default-secondary hover:bg-background-card-secondary",
                                    ].join(" ")}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-default-secondary" />
                    <input
                        type="text"
                        placeholder="Search updates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-sm border border-stroke-default-primary bg-background-app text-sm text-text-default-primary placeholder:text-text-default-secondary outline-none focus:border-stroke-default-inverse transition-colors"
                    />
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex flex-col gap-md px-lg-2 pb-lg overflow-y-auto flex-1">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-xl gap-sm">
                        <span className="text-2xl">📭</span>
                        <p className="text-sm text-text-default-secondary text-center">
                            No {activeStatusFilter} updates for {activeProduct} yet.
                        </p>
                    </div>
                ) : (
                    (() => {
                        const today = new Date();
                        const todayStr = today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

                        const groups = [];
                        let currentDateKey = null;

                        filtered.forEach((update) => {
                            const parts = update.postedDate.split(" | ");
                            const dateKey = parts.length > 1 ? parts[1].trim() : update.postedDate;

                            if (dateKey !== currentDateKey) {
                                currentDateKey = dateKey;
                                groups.push({ dateKey, items: [] });
                            }
                            groups[groups.length - 1].items.push(update);
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

                                    {group.items.map((update) => (
                                        <UpdateCard
                                            key={update.id}
                                            id={update.id}
                                            title={update.title}
                                            description={update.description}
                                            status={update.status}
                                            statusLog={update.statusLog}
                                            postedDate={update.postedDate}
                                            authorEmail={update.authorEmail}
                                            department={update.department}
                                            departmentType={update.departmentType}
                                            onEdit={() => openEditModal(update)}
                                        />
                                    ))}
                                </div>
                            );
                        });
                    })()
                )}
            </div>
        </div>
    );
}
