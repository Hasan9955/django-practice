// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useState, useEffect } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";
// import TextAlign from "@tiptap/extension-text-align";
// import Link from "@tiptap/extension-link";
// import { TextStyle } from "@tiptap/extension-text-style";
// import Color from "@tiptap/extension-color";
// import Highlight from "@tiptap/extension-highlight";
// import TaskList from "@tiptap/extension-task-list";
// import TaskItem from "@tiptap/extension-task-item";
// import Superscript from "@tiptap/extension-superscript";
// import Subscript from "@tiptap/extension-subscript";
// import {
//   Undo2,
//   Redo2,
//   Bold,
//   Underline as UnderlineIcon,
//   Italic,
//   Strikethrough,
//   AlignLeft,
//   AlignCenter,
//   AlignRight,
//   AlignJustify,
//   List,
//   ListOrdered,
//   ListTodo,
//   Link2,
//   Palette,
//   Code,
//   Quote,
//   Minus,
//   ChevronDown,
// } from "lucide-react";

// // ========================
// // TOOLBAR BUTTON
// // ========================
// const ToolbarButton = ({
//   icon: Icon,
//   onClick,
//   isActive = false,
//   disabled = false,
//   title,
//   children,
// }: {
//   icon?: any;
//   onClick: () => void;
//   isActive?: boolean;
//   disabled?: boolean;
//   title: string;
//   children?: React.ReactNode;
// }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     title={title}
//     className={`p-1.5 rounded transition-colors inline-flex items-center justify-center ${
//       isActive
//         ? "bg-purple-100 text-purple-700"
//         : "text-gray-600 hover:bg-gray-100"
//     } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
//   >
//     {Icon && <Icon size={18} />}
//     {children}
//   </button>
// );

// // ========================
// // COLOR PICKER
// // ========================
// const ColorPicker = ({
//   editor,
//   onClose,
// }: {
//   editor: any;
//   onClose: () => void;
// }) => {
//   const colors = [
//     { name: "Red", text: "#dc2626", highlight: "#fca5a5" },
//     { name: "Orange", text: "#ea580c", highlight: "#fdba74" },
//     { name: "Yellow", text: "#ca8a04", highlight: "#fde047" },
//     { name: "Green", text: "#16a34a", highlight: "#86efac" },
//     { name: "Blue", text: "#2563eb", highlight: "#93c5fd" },
//     { name: "Purple", text: "#9333ea", highlight: "#d8b4fe" },
//     { name: "Pink", text: "#db2777", highlight: "#f9a8d4" },
//     { name: "Black", text: "#000000", highlight: "#e5e5e5" },
//   ];

//   return (
//     <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-[280px]">
//       <div className="mb-3">
//         <h4 className="text-xs font-semibold text-gray-700 mb-2">
//           Text Color
//         </h4>
//         <div className="grid grid-cols-8 gap-1">
//           {colors.map((color) => (
//             <button
//               key={`text-${color.name}`}
//               onClick={() => {
//                 editor.chain().focus().setColor(color.text).run();
//                 onClose();
//               }}
//               className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
//               style={{ backgroundColor: color.text }}
//               title={`${color.name} Text`}
//             />
//           ))}
//         </div>
//       </div>
//       <div>
//         <h4 className="text-xs font-semibold text-gray-700 mb-2">
//           Highlight Color
//         </h4>
//         <div className="grid grid-cols-8 gap-1">
//           {colors.map((color) => (
//             <button
//               key={`highlight-${color.name}`}
//               onClick={() => {
//                 editor
//                   .chain()
//                   .focus()
//                   .toggleHighlight({ color: color.highlight })
//                   .run();
//                 onClose();
//               }}
//               className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
//               style={{ backgroundColor: color.highlight }}
//               title={`${color.name} Highlight`}
//             />
//           ))}
//         </div>
//       </div>
//       <div className="mt-3 pt-3 border-t border-gray-200">
//         <button
//           onClick={() => {
//             editor.chain().focus().unsetColor().unsetHighlight().run();
//             onClose();
//           }}
//           className="text-xs text-gray-600 hover:text-gray-900 w-full text-center"
//         >
//           Clear Colors
//         </button>
//       </div>
//     </div>
//   );
// };

// // ========================
// // MENU BAR
// // ========================
// const MenuBar = ({ editor }: { editor: any }) => {
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [showHeadingMenu, setShowHeadingMenu] = useState(false);

