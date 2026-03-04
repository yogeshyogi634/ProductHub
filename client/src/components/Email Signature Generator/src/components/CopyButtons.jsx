import React, { useState } from "react";

export const CopyButtons = ({ htmlStr }) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedOutlook, setCopiedOutlook] = useState(false);

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(htmlStr);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch (err) {
      console.error("Failed to copy raw HTML:", err);
      alert("Failed to copy text. Please try again.");
    }
  };

  const handleCopyOutlook = async () => {
    try {
      const blobHtml = new Blob([htmlStr], { type: "text/html" });
      const blobText = new Blob([htmlStr], { type: "text/plain" });

      const clipboardItem = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText,
      });

      await navigator.clipboard.write([clipboardItem]);
      setCopiedOutlook(true);
      setTimeout(() => setCopiedOutlook(false), 2000);
    } catch (err) {
      console.error("Failed to copy for Outlook:", err);

      // Fallback for older browsers
      try {
        const tempEl = document.createElement("div");
        tempEl.innerHTML = htmlStr;
        document.body.appendChild(tempEl);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(tempEl);
        selection.removeAllRanges();
        selection.addRange(range);

        document.execCommand("copy");

        selection.removeAllRanges();
        document.body.removeChild(tempEl);

        setCopiedOutlook(true);
        setTimeout(() => setCopiedOutlook(false), 2000);
      } catch (fallbackErr) {
        alert(
          "Failed to copy for Outlook. Your browser might not support this feature.",
        );
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4 mt-8 w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopyOutlook}
          className="flex-1 w-[300px] px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 cursor-pointer"
        >
          {copiedOutlook ? (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
              Copy for Outlook
            </>
          )}
        </button>
        <button
          onClick={handleCopyRaw}
          className="flex-1 px-6 py-3 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 cursor-pointer"
        >
          {copiedRaw ? (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                ></path>
              </svg>
              Copy HTML Code
            </>
          )}
        </button>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mt-2 w-max">
        <h4 className="text-sm font-bold tracking-tight text-blue-800 mb-2">
          How to use in Outlook
        </h4>
        <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
          <li>Click "Copy for Outlook"</li>
          <li>Open Outlook → File → Options → Mail → Signatures → New</li>
          <li>
            Click in the signature box and press <strong>Ctrl+V</strong> (or{" "}
            <strong>Cmd+V</strong>)
          </li>
        </ol>
      </div>
    </div>
  );
};
