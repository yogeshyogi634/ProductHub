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

  const handleSubmit = (e) => {
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

    if (isEditing) {
      updateUpdate(editingUpdate.id, payload);
    } else {
      addUpdate(payload);
    }
    closeModal();
  };

  if (!isNewUpdateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/35" onClick={closeModal} />

      {/* Centered modal */}
      <div className="absolute inset-0 flex items-center justify-center p-lg">
        <div
          className="relative bg-background-app border border-stroke-default-primary-v2 rounded-sm w-[520px] max-w-[90vw] flex flex-col shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-lg py-md border-b border-stroke-default-primary-v2">
            <div className="flex flex-col gap-2xs">
              <h2 className="text-text-default-primary font-semibold text-base">
                {isEditing ? "Edit Update" : "New Update"}
              </h2>
              <span className="text-xs text-text-default-secondary">
                {isEditing ? "Editing update for " : "Posting to "}
                <span className="text-text-default-primary font-medium">
                  {activeProduct}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-8 h-8 flex items-center justify-center rounded-sm border border-stroke-default-primary-v2 hover:bg-background-card-secondary transition-colors"
            >
              <X className="w-4 h-4 text-icon-default-primary" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-md p-lg">
            {/* Title */}
            <div className="flex flex-col gap-2xs">
              <label className="text-xs font-medium text-text-default-secondary">
                Title <span className="text-background-actions-error">*</span>
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
                  "h-10 px-md border rounded-sm bg-background-app text-sm text-text-default-primary placeholder:text-text-default-secondary outline-none transition-colors",
                  errors.title
                    ? "border-background-actions-error"
                    : "border-stroke-default-primary focus:border-stroke-default-inverse",
                )}
              />
              {errors.title && (
                <span className="text-xs text-background-actions-error">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Description — Rich Text Editor */}
            <div className="flex flex-col gap-2xs">
              <label className="text-xs font-medium text-text-default-secondary">
                Description{" "}
                <span className="text-background-actions-error">*</span>
              </label>
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
              {errors.description && (
                <span className="text-xs text-background-actions-error">
                  {errors.description}
                </span>
              )}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2xs">
              <label className="text-xs font-medium text-text-default-secondary">
                Status
              </label>
              <div className="flex gap-sm">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "flex-1 h-9 border rounded-sm text-sm font-medium transition-colors",
                      status === s
                        ? s === "WIP"
                          ? "bg-background-actions-warning-subtle border-stroke-actions-warning text-text-actions-warning"
                          : s === "DONE"
                            ? "bg-background-actions-success-subtle border-stroke-actions-success text-text-actions-success"
                            : "bg-background-card-secondary border-stroke-default-inverse text-text-default-primary"
                        : "bg-background-app border-stroke-default-primary-v2 text-text-default-secondary hover:bg-background-card-primary",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-2xs">
              <label className="text-xs font-medium text-text-default-secondary">
                Department
              </label>
              <select
                value={departmentType}
                onChange={(e) => setDepartmentType(e.target.value)}
                className="h-10 pl-sm pr-8 border border-stroke-default-primary rounded-sm bg-background-app text-sm text-text-default-primary outline-none focus:border-stroke-default-inverse transition-colors appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat"
              >
                {DEPT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Footer */}
            <div className="flex gap-sm justify-between pt-sm border-t border-stroke-default-primary-v2">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteUpdate(editingUpdate.id);
                      closeModal();
                    }}
                    className="px-md py-sm rounded-sm border border-background-actions-error text-sm text-background-actions-error hover:bg-background-actions-error hover:text-white transition-colors font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-sm">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-md py-sm rounded-sm border border-stroke-default-primary-v2 text-sm text-text-default-secondary hover:bg-background-card-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm rounded-sm bg-brand-primary text-text-brand-on-background text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {isEditing ? "Save Changes" : "Post Update"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