//   if (!editor) return null;

//   const setLink = () => {
//     const previousUrl = editor.getAttributes("link").href;
//     const url = window.prompt("Enter URL:", previousUrl);
//     if (url === null) return;
//     if (url === "") {
//       editor.chain().focus().extendMarkRange("link").unsetLink().run();
//       return;
//     }
//     editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
//   };

//   return (
//     <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
//       {/* Undo/Redo */}
//       <div className="flex gap-1 pr-2 border-r border-gray-300">
//         <ToolbarButton
//           icon={Undo2}
//           onClick={() => editor.chain().focus().undo().run()}
//           disabled={!editor.can().chain().focus().undo().run()}
//           title="Undo (Ctrl+Z)"
//         />
//         <ToolbarButton
//           icon={Redo2}
//           onClick={() => editor.chain().focus().redo().run()}
//           disabled={!editor.can().chain().focus().redo().run()}
//           title="Redo (Ctrl+Y)"
//         />
//       </div>

//       {/* Headings Dropdown */}
//       <div className="relative px-2 border-r border-gray-300">
//         <button
//           onClick={() => setShowHeadingMenu(!showHeadingMenu)}
//           className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
//         >
//           {editor.isActive("heading", { level: 1 })
//             ? "H1"
//             : editor.isActive("heading", { level: 2 })
//             ? "H2"
//             : editor.isActive("heading", { level: 3 })
//             ? "H3"
//             : "Normal"}
//           <ChevronDown size={14} />
//         </button>
//         {showHeadingMenu && (
//           <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
//             {[
//               { label: "Normal", action: () => editor.chain().focus().setParagraph().run(), active: editor.isActive("paragraph"), className: "text-sm" },
//               { label: "Heading 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), className: "text-xl font-bold" },
//               { label: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), className: "text-lg font-bold" },
//               { label: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), className: "text-base font-bold" },
//             ].map((item) => (
//               <button
//                 key={item.label}
//                 onClick={() => { item.action(); setShowHeadingMenu(false); }}
//                 className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${item.className} ${item.active ? "bg-purple-50 text-purple-700" : ""}`}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Text Formatting */}
//       <div className="flex gap-1 px-2 border-r border-gray-300">
//         <ToolbarButton icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} disabled={!editor.can().chain().focus().toggleBold().run()} title="Bold (Ctrl+B)" />
//         <ToolbarButton icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} disabled={!editor.can().chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)" />
//         <ToolbarButton icon={UnderlineIcon} onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline (Ctrl+U)" />
//         <ToolbarButton icon={Strikethrough} onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough" />
//         <ToolbarButton icon={Code} onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} disabled={!editor.can().chain().focus().toggleCode().run()} title="Inline Code" />
//       </div>

//       {/* Text Alignment */}
//       <div className="flex gap-1 px-2 border-r border-gray-300">
//         <ToolbarButton icon={AlignLeft} onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Align Left" />
//         <ToolbarButton icon={AlignCenter} onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Align Center" />
//         <ToolbarButton icon={AlignRight} onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Align Right" />
//         <ToolbarButton icon={AlignJustify} onClick={() => editor.chain().focus().setTextAlign("justify").run()} isActive={editor.isActive({ textAlign: "justify" })} title="Justify" />
//       </div>

//       {/* Lists */}
//       <div className="flex gap-1 px-2 border-r border-gray-300">
//         <ToolbarButton icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List" />
//         <ToolbarButton icon={ListOrdered} onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List" />
//         <ToolbarButton icon={ListTodo} onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")} title="Task List" />
//       </div>

//       {/* Additional */}
//       <div className="flex gap-1 px-2 border-r border-gray-300">
//         <ToolbarButton icon={Quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Blockquote" />
//         <ToolbarButton icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule" />
//       </div>

//       {/* Link & Colors */}
//       <div className="flex gap-1 px-2 relative">
//         <ToolbarButton icon={Link2} onClick={setLink} isActive={editor.isActive("link")} title="Insert/Edit Link" />
//         <div className="relative">
//           <ToolbarButton icon={Palette} onClick={() => setShowColorPicker(!showColorPicker)} title="Text & Highlight Color" />
//           {showColorPicker && (
//             <ColorPicker editor={editor} onClose={() => setShowColorPicker(false)} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ========================
// // TIPTAP EDITOR COMPONENT
// // ========================
// type TiptapEditorProps = {
//   content?: string;
//   onChange?: (html: string) => void;
//   placeholder?: string;
// };

