
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { ToolbarButtons } from "./text-editor/toolbar-buttons";
import { FontControls } from "./text-editor/font-controls";
import { fontFamilies, editorClasses } from "./text-editor/constants";
import { useEffect } from 'react';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

const TextEditor = ({ content, onChange, className }: TextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4 leading-relaxed',
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'font-bold',
          },
        },
      }),
      TextStyle,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none ${className || 'min-h-[200px]'} p-4`,
      },
      // Add parse options inside editorProps to handle pasting rich text
      parseOptions: {
        preserveWhitespace: 'full',
      },
    },
    // These are valid top-level properties
    editable: true,
    injectCSS: true,
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // Override paste event to better handle rich content
  editor.on('paste', ({ event, editor, slice }) => {
    // Allow default paste behavior which includes rich text
    return false;
  });

  return (
    <div className="border rounded-lg">
      <div className="border-b p-4 flex flex-wrap gap-2">
        <FontControls editor={editor} fontFamilies={fontFamilies} />
        <ToolbarButtons 
          editor={editor} 
          addImage={() => {
            const url = window.prompt('Enter image URL');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }} 
          addTable={() => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }} 
        />
      </div>
      <EditorContent editor={editor} className={editorClasses} />
    </div>
  );
};

export default TextEditor;
