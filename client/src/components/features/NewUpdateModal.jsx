"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { RichTextEditor } from "../ui/RichTextEditor";

const STATUS_OPTIONS = ["WIP", "IN_PROGRESS", "DONE"];
const DEPT_TYPES = [
  "Product",
  "Engineering",
  "Design",
  "Sales",
  "Finance",
  "Operations",
];

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function NewUpdateModal() {
  const {
    isNewUpdateModalOpen,
    editingUpdate,
    closeModal,
    addUpdate,
    updateUpdate,
    deleteUpdate,
    activeProduct,
  } = useStore();

  const isEditing = !!editingUpdate;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("WIP");
  const [departmentType, setDepartmentType] = useState("Product");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when entering edit mode; reset when opening as new
  useEffect(() => {
    if (!isNewUpdateModalOpen) return;
    if (editingUpdate) {
      setTitle(editingUpdate.title);
      setDescription(editingUpdate.description);
      setStatus(editingUpdate.status);
      setDepartmentType(editingUpdate.departmentType ?? "Product");
    } else {
      setTitle("");
      setDescription("");
      setStatus("WIP");
      setDepartmentType("Product");
    }
    setErrors({});
  }, [isNewUpdateModalOpen, editingUpdate]);

  // Close on Escape
  useEffect(() => {
    if (!isNewUpdateModalOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isNewUpdateModalOpen, closeModal]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!stripHtml(description).trim())
      e.description = "Description is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: title.trim(),
      description,
      status,
      department: departmentType,
      departmentType,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateUpdate(editingUpdate.id, payload);
      } else {
        await addUpdate(payload);
      }
      closeModal();
    } catch (error) {
      console.error('Failed to submit update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isNewUpdateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-300" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

      {/* Centered modal */}
      <div className="absolute inset-0 flex items-center justify-center p-lg">
        <div
          className="relative bg-background-app/95 backdrop-blur-xl border border-stroke-default-primary-v2/50 rounded-2xl w-[520px] max-w-[90vw] flex flex-col shadow-2xl shadow-black/10 animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-2xl" />
          {/* Header */}
          <div className="flex items-center justify-between px-lg py-md border-b border-stroke-default-primary-v2/50 relative z-10">
            <div className="flex flex-col gap-2xs">
              <h2 className="text-text-default-primary font-bold text-lg bg-gradient-to-r from-text-default-primary to-orange-600 bg-clip-text">
                {isEditing ? "Edit Update" : "New Update"}
              </h2>
              <span className="text-sm text-text-default-secondary font-medium">
                {isEditing ? "Editing update for " : "Posting to "}
                <span className="text-orange-600 font-semibold">
                  {activeProduct}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-stroke-default-primary-v2/60 hover:bg-red-100/60 hover:border-red-300 transition-all duration-300 group backdrop-blur-sm relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <X className="w-5 h-5 text-icon-default-primary group-hover:text-red-600 transition-all duration-300 group-hover:scale-110 relative z-10" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-md p-lg relative z-10">
            {/* Title */}
            <div className="flex flex-col gap-2xs group">
              <label className="text-sm font-semibold text-text-default-primary">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title)
                    setErrors((p) => ({ ...p, title: undefined }));
                }}
                placeholder="e.g. Payment Integration on Perkle"
                className={cn(
                  "h-12 px-md border rounded-xl bg-background-app/60 backdrop-blur-sm text-sm text-text-default-primary placeholder:text-text-default-secondary/70 outline-none transition-all duration-300 shadow-sm hover:shadow-md group-hover:shadow-orange-500/10",
                  errors.title
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-stroke-default-primary/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-orange-500/30",
                )}
              />
              {errors.title && (
                <span className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Description — Rich Text Editor */}
            <div className="flex flex-col gap-2xs">
              <label className="text-sm font-semibold text-text-default-primary">
                Description{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className={cn(
                "border rounded-xl shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden",
                errors.description
                  ? "border-red-300 hover:border-red-400"
                  : "border-stroke-default-primary/60 hover:border-orange-500/30 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20"
              )}>
                <RichTextEditor
                  value={description}
                  onChange={(html) => {
                    setDescription(html);
                    if (errors.description)
                      setErrors((p) => ({ ...p, description: undefined }));
                  }}
                  placeholder="Describe the update…"
                  error={!!errors.description}
                />
              </div>
              {errors.description && (
                <span className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                  {errors.description}
                </span>
              )}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2xs">
              <label className="text-sm font-semibold text-text-default-primary">
                Status
              </label>
              <div className="flex gap-sm">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "flex-1 h-12 border rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden group cursor-pointer",
                      status === s
                        ? s === "WIP"
                          ? "bg-yellow-100 border-yellow-300 text-yellow-800 shadow-yellow-500/20"
                          : s === "DONE"
                            ? "bg-green-100 border-green-300 text-green-800 shadow-green-500/20"
                            : "bg-blue-100 border-blue-300 text-blue-800 shadow-blue-500/20"
                        : "bg-background-app/60 backdrop-blur-sm border-stroke-default-primary-v2/60 text-text-default-secondary hover:bg-background-card-primary/80 hover:border-orange-500/30",
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-2xs group">
              <label className="text-sm font-semibold text-text-default-primary">
                Department
              </label>
              <select
                value={departmentType}
                onChange={(e) => setDepartmentType(e.target.value)}
                className="h-12 pl-sm pr-8 border border-stroke-default-primary/60 rounded-xl bg-background-app/60 backdrop-blur-sm text-sm text-text-default-primary outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 appearance-none shadow-sm hover:shadow-md group-hover:shadow-orange-500/10 hover:border-orange-500/30 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23f97316%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_16px_center] bg-no-repeat"
              >
                {DEPT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Footer */}
            <div className="flex gap-sm justify-between pt-md border-t border-stroke-default-primary-v2/50">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteUpdate(editingUpdate.id);
                      closeModal();
                    }}
                    className="px-lg py-sm rounded-xl border border-red-300 text-sm text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 font-semibold shadow-sm hover:shadow-md backdrop-blur-sm bg-red-50/50 relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Delete</span>
                  </button>
                )}
              </div>
              <div className="flex gap-sm">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-lg py-sm rounded-xl border border-stroke-default-primary-v2/60 text-sm text-text-default-secondary hover:bg-background-card-secondary/80 hover:border-orange-500/30 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "px-lg py-sm rounded-xl text-white text-sm font-bold transition-all duration-300 shadow-lg transform relative overflow-hidden group",
                    isSubmitting 
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 active:scale-95 cursor-pointer"
                  )}
                >
                  {!isSubmitting && <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                  <span className="relative z-10 flex items-center gap-xs">
                    {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Post Update")}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