// export default function TiptapEditor({
//   content = "",
//   onChange,
//   placeholder,
// }: TiptapEditorProps) {
//   const editor = useEditor({
//     immediatelyRender: false,
//     extensions: [
//       StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
//       Underline,
//       TextAlign.configure({ types: ["heading", "paragraph"] }),
//       Link.configure({
//         openOnClick: false,
//         HTMLAttributes: {
//           class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
//         },
//       }),
//       TextStyle,
//       Color,
//       Highlight.configure({ multicolor: true }),
//       TaskList,
//       TaskItem.configure({ nested: true }),
//       Superscript,
//       Subscript,
//     ],
//     // ✅ Start with empty string — external content is synced via the useEffect below
//     content: "",
//     onUpdate: ({ editor }) => {
//       onChange?.(editor.getHTML());
//     },
//     editorProps: {
//       attributes: {
//         class:
//           "prose prose-sm max-w-none focus:outline-none min-h-[250px] tiptap-editor",
//         ...(placeholder ? { "data-placeholder": placeholder } : {}),
//       },
//     },
//   });

//   // ✅ THE CORE FIX:
//   // Tiptap's useEditor only reads `content` once on mount.
//   // When product data loads asynchronously, `content` prop changes but the
//   // editor doesn't know. We watch `content` and call setContent() — but ONLY
//   // when the editor is not focused (i.e. user is not actively typing),
//   // which prevents cursor-jumping during normal editing.
//   useEffect(() => {
//     if (!editor) return;

//     // Skip if user is currently typing — don't disturb their cursor
//     if (editor.isFocused) return;

//     const currentHTML = editor.getHTML();

//     // ✅ Only update if incoming content is meaningfully different
//     // Avoids infinite loop: onChange → setFieldsValue → useWatch → content prop → setContent
//     if (content !== currentHTML) {
//       // false = do NOT emit onUpdate, preventing the loop
//       editor.commands.setContent(content);
//     }
//   }, [content, editor]);

//   return (
//     <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
//       <MenuBar editor={editor} />
//       <div className="p-4">
//         <EditorContent editor={editor} />
//       </div>
//       <style jsx global>{`
//         .tiptap-editor :first-child { margin-top: 0; }
//         .tiptap-editor ul, .tiptap-editor ol { padding: 0 1rem; margin: 1.25rem 1rem 1.25rem 0.4rem; }
//         .tiptap-editor ul li p, .tiptap-editor ol li p { margin-top: 0.25em; margin-bottom: 0.25em; }
//         .tiptap-editor h1, .tiptap-editor h2, .tiptap-editor h3,
//         .tiptap-editor h4, .tiptap-editor h5, .tiptap-editor h6 { line-height: 1.1; margin-top: 2.5rem; text-wrap: pretty; }
//         .tiptap-editor h1, .tiptap-editor h2 { margin-top: 3.5rem; margin-bottom: 1.5rem; }
//         .tiptap-editor h1 { font-size: 1.8rem; font-weight: bold; }
//         .tiptap-editor h2 { font-size: 1.4rem; font-weight: bold; }
//         .tiptap-editor h3 { font-size: 1.2rem; font-weight: bold; }
//         .tiptap-editor h4, .tiptap-editor h5, .tiptap-editor h6 { font-size: 1rem; font-weight: bold; }
//         .tiptap-editor code { background-color: #f3f4f6; border-radius: 0.4rem; color: #1f2937; font-size: 0.85rem; padding: 0.25em 0.3em; font-family: "Monaco", "Courier New", monospace; }
//         .tiptap-editor pre { background: #1f2937; border-radius: 0.5rem; color: #f9fafb; font-family: "Monaco", "Courier New", monospace; margin: 1.5rem 0; padding: 0.75rem 1rem; }
//         .tiptap-editor pre code { background: none; color: inherit; font-size: 0.8rem; padding: 0; }
//         .tiptap-editor blockquote { border-left: 3px solid #9333ea; margin: 1.5rem 0; padding-left: 1rem; font-style: italic; }
//         .tiptap-editor hr { border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
//         .tiptap-editor ul[data-type="taskList"] { list-style: none; padding: 0; }
//         .tiptap-editor ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
//         .tiptap-editor ul[data-type="taskList"] li > label { flex: 0 0 auto; margin-top: 0.2rem; user-select: none; }
//         .tiptap-editor ul[data-type="taskList"] li > div { flex: 1 1 auto; }
//         .tiptap-editor ul[data-type="taskList"] input[type="checkbox"] { cursor: pointer; }
//         .tiptap-editor mark { padding: 0.125em 0.25em; border-radius: 0.25em; }
//         .tiptap-editor a { color: #2563eb; text-decoration: underline; cursor: pointer; }
//         .tiptap-editor a:hover { color: #1d4ed8; }
//         .tiptap-editor.is-empty::before,
//         .tiptap-editor p.is-empty:first-child::before { content: attr(data-placeholder); float: left; color: #adb5bd; pointer-events: none; height: 0; }
//       `}</style>
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  useEditor,
  EditorContent,
  Node,
  mergeAttributes,
  Extension,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TiptapImage from "@tiptap/extension-image";
