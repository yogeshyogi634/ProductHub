import React, { useState } from "react";
import { useSavedSignatures } from "../hooks/useSavedSignatures";

const InputField = ({ label, id, ...props }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label} {props.required && <span className="text-orange-500">*</span>}
    </label>
    <input
      id={id}
      name={id}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm"
      {...props}
    />
  </div>
);

const ToggleSwitch = ({ label, id, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-700 cursor-pointer"
    >
      {label}
    </label>
    <button
      type="button"
      id={id}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      onClick={() =>
        onChange({ target: { name: id, type: "checkbox", checked: !checked } })
      }
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        checked ? "bg-orange-500" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export const FormPanel = ({
  data,
  handleChange,
  handleImageUpload,
  isConvertingImage,
  imageError,
  clearImage,
  loadSignature,
}) => {
  const {
    savedSignatures,
    saveSignature,
    updateSignature,
    deleteSignature,
    duplicateSignature,
  } = useSavedSignatures();
  const [activeTab, setActiveTab] = useState("create");
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingSignatureId, setEditingSignatureId] = useState(null);

  const handleSave = () => {
    if (!saveName.trim()) return;

    if (editingSignatureId) {
      updateSignature(editingSignatureId, saveName, data);
    } else {
      saveSignature(saveName, data);
    }

    setSaveName("");
    setEditingSignatureId(null);
    setIsSaving(false);
  };

  return (
    <div className="w-full bg-white h-full overflow-y-auto flex flex-col">
      <div className="p-6 pb-5 shrink-0 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Signature Builder
        </h2>

        <div className="flex space-x-1 bg-gray-100/80 p-1 rounded-lg mt-5">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${activeTab === "create" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Create signature
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${activeTab === "saved" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Saved Signatures{" "}
            {savedSignatures.length > 0 && (
              <span className="ml-1.5 bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {savedSignatures.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === "saved" ? (
          <div className="space-y-4 pt-2">
            {savedSignatures.length === 0 ? (
              <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <svg
                  className="mx-auto h-10 w-10 text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <h3 className="text-sm font-medium text-gray-900">
                  No saved signatures
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create and save a signature to see it here.
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="mt-4 text-orange-500 text-sm font-medium hover:text-orange-500/80 transition-colors"
                >
                  Go to Builder &rarr;
                </button>
              </div>
            ) : (
              savedSignatures.map((sig) => (
                <div
                  key={sig.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 hover:shadow transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {sig.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sig.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        loadSignature(sig.data);
                        setSaveName(sig.name);
                        setEditingSignatureId(sig.id);
                        setActiveTab("create");
                      }}
                      className="bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit signature
                    </button>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                      {sig.data.fullName || "No Name"} &bull;{" "}
                      {sig.data.selectedBanner === "none"
                        ? "No Banner"
                        : sig.data.selectedBanner + " Banner"}
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => loadSignature(sig.data)}
                        title="View Signature"
                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => duplicateSignature(sig.id)}
                        title="Duplicate"
                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteSignature(sig.id)}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Photo Upload Group */}
            <div className="space-y-4 bg-gray-50/30 p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Profile Photo
              </h3>

              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {data.profilePhoto ? (
                    <img
                      className="h-20 w-20 object-cover rounded-full shadow-sm ring-2 ring-white border border-gray-200"
                      src={data.profilePhoto}
                      alt="Profile preview"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center border-2 border-dashed border-indigo-200">
                      <svg
                        className="h-8 w-8 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 space-y-2">
                  <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isConvertingImage}
                      className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-orange-500/10 file:text-orange-500
                    hover:file:bg-orange-500/20
                    transition-all file:transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                    />
                  </label>

                  {data.profilePhoto && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-sm text-red-600 hover:text-red-700 font-medium text-left w-fit px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      Remove photo
                    </button>
                  )}

                  {isConvertingImage && (
                    <p className="text-sm text-indigo-600 animate-pulse font-medium">
                      Processing image...
                    </p>
                  )}
                  {imageError && (
                    <p className="text-sm text-red-600 font-medium">
                      {imageError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Details Group */}
            <div className="space-y-4 bg-gray-50/30 p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Personal Info
              </h3>

              <InputField
                label="Full Name"
                id="fullName"
                value={data.fullName}
                onChange={handleChange}
                placeholder="e.g. Madhav Sajikumar"
                required
              />

              <InputField
                label="Designation"
                id="designation"
                value={data.designation}
                onChange={handleChange}
                placeholder="e.g. Design Lead"
                required
              />
            </div>

            {/* Contact Details Group */}
            <div className="space-y-4 bg-gray-50/30 p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Contact Info
              </h3>

              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="emailPrefix"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Prefix <span className="text-orange-500">*</span>
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <input
                    type="text"
                    id="emailPrefix"
                    name="emailPrefix"
                    value={data.emailPrefix}
                    onChange={handleChange}
                    placeholder="your.name"
                    className="flex-1 min-w-0 block w-full px-4 py-2 rounded-none rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900"
                  />
                  <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    @neokred.tech
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-3 bg-white p-3 rounded-lg border border-gray-100">
                <InputField
                  label="Phone Number"
                  id="phone"
                  value={data.phone}
                  onChange={handleChange}
                  placeholder="+91 8590840884"
                  required
                />
                <ToggleSwitch
                  label="Show Mobile Number"
                  id="showPhone"
                  checked={data.showPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-3 bg-white p-3 rounded-lg border border-gray-100">
                <InputField
                  label="LinkedIn URL"
                  id="linkedinUrl"
                  type="url"
                  value={data.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
                <InputField
                  label="LinkedIn Message"
                  id="linkedinMessage"
                  type="text"
                  value={data.linkedinMessage}
                  onChange={handleChange}
                  placeholder="Let's connect on LinkedIn"
                />
                <ToggleSwitch
                  label="Show LinkedIn Icon"
                  id="showLinkedin"
                  checked={data.showLinkedin}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Company Info Group */}
            <div className="space-y-4 bg-gray-50/30 p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Company Info
              </h3>

              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Office Location
                </label>
                <div className="flex flex-col space-y-3 bg-white p-4 rounded-lg border border-gray-100">
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="radio"
                      name="location"
                      value="Indiqube South Island, Bengaluru"
                      checked={
                        data.location === "Indiqube South Island, Bengaluru"
                      }
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700 leading-5 group-hover:text-gray-900">
                      <span className="font-medium">Bangalore:</span> Indiqube
                      South Island, Bengaluru
                    </span>
                  </label>
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="radio"
                      name="location"
                      value="IndiQube Lakeview, L&T Business Park, Powai, Mumbai"
                      checked={
                        data.location ===
                        "IndiQube Lakeview, L&T Business Park, Powai, Mumbai"
                      }
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700 leading-5 group-hover:text-gray-900">
                      <span className="font-medium">Mumbai:</span> IndiQube
                      Lakeview, L&T Business Park, Powai, Mumbai
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Banner Settings Group */}
            <div className="space-y-4 bg-gray-50/30 p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Banner Settings
              </h3>

              <div className="flex flex-col space-y-3 bg-white p-3 rounded-lg border border-gray-100">
                <div className="flex flex-col space-y-1">
                  <label
                    htmlFor="selectedBanner"
                    className="text-sm font-medium text-gray-700"
                  >
                    Select Banner
                  </label>
                  <select
                    id="selectedBanner"
                    name="selectedBanner"
                    value={data.selectedBanner || "default"}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="default">Default Banner</option>
                    <option value="christmas">Christmas Banner</option>
                    <option value="eid">Eid Mubarak Banner</option>
                    <option value="newYear" disabled>
                      New Year Banner (Coming Soon)
                    </option>
                    <option value="diwali" disabled>
                      Diwali Banner (Coming Soon)
                    </option>
                  </select>
                </div>
                <ToggleSwitch
                  label="Show Banner"
                  id="showBanner"
                  checked={data.showBanner}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Save Block */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              {isSaving ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Enter a name (e.g. Christmas Version)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    disabled={!saveName.trim()}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsSaving(false)}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSaving(true)}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  <span>Save Signature</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
