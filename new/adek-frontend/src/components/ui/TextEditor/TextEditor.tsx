/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TextEditorUtils } from "@/utils/TextEditorUtils";
import React from "react";
import {
  Editor,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  BtnNumberedList,
  BtnBulletList,
  BtnClearFormatting,
  BtnLink,
  BtnUndo,
  BtnRedo,
  HtmlButton,
} from "react-simple-wysiwyg";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

/** -----------------------
 *  🔥 MAIN TEXT EDITOR (Fixed - No Duplicate Rendering)
 * ----------------------- */
const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write something...",
  maxLength,
  className = "",
}) => {
  /** Handle content change with sanitization + limit */
  const handleChange = (e: any) => {
    const html = e.target.value;

    // ✅ Check length BEFORE sanitizing to get accurate count
    if (maxLength) {
      const count = TextEditorUtils.getCharacterCount(html);
      if (count > maxLength) {
        // Don't update if exceeds max length
        return;
      }
    }

    // ✅ Sanitize HTML before passing to onChange
    const cleanedHTML = TextEditorUtils.sanitizeHTML(html);
    onChange(cleanedHTML);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* ✅ REMOVED EditorProvider - it should only be used ONCE at app level */}
      <div style={{ border: "1px solid #d1d5db", borderRadius: 12, overflow: "hidden" }}>
        <Toolbar 
          style={{ 
            borderRadius: 0,
            marginBottom: 0,
            borderBottom: "1px solid #d1d5db",
            padding: "8px",
            background: "#f9fafb"
          }}
        >
          <BtnUndo />
          <BtnRedo />
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnStrikeThrough />
          <BtnNumberedList />
          <BtnBulletList />
          <BtnClearFormatting />
          <BtnLink />
          <HtmlButton />
        </Toolbar>

        <Editor
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            minHeight: 160,
            padding: 16,
            borderRadius: 0,
            border: "none",
            background: "#fff",
          }}
        />
      </div>

      {/* ✅ Character counter with better styling */}
      {maxLength && (
        <div 
          className="text-right text-xs mt-1"
          style={{
            color: TextEditorUtils.getCharacterCount(value) > maxLength * 0.9 
              ? "#ef4444" 
              : "#6b7280"
          }}
        >
          {TextEditorUtils.getCharacterCount(value)}/{maxLength} characters
        </div>
      )}
    </div>
  );
};

export default TextEditor;