import {
  Undo2,
  Redo2,
  Bold,
  Underline as UnderlineIcon,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListTodo,
  Link2,
  Palette,
  Code,
  Quote,
  Minus,
  ChevronDown,
  Image as ImageIcon,
  MousePointerClick,
} from "lucide-react";

// ========================
// CUSTOM EXTENSION: CTA BUTTON
// ========================
// Renders an inline, atomic "button" node with configurable text + href.
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ctaButton: {
      setCtaButton: (attrs: { text: string; href: string }) => ReturnType;
    };
    backgroundColor: {
      setBackgroundColor: (color: string) => ReturnType;
      unsetBackgroundColor: () => ReturnType;
    };
  }
}

const CtaButton = Node.create({
  name: "ctaButton",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      text: {
        default: "Click Here",
        parseHTML: (element) =>
          element.getAttribute("data-cta-text") || element.textContent,
        renderHTML: (attributes) => ({ "data-cta-text": attributes.text }),
      },
      href: {
        default: "#",
        parseHTML: (element) => element.getAttribute("href"),
        renderHTML: (attributes) => ({ href: attributes.href }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "a[data-cta-button]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-cta-button": "true",
        target: "_blank",
        rel: "noopener noreferrer",
        class: "cta-button-node",
        contenteditable: "false",
      }),
      node.attrs.text,
    ];
  },

  addCommands() {
    return {
      setCtaButton:
        (attrs: { text: string; href: string }) =>
        ({ chain }: any) => {
          return chain().insertContent({ type: this.name, attrs }).run();
        },
    };
  },
});

// ========================
// CUSTOM EXTENSION: BACKGROUND COLOR (block-level)
// ========================
const BackgroundColor = Extension.create({
  name: "backgroundColor",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.style.backgroundColor || null,
            renderHTML: (attributes: any) => {
              if (!attributes.backgroundColor) return {};
              return {
                style: `background-color: ${attributes.backgroundColor}; padding: 0.5rem 0.75rem; border-radius: 0.375rem; display: block;`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setBackgroundColor:
        (color: string) =>
        ({ chain, state }: any) => {
          const { selection } = state;
          const type = selection.$from.parent.type.name;
          if (!["paragraph", "heading", "blockquote"].includes(type)) {
            return false;
          }
          return chain()
            .updateAttributes(type, { backgroundColor: color })
            .run();
        },
      unsetBackgroundColor:
        () =>
        ({ chain, state }: any) => {
          const { selection } = state;
          const type = selection.$from.parent.type.name;
          if (!["paragraph", "heading", "blockquote"].includes(type)) {
            return false;
          }
          return chain()
            .updateAttributes(type, { backgroundColor: null })
            .run();
        },
    };
  },
});

