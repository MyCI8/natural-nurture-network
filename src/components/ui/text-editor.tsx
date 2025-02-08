
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
import { 
  Bold, Italic, Strikethrough, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Quote, Code,
  Table as TableIcon, Image as ImageIcon, Undo, Redo,
  Type
} from "lucide-react";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const fontSizes = [
  'x-small',
  'small',
  'normal',
  'large',
  'x-large',
  'xx-large',
];

const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana'
];

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
            class: 'mb-4',
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
        // Let TipTap handle the paste event by default
        return false;
      },
      transformPastedHTML: (html) => {
        // Preserve line breaks and spacing in pasted content
        return html
          .replace(/<p><br><\/p>/g, '<p>&nbsp;</p>')
          .replace(/<p[^>]*>/g, '<p class="mb-4">');
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
        {/* Undo/Redo */}
        <div className="flex gap-1 mr-2 border-r pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Font Controls */}
        <div className="flex gap-2 border-r pr-2">
          <Select
            value={editor.getAttributes('textStyle').fontFamily}
            onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Font Family" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font}>{font}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const fontSize = window.getComputedStyle(editor.view.dom).fontSize;
                const newSize = fontSize === '16px' ? '20px' : '16px';
                editor.chain().focus().setMark('textStyle', { fontSize: newSize }).run();
              }}
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-1 border-r pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? "bg-muted" : ""}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? "bg-muted" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? "bg-muted" : ""}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? "bg-muted" : ""}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? "bg-muted" : ""}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? "bg-muted" : ""}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? "bg-muted" : ""}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? "bg-muted" : ""}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? "bg-muted" : ""}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? "bg-muted" : ""}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? "bg-muted" : ""}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Other Formatting */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? "bg-muted" : ""}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? "bg-muted" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addTable}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextEditor;
