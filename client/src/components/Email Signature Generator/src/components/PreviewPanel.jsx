import React, { useState } from "react";
import { SignaturePreview, generateSignatureHTML } from "./SignatureTemplate";
import { CopyButtons } from "./CopyButtons";

export const PreviewPanel = ({ data }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const rawHTML = generateSignatureHTML(data);

  return (
    <div className="w-full h-full bg-gray-50/50 flex flex-col p-6 overflow-y-auto">
      <div className=" flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 border-b border-gray-200">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Live Preview
          </h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            See exactly how your signature will appear. The preview uses the
            real HTML that will be exported.
          </p>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
            isDarkMode
              ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {isDarkMode ? (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.415l-.708-.708a1 1 0 010-1.414zM16 10a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-4.22 4.22a1 1 0 010 1.415l-.708.708a1 1 0 01-1.415-1.414l.708-.708a1 1 0 011.415 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 010-1.415l-.708-.708a1 1 0 01-1.414 1.415l.708.708a1 1 0 011.415 0zM4 10a1 1 0 011-1H3a1 1 0 110 2h1a1 1 0 01-1-1zm4.22-4.22a1 1 0 011.414 0l.708-.707a1 1 0 011.415 1.414l-.708.708a1 1 0 01-1.415-1.415z"></path>
              </svg>
              Light Mode
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
              Dark Mode
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-4">
        {/* Signature Container wrapped in a nice card */}
        <div
          className={`rounded-2xl shadow-lg p-8 max-w-full w-auto flex items-center justify-center relative overflow-hidden group transition-colors duration-300 ${
            isDarkMode
              ? "bg-[#1a1a1a] border border-gray-800"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-bl-lg items-center gap-1.5 flex border-l border-b border-yellow-200">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="whitespace-nowrap">Preview Only</span>
          </div>

          <div className="transition-all duration-300 transform group-hover:scale-[1.01] origin-center mt-3">
            <SignaturePreview data={data} />
          </div>
        </div>

        <div className="mt-8 flex justify-center w-full">
          <CopyButtons htmlStr={rawHTML} />
        </div>
      </div>
    </div>
  );
};