// ========================
// TOOLBAR BUTTON
// ========================
const ToolbarButton = ({
  icon: Icon,
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  icon?: any;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children?: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors inline-flex items-center justify-center ${
      isActive
        ? "bg-purple-100 text-purple-700"
        : "text-gray-600 hover:bg-gray-100"
    } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {Icon && <Icon size={18} />}
    {children}
  </button>
);

// ========================
// COLOR PICKER (text / highlight / block background)
// ========================
const ColorPicker = ({
  editor,
  onClose,
}: {
  editor: any;
  onClose: () => void;
}) => {
  const colors = [
    { name: "Red", text: "#dc2626", highlight: "#fca5a5" },
    { name: "Orange", text: "#ea580c", highlight: "#fdba74" },
    { name: "Yellow", text: "#ca8a04", highlight: "#fde047" },
    { name: "Green", text: "#16a34a", highlight: "#86efac" },
    { name: "Blue", text: "#2563eb", highlight: "#93c5fd" },
    { name: "Purple", text: "#9333ea", highlight: "#d8b4fe" },
    { name: "Pink", text: "#db2777", highlight: "#f9a8d4" },
    { name: "Black", text: "#000000", highlight: "#e5e5e5" },
  ];

  const backgroundColors = [
    { name: "Soft Red", value: "#fee2e2" },
    { name: "Soft Orange", value: "#ffedd5" },
    { name: "Soft Yellow", value: "#fef9c3" },
    { name: "Soft Green", value: "#dcfce7" },
    { name: "Soft Blue", value: "#dbeafe" },
    { name: "Soft Purple", value: "#f3e8ff" },
    { name: "Soft Pink", value: "#fce7f3" },
    { name: "Soft Gray", value: "#f3f4f6" },
  ];

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-[280px]">
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Text Color</h4>
        <div className="grid grid-cols-8 gap-1">
          {colors.map((color) => (
            <button
              type="button"
              key={`text-${color.name}`}
              onClick={() => {
                editor.chain().focus().setColor(color.text).run();
                onClose();
              }}
              className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color.text }}
              title={`${color.name} Text`}
            />
          ))}
        </div>
      </div>
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">
          Highlight Color
        </h4>
        <div className="grid grid-cols-8 gap-1">
          {colors.map((color) => (
            <button
              type="button"
              key={`highlight-${color.name}`}
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: color.highlight })
                  .run();
                onClose();
              }}
              className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color.highlight }}
              title={`${color.name} Highlight`}
            />
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-2">
          Background Color (Block)
        </h4>
        <div className="grid grid-cols-8 gap-1">
          {backgroundColors.map((color) => (
            <button
              type="button"
              key={`bg-${color.name}`}
              onClick={() => {
                editor.chain().focus().setBackgroundColor(color.value).run();
                onClose();
              }}
              className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
              title={`${color.name} Background`}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().unsetColor().unsetHighlight().run();
            onClose();
          }}
          className="text-xs text-gray-600 hover:text-gray-900 w-full text-center"
        >
          Clear Text/Highlight Colors
        </button>
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().unsetBackgroundColor().run();
            onClose();
          }}
          className="text-xs text-gray-600 hover:text-gray-900 w-full text-center"
        >
          Clear Background Color
        </button>
      </div>
    </div>
  );
};

// ========================
// CTA BUTTON POPOVER
// ========================
const CtaButtonPopover = ({
  editor,
  onClose,
}: {
  editor: any;
  onClose: () => void;
}) => {
  const [text, setText] = useState("Click Here");
  const [href, setHref] = useState("https://");

  const handleInsert = () => {
    if (!text.trim() || !href.trim()) return;
    editor
      .chain()
      .focus()
      .setCtaButton({ text: text.trim(), href: href.trim() })
      .run();
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-[260px]">
      <h4 className="text-xs font-semibold text-gray-700 mb-2">
        Insert CTA Button
      </h4>
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Learn More"
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">
            Destination URL
          </label>
          <input
            type="text"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://example.com"
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleInsert}
          disabled={!text.trim() || !href.trim()}
          className="text-xs bg-purple-600 text-white rounded px-3 py-1 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Insert
        </button>
      </div>
    </div>
  );
};

