// EmailPreviewPanel.tsx
// Shows the generated email preview below the schedule form.
// Employer can click on email content to edit specific sections.
// User-friendly inline editing for common email parts.

"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, Edit3, Check } from "lucide-react";

interface Props {
  subject: string;
  body: string;           // HTML email body from backend
  onBodyChange: (newBody: string) => void;
  isSaving?: boolean;
}

interface EditableSection {
  name: string;
  label: string;
  value: string;
  placeholder: string;
}

export default function EmailPreviewPanel({ subject, body, onBodyChange, isSaving }: Props) {
  const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
  const [sections, setSections] = useState<EditableSection[]>([]);
  const [saved, setSaved] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract editable sections from HTML on mount/body change
  useEffect(() => {
    const extractSections = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(body, "text/html");
      
      const extracted: EditableSection[] = [];
      
      // Extract greeting (first paragraph or h1-h2)
      const greeting = doc.querySelector("h1, h2, .greeting");
      if (greeting) {
        extracted.push({
          name: "greeting",
          label: "Greeting",
          value: greeting.textContent || "",
          placeholder: "e.g., Hello John,"
        });
      }
      
      // Extract main body paragraphs
      const paragraphs = doc.querySelectorAll("p");
      let bodyIndex = 0;
      paragraphs.forEach((para, idx) => {
        if (idx > 0 && para.textContent?.trim()) { // Skip first para (greeting)
          extracted.push({
            name: `body-${bodyIndex}`,
            label: `Content Section ${bodyIndex + 1}`,
            value: para.textContent || "",
            placeholder: "Edit this section..."
          });
          bodyIndex++;
        }
      });
      
      // If no sections found, add a general editor
      if (extracted.length === 0) {
        extracted.push({
          name: "fullBody",
          label: "Email Content",
          value: body,
          placeholder: "Edit email content..."
        });
      }
      
      setSections(extracted);
    };
    
    extractSections();
  }, [body]);

  // Write HTML into iframe for preview
  useEffect(() => {
    if (editingSectionName === null && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(body);
        doc.close();
      }
    }
  }, [body, editingSectionName]);

  const handleSectionChange = (sectionName: string, newValue: string) => {
    setSections(prev =>
      prev.map(s => s.name === sectionName ? { ...s, value: newValue } : s)
    );
  };

  return (
    <div className="mt-6 bg-white rounded-xl overflow-hidden border border-indigo-100 shadow-sm">
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

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check size={13} /> Saved
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-gray-400">Saving…</span>
          )}
        </div>
      </div>

      {/* ── Preview Mode ── */}
      {editingSectionName === null ? (
        <div className="relative">
          <div className="relative w-full bg-gray-50 flex flex-col" style={{ height: "520px" }}>
            <iframe
              ref={iframeRef}
              title="Email Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
          
          {/* Click to edit hint + Edit button */}
          <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 size={14} className="text-blue-600" />
              <p className="text-xs text-blue-700">
                Click the <strong>Edit Email</strong> button below to customize sections
              </p>
            </div>
            <button
              onClick={() => setEditingSectionName("edit-mode")}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Edit3 size={14} /> Edit Email
            </button>
          </div>
        </div>
      ) : (
        /* ── Edit Mode: Editable Sections ── */
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <p className="text-sm font-semibold text-gray-900 mb-4">Edit Email Sections</p>
          
          {sections.map((section) => (
            <div
              key={section.name}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                {section.label}
              </label>
              <textarea
                value={section.value}
                onChange={(e) => handleSectionChange(section.name, e.target.value)}
                placeholder={section.placeholder}
                rows={section.name === "fullBody" ? 10 : 3}
                className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                spellCheck="true"
              />
            </div>
          ))}
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditingSectionName(null)}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save all sections
                let updatedBody = body;
                const parser = new DOMParser();
                const doc = parser.parseFromString(body, "text/html");
                
                sections.forEach((section) => {
                  if (section.name === "greeting") {
                    const greeting = doc.querySelector("h1, h2, .greeting");
                    if (greeting) greeting.textContent = section.value;
                  } else if (section.name.startsWith("body-")) {
                    const paragraphs = doc.querySelectorAll("p");
                    const idx = parseInt(section.name.split("-")[1]) + 1;
                    if (paragraphs[idx]) paragraphs[idx].textContent = section.value;
                  } else if (section.name === "fullBody") {
                    updatedBody = section.value;
                  }
                });
                
                if (sections[0]?.name !== "fullBody") {
                  updatedBody = doc.documentElement.innerHTML;
                }
                
                onBodyChange(updatedBody);
                setEditingSectionName(null);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Check size={14} className="inline mr-1" /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}