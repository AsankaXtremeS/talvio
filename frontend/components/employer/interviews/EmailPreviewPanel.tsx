// EmailPreviewPanel.tsx
// Shows the generated email preview below the schedule form.
// Employer can edit the email body before sending.
// Renders the HTML preview in an iframe for accurate email display.

"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, Edit3, Eye, Check } from "lucide-react";

interface Props {
  subject: string;
  body: string;           // HTML email body from backend
  onBodyChange: (newBody: string) => void;
  isSaving?: boolean;
}

export default function EmailPreviewPanel({ subject, body, onBodyChange, isSaving }: Props) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [editText, setEditText] = useState(body);
  const [saved, setSaved] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync editText when body prop changes (new generation)
  useEffect(() => {
    setEditText(body);
  }, [body]);

  // Write HTML into iframe for accurate email rendering
  useEffect(() => {
    if (mode === "preview" && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(body);
        doc.close();
      }
    }
  }, [body, mode]);

  const handleSave = () => {
    onBodyChange(editText);
    setMode("preview");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mt-6 bg-white border border-indigo-100 shadow-sm rounded-xl overflow-hidden">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Mail size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">Email Preview</p>
            <p className="text-xs text-indigo-500 truncate max-w-xs">{subject}</p>
          </div>
        </div>

        {/* Preview / Edit toggle */}
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check size={13} /> Saved
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-gray-400">Saving…</span>
          )}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "preview"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Eye size={13} /> Preview
            </button>
            <button
              onClick={() => { setMode("edit"); setEditText(body); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "edit"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Edit3 size={13} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      {mode === "preview" ? (
        /* iframe renders the full branded HTML email */
        <div className="relative w-full" style={{ height: "520px" }}>
          <iframe
            ref={iframeRef}
            title="Email Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
          />
        </div>
      ) : (
        /* Edit mode — plain textarea for the HTML body */
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">
            Edit the email content below. HTML is supported. Changes will be saved to the draft.
          </p>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={18}
            className="w-full px-4 py-3 text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            spellCheck={false}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setMode("preview")}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}