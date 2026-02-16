"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "../../lib/utils";

const COLORS = [
    { label: "Default", value: "inherit" },
    { label: "Red", value: "#ef4444" },
    { label: "Orange", value: "#f97316" },
    { label: "Yellow", value: "#eab308" },
    { label: "Green", value: "#22c55e" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Purple", value: "#a855f7" },
    { label: "Pink", value: "#ec4899" },
];

function ToolbarButton({ active, onClick, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault(); // keep focus in editor
                onClick();
            }}
            title={title}
            className={cn(
                "w-7 h-7 flex items-center justify-center rounded-sm text-xs font-semibold transition-colors",
                active
                    ? "bg-background-card-secondary text-text-default-primary border border-stroke-default-inverse"
                    : "text-text-default-secondary hover:bg-background-card-primary border border-transparent"
            )}
        >
            {children}
        </button>
    );
}

export function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Describe the update…",
    error,
    className,
}) {
    const editorRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState({});
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);
    const isInternalChange = useRef(false);

    // Initialize content
    useEffect(() => {
        if (editorRef.current && !isInternalChange.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || "";
            }
        }
        isInternalChange.current = false;
    }, [value]);

    // Close color picker on outside click
    useEffect(() => {
        const handler = (e) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const queryFormats = useCallback(() => {
        setActiveFormats({
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            strikeThrough: document.queryCommandState("strikeThrough"),
            insertUnorderedList: document.queryCommandState("insertUnorderedList"),
            insertOrderedList: document.queryCommandState("insertOrderedList"),
        });
    }, []);

    const execCommand = useCallback(
        (cmd, val = null) => {
            document.execCommand(cmd, false, val);
            editorRef.current?.focus();
            queryFormats();
            // Emit change
            if (editorRef.current && onChange) {
                isInternalChange.current = true;
                onChange(editorRef.current.innerHTML);
            }
        },
        [onChange, queryFormats]
    );

    const handleInput = () => {
        if (editorRef.current && onChange) {
            isInternalChange.current = true;
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleAutoLink = (e) => {
        if (e.key !== " " && e.key !== "Enter") return;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const node = range.startContainer;

        // Ensure we are in a text node
        if (node.nodeType === Node.TEXT_NODE) {
            // Get text up to cursor
            const textToCursor = node.textContent.substring(0, range.startOffset);

            // Regex to match a URL optionally ending with punctuation, followed by the delimiter (space/enter)
            // But since e.key is Space/Enter, the character might not be in the text node yet if we use onKeyDown.
            // We are using onKeyUp, so the character IS in the text node.

            let lastWord;
            let endOffset = range.startOffset;

            if (e.key === " ") {
                // The space is already there. Look at word before it.
                const match = textToCursor.match(/((https?:\/\/|www\.)[^\s]+)\s$/);
                if (match) {
                    lastWord = match[1];
                    endOffset = range.startOffset - 1; // exclude space
                }
            } else if (e.key === "Enter") {
                // Enter usually inserts a new paragraph/div. The URL is likely in the *previous* node.
                // Handling Enter is tricky across browsers. 
                // Let's stick to Space for now as it's the primary way people type.
                // But often people type "google.com" then Enter.
                // If Enter, the cursor is now in a new line. We check the previous line?
                return; // Skipping Enter for now to avoid complexity
            }

            if (lastWord) {
                const startOffset = endOffset - lastWord.length;
                let url = lastWord;
                if (!url.match(/^https?:\/\//)) {
                    url = "https://" + url;
                }

                // Verify valid URL structure roughly
                if (!url.includes(".")) return;

                // Select the URL text
                const urlRange = document.createRange();
                try {
                    urlRange.setStart(node, startOffset);
                    urlRange.setEnd(node, endOffset);

                    selection.removeAllRanges();
                    selection.addRange(urlRange);

                    // Create link
                    document.execCommand("createLink", false, url);

                    // Add target="_blank"
                    // Try to find the anchor from the current selection
                    let anchor = null;
                    const newSelection = window.getSelection();
                    if (newSelection.rangeCount > 0) {
                        let current = newSelection.getRangeAt(0).startContainer;
                        while (current && current !== editorRef.current) {
                            if (current.nodeName === 'A') {
                                anchor = current;
                                break;
                            }
                            current = current.parentNode;
                        }
                    }

                    // Fallback: strict search for the link we likely just created
                    if (!anchor) {
                        const links = editorRef.current.getElementsByTagName('a');
                        for (let link of links) {
                            // Normalize hrefs for comparison (remove trailing slashes)
                            const normalize = (s) => s.replace(/\/$/, '').toLowerCase();
                            if (normalize(link.href) === normalize(url)) {
                                anchor = link;
                                break;
                            }
                        }
                    }

                    if (anchor) {
                        anchor.target = "_blank";
                        anchor.rel = "noopener noreferrer";
                        anchor.className = "text-brand-primary underline hover:text-brand-primary-dark cursor-pointer";
                    }

                    // Restore cursor to after the space
                    // The space was at original range.startOffset
                    // But DOM might have changed structure. 
                    // Usually createLink splits text nodes. 
                    // "URL " -> "URL" (A) + " " (Text)
                    // We want to place cursor at end of the text node containing " ".

                    selection.collapseToEnd();
                } catch (err) {
                    console.error("Auto-link failed", err);
                }
            }
        }
    };

    const handleKeyUp = (e) => {
        handleAutoLink(e);
        queryFormats();
    };

    const handleMouseUp = () => queryFormats();

    return (
        <div
            className={cn(
                "border rounded-sm transition-colors flex flex-col overflow-hidden",
                error
                    ? "border-background-actions-error"
                    : "border-stroke-default-primary focus-within:border-stroke-default-inverse",
                className
            )}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-stroke-default-primary-v2 bg-background-card-primary flex-wrap">
                <ToolbarButton
                    active={activeFormats.bold}
                    onClick={() => execCommand("bold")}
                    title="Bold (Ctrl+B)"
                >
                    B
                </ToolbarButton>

                <ToolbarButton
                    active={activeFormats.italic}
                    onClick={() => execCommand("italic")}
                    title="Italic (Ctrl+I)"
                >
                    <span className="italic">I</span>
                </ToolbarButton>

                <ToolbarButton
                    active={activeFormats.underline}
                    onClick={() => execCommand("underline")}
                    title="Underline (Ctrl+U)"
                >
                    <span className="underline">U</span>
                </ToolbarButton>

                <ToolbarButton
                    active={activeFormats.strikeThrough}
                    onClick={() => execCommand("strikeThrough")}
                    title="Strikethrough"
                >
                    <span className="line-through">S</span>
                </ToolbarButton>

                {/* Separator */}
                <div className="w-px h-5 bg-stroke-default-primary-v2 mx-1" />

                <ToolbarButton
                    active={activeFormats.insertUnorderedList}
                    onClick={() => execCommand("insertUnorderedList")}
                    title="Bullet List"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
                        <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
                        <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                </ToolbarButton>

                <ToolbarButton
                    active={activeFormats.insertOrderedList}
                    onClick={() => execCommand("insertOrderedList")}
                    title="Numbered List"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="10" y1="6" x2="21" y2="6" />
                        <line x1="10" y1="12" x2="21" y2="12" />
                        <line x1="10" y1="18" x2="21" y2="18" />
                        <text x="1" y="8" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text>
                        <text x="1" y="14.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text>
                        <text x="1" y="21" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text>
                    </svg>
                </ToolbarButton>

                {/* Separator */}
                <div className="w-px h-5 bg-stroke-default-primary-v2 mx-1" />

                {/* Color Picker */}
                <div className="relative" ref={colorPickerRef}>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setShowColorPicker((p) => !p);
                        }}
                        title="Text Color"
                        className="w-7 h-7 flex flex-col items-center justify-center rounded-sm text-xs font-bold transition-colors text-text-default-secondary hover:bg-background-card-primary border border-transparent gap-0"
                    >
                        <span className="leading-none text-[11px]">A</span>
                        <span
                            className="w-4 h-[3px] rounded-full"
                            style={{ backgroundColor: "#ef4444" }}
                        />
                    </button>

                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-background-app border border-stroke-default-primary-v2 rounded-sm shadow-lg p-2 flex gap-1.5 z-50">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    title={c.label}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        execCommand("foreColor", c.value);
                                        setShowColorPicker(false);
                                    }}
                                    className="w-6 h-6 rounded-full border border-stroke-default-primary-v2 hover:scale-110 transition-transform"
                                    style={{
                                        backgroundColor: c.value === "inherit" ? "transparent" : c.value,
                                    }}
                                >
                                    {c.value === "inherit" && (
                                        <span className="text-[10px] text-text-default-secondary">✕</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Editable area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyUp={handleKeyUp}
                onMouseUp={handleMouseUp}
                onFocus={queryFormats}
                data-placeholder={placeholder}
                className={cn(
                    "min-h-[120px] max-h-[240px] overflow-y-auto px-md py-sm text-sm text-text-default-primary outline-none bg-background-app",
                    "rich-editor-content",
                    "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-text-default-secondary [&:empty]:before:pointer-events-none"
                )}
            />
        </div>
    );
}
