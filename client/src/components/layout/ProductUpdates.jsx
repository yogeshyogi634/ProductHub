"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { matchesDateFilter } from "@/lib/data";
import { UpdateCard } from "../features/UpdateCard";
import { SkeletonUpdateList } from "../ui/Skeleton";

const STATUS_TABS = ["All", "WIP", "IN_PROGRESS", "DONE"];

export function ProductUpdates() {
  const {
    activeProduct,
    activeStatusFilter,
    setActiveStatusFilter,
    updates,
    openEditModal,
    progressUpdateStatus,
    currentUser,
    dateRangeStart,
    dateRangeEnd,
    isLoading,
  } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const productUpdates = updates[activeProduct] ?? [];
  const filtered = productUpdates
    .filter(
      (u) => activeStatusFilter === "All" || u.status === activeStatusFilter,
    )
    .filter((u) =>
      matchesDateFilter(u.postedDate, dateRangeStart, dateRangeEnd),
    )
    .filter((u) => u.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-gradient-to-br from-background-app/95 via-background-card-primary/80 to-background-app/90 backdrop-blur-2xl border-r border-stroke-default-primary-v2/30 flex flex-col h-full overflow-hidden w-1/2 shrink-0 relative shadow-xl">
      {/* Enhanced glow effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Modern Header */}
      <div className="flex flex-col gap-lg px-xl pt-xl pb-lg shrink-0 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-xs">
            <h2 className="text-text-default-primary font-black text-xl bg-gradient-to-r from-text-default-primary via-orange-600 to-orange-500 bg-clip-text leading-tight">
              {activeProduct}
            </h2>
            <p className="text-text-default-secondary/70 text-sm font-medium">
              Product Updates & Progress
            </p>
          </div>

          {/* Modern Filter Tabs */}
          <div className="flex gap-2 items-center p-1 bg-background-card-secondary/50 backdrop-blur-sm rounded-2xl border border-stroke-default-primary/20">
            {STATUS_TABS.map((tab) => {
              const isActive = tab === activeStatusFilter;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveStatusFilter(tab)}
                  className={[
                    "px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-500 relative overflow-hidden group cursor-pointer transform",
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400 text-white shadow-xl shadow-orange-500/30 scale-105"
                      : "bg-transparent border-transparent text-text-default-secondary hover:bg-background-card-primary/60 hover:text-orange-600 hover:scale-102",
                  ].join(" ")}
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <span className="relative z-10 tracking-wide">{tab}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-default-secondary transition-all duration-300 group-hover:text-orange-500 group-focus-within:text-orange-500 group-focus-within:scale-110">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search updates, descriptions, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-stroke-default-primary/40 bg-gradient-to-r from-background-app/90 to-background-card-primary/50 backdrop-blur-xl text-sm text-text-default-primary placeholder:text-text-default-secondary/70 outline-none focus:border-orange-500/60 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/15 font-medium"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>

      {/* Modern border separator */}
      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent shrink-0" />

      {/* Enhanced Content Area */}
      <div className="flex flex-col gap-lg px-xl pb-xl overflow-y-auto flex-1 relative z-10 scroll-smooth">
        {isLoading ? (
          <SkeletonUpdateList count={4} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-2xl gap-lg">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200/80 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-orange-500/20 transform rotate-3">
                <span className="text-5xl transform -rotate-3">📭</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">0</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-text-default-primary bg-gradient-to-r from-text-default-primary to-orange-600 bg-clip-text">
                No Updates Found
              </h3>
            </div>
          </div>
        ) : (
          (() => {
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

            // Always group by date, regardless of status filter
            return (() => {
              // Group by date for both "All" and specific status filters
              const groups = [];
              let currentDateKey = null;

              // Sort filtered updates by date (newest first) then group by date
              const sortedFiltered = filtered.sort(
                (a, b) =>
                  new Date(b.postedDate.split(" | ")[1] || b.postedDate) -
                  new Date(a.postedDate.split(" | ")[1] || a.postedDate),
              );

              sortedFiltered.forEach((update) => {
                const parts = update.postedDate.split(" | ");
                const dateKey =
                  parts.length > 1 ? parts[1].trim() : update.postedDate;

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
                  <div key={group.dateKey} className="flex flex-col gap-lg">
                    {/* Enhanced Date separator */}
                    <div className="flex items-center gap-md py-sm">
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-orange-500/30 to-orange-300/20" />
                      <div className="bg-gradient-to-r from-background-card-secondary to-background-card-primary/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-orange-500/20 shadow-md shadow-orange-500/10 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        <span className="text-xs font-bold text-text-default-primary bg-gradient-to-r from-text-default-primary to-orange-600 bg-clip-text whitespace-nowrap tracking-wide relative z-10">
                          {label}
                        </span>
                      </div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-300/20 via-orange-500/30 to-transparent" />
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
                        onStatusProgress={progressUpdateStatus}
                        canEdit={update.authorEmail === currentUser.email}
                        canProgressStatus={true}
                        currentUserEmail={currentUser.email}
                      />
                    ))}
                  </div>
                );
              });
            })();
          })()
        )}
      </div>
    </div>
  );
}
