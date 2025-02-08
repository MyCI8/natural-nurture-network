
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

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TextEditor = ({ content, onChange }: TextEditorProps) => {
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
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4",
      },
      handlePaste: (view, event) => {
        return false;
      },
      transformPastedHTML: (html) => {
        return html
          .replace(/<p><br><\/p>/g, '<p>&nbsp;</p>')
          .replace(/<p[^>]*>/g, '<p class="mb-4 leading-relaxed">')
          .replace(/<h1[^>]*>/g, '<h1 class="text-4xl font-bold mb-6 leading-tight">')
          .replace(/<h2[^>]*>/g, '<h2 class="text-3xl font-bold mb-5 leading-tight mt-8">')
          .replace(/<h3[^>]*>/g, '<h3 class="text-2xl font-bold mb-4 leading-tight mt-6">');
      },
    },
  });

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      <div className="border-b p-4 flex flex-wrap gap-2">
        <FontControls editor={editor} fontFamilies={fontFamilies} />
        <ToolbarButtons editor={editor} addImage={addImage} addTable={addTable} />
      </div>
      <EditorContent editor={editor} className={editorClasses} />
    </div>
  );
};

export default TextEditor;