// ========================
// MENU BAR
// ========================
const MenuBar = ({
  editor,
  onImageUpload,
}: {
  editor: any;
  onImageUpload?: (file: File) => Promise<string>;
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showCtaPopover, setShowCtaPopover] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setIsUploadingImage(true);
    try {
      let src: string;
      if (onImageUpload) {
        // Delegate to a real upload handler if the parent provides one
        src = await onImageUpload(file);
      } else {
        // Fallback: embed the image inline as base64
        src = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      }
      editor.chain().focus().setImage({ src, alt: file.name }).run();
    } catch (err) {
      console.error("Image insert failed:", err);
      window.alert("Failed to insert image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
      {/* Undo/Redo */}
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <ToolbarButton
          icon={Undo2}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          icon={Redo2}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
        />
      </div>

      {/* Headings Dropdown */}
      <div className="relative px-2 border-r border-gray-300">
        <button
          type="button"
          onClick={() => setShowHeadingMenu(!showHeadingMenu)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
        >
          {editor.isActive("heading", { level: 1 })
            ? "H1"
            : editor.isActive("heading", { level: 2 })
            ? "H2"
            : editor.isActive("heading", { level: 3 })
            ? "H3"
            : "Normal"}
          <ChevronDown size={14} />
        </button>
        {showHeadingMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
            {[
              {
                label: "Normal",
                action: () => editor.chain().focus().setParagraph().run(),
                active: editor.isActive("paragraph"),
                className: "text-sm",
              },
              {
                label: "Heading 1",
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run(),
                active: editor.isActive("heading", { level: 1 }),
                className: "text-xl font-bold",
              },
              {
                label: "Heading 2",
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run(),
                active: editor.isActive("heading", { level: 2 }),
                className: "text-lg font-bold",
              },
              {
                label: "Heading 3",
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run(),
                active: editor.isActive("heading", { level: 3 }),
                className: "text-base font-bold",
              },
            ].map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => {
                  item.action();
                  setShowHeadingMenu(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                  item.className
                } ${item.active ? "bg-purple-50 text-purple-700" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text Formatting */}
      <div className="flex gap-1 px-2 border-r border-gray-300">
        <ToolbarButton
          icon={Bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={Italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={UnderlineIcon}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={Strikethrough}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        />
        <ToolbarButton
          icon={Code}
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          title="Inline Code"
        />
      </div>

      {/* Text Alignment */}
      <div className="flex gap-1 px-2 border-r border-gray-300">
        <ToolbarButton
          icon={AlignLeft}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        />
        <ToolbarButton
          icon={AlignCenter}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        />
        <ToolbarButton
          icon={AlignRight}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        />
        <ToolbarButton
          icon={AlignJustify}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        />
      </div>

      {/* Lists */}
      <div className="flex gap-1 px-2 border-r border-gray-300">
        <ToolbarButton
          icon={List}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        />
        <ToolbarButton
          icon={ListOrdered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        />
        <ToolbarButton
          icon={ListTodo}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          title="Task List"
        />
      </div>

      {/* Additional */}
      <div className="flex gap-1 px-2 border-r border-gray-300">
        <ToolbarButton
          icon={Quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        />
        <ToolbarButton
          icon={Minus}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        />
      </div>

      {/* Media & CTA */}
      <div className="flex gap-1 px-2 border-r border-gray-300 relative">
        <ToolbarButton
          icon={ImageIcon}
          onClick={handleImageButtonClick}
          disabled={isUploadingImage}
          title={isUploadingImage ? "Uploading image..." : "Insert Image"}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFileSelected}
          className="hidden"
        />
        <div className="relative">
          <ToolbarButton
            icon={MousePointerClick}
            onClick={() => setShowCtaPopover(!showCtaPopover)}
            isActive={editor.isActive("ctaButton")}
            title="Insert CTA Button"
          />
          {showCtaPopover && (
            <CtaButtonPopover
              editor={editor}
              onClose={() => setShowCtaPopover(false)}
            />
          )}
        </div>
      </div>

      {/* Link & Colors */}
      <div className="flex gap-1 px-2 relative">
        <ToolbarButton
          icon={Link2}
          onClick={setLink}
          isActive={editor.isActive("link")}
          title="Insert/Edit Link"
        />
        <div className="relative">
          <ToolbarButton
            icon={Palette}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text, Highlight & Background Color"
          />
          {showColorPicker && (
            <ColorPicker
              editor={editor}
              onClose={() => setShowColorPicker(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ========================
// TIPTAP EDITOR COMPONENT
// ========================
type TiptapEditorProps = {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  // Optional real upload handler (e.g. upload to S3/CDN and return the public URL).
  // If omitted, images are embedded inline as base64 data URLs.
  onImageUpload?: (file: File) => Promise<string>;
};

export default function TiptapEditor({
  content = "",
  onChange,
  placeholder,
  onImageUpload,
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Superscript,
      Subscript,
      TiptapImage.configure({
        HTMLAttributes: { class: "tiptap-image" },
        allowBase64: true,
      }),
      CtaButton,
      BackgroundColor,
    ],
    // ✅ Start with empty string — external content is synced via the useEffect below
    content: "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[250px] tiptap-editor",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
  });

  // ✅ THE CORE FIX:
  // Tiptap's useEditor only reads `content` once on mount.
  // When product data loads asynchronously, `content` prop changes but the
  // editor doesn't know. We watch `content` and call setContent() — but ONLY
  // when the editor is not focused (i.e. user is not actively typing),
  // which prevents cursor-jumping during normal editing.
  useEffect(() => {
    if (!editor) return;

    // Skip if user is currently typing — don't disturb their cursor
    if (editor.isFocused) return;

    const currentHTML = editor.getHTML();

    // ✅ Only update if incoming content is meaningfully different
    // Avoids infinite loop: onChange → setFieldsValue → useWatch → content prop → setContent
    if (content !== currentHTML) {
      // false = do NOT emit onUpdate, preventing the loop
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .tiptap-editor :first-child {
          margin-top: 0;
        }
        .tiptap-editor ul,
        .tiptap-editor ol {
          padding: 0 1rem;
          margin: 1.25rem 1rem 1.25rem 0.4rem;
        }
        .tiptap-editor ul li p,
        .tiptap-editor ol li p {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
        .tiptap-editor h1,
        .tiptap-editor h2,
        .tiptap-editor h3,
        .tiptap-editor h4,
        .tiptap-editor h5,
        .tiptap-editor h6 {
          line-height: 1.1;
          margin-top: 2.5rem;
          text-wrap: pretty;
        }
        .tiptap-editor h1,
        .tiptap-editor h2 {
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
        }
        .tiptap-editor h1 {
          font-size: 1.8rem;
          font-weight: bold;
        }
        .tiptap-editor h2 {
          font-size: 1.4rem;
          font-weight: bold;
        }
        .tiptap-editor h3 {
          font-size: 1.2rem;
          font-weight: bold;
        }
        .tiptap-editor h4,
        .tiptap-editor h5,
        .tiptap-editor h6 {
          font-size: 1rem;
          font-weight: bold;
        }
        .tiptap-editor code {
          background-color: #f3f4f6;
          border-radius: 0.4rem;
          color: #1f2937;
          font-size: 0.85rem;
          padding: 0.25em 0.3em;
          font-family: "Monaco", "Courier New", monospace;
        }
        .tiptap-editor pre {
          background: #1f2937;
          border-radius: 0.5rem;
          color: #f9fafb;
          font-family: "Monaco", "Courier New", monospace;
          margin: 1.5rem 0;
          padding: 0.75rem 1rem;
        }
        .tiptap-editor pre code {
          background: none;
          color: inherit;
          font-size: 0.8rem;
          padding: 0;
        }
        .tiptap-editor blockquote {
          border-left: 3px solid #9333ea;
          margin: 1.5rem 0;
          padding-left: 1rem;
          font-style: italic;
        }
        .tiptap-editor hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        .tiptap-editor ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .tiptap-editor ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .tiptap-editor ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-top: 0.2rem;
          user-select: none;
        }
        .tiptap-editor ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
        .tiptap-editor ul[data-type="taskList"] input[type="checkbox"] {
          cursor: pointer;
        }
        .tiptap-editor mark {
          padding: 0.125em 0.25em;
          border-radius: 0.25em;
        }
        .tiptap-editor a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        .tiptap-editor a:hover {
          color: #1d4ed8;
        }
        .tiptap-editor.is-empty::before,
        .tiptap-editor p.is-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        /* Images inserted via the editor */
        .tiptap-editor img.tiptap-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
        }
        .tiptap-editor img.tiptap-image.ProseMirror-selectednode {
          outline: 3px solid #9333ea;
          outline-offset: 2px;
        }

        /* CTA button node */
        .tiptap-editor a.cta-button-node {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.25rem;
          margin: 0 0.25rem;
          background-color: #7c3aed;
          color: #ffffff !important;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none !important;
          cursor: pointer;
          user-select: none;
        }
        .tiptap-editor a.cta-button-node:hover {
          background-color: #6d28d9;
        }
        .tiptap-editor a.cta-button-node.ProseMirror-selectednode {
          outline: 2px solid #4c1d95;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
