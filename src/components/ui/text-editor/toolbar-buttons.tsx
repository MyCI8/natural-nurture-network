
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Table as TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarButtonsProps {
  editor: Editor;
  addImage: () => void;
  addTable: () => void;
}

export const ToolbarButtons = ({
  editor,
  addImage,
  addTable,
}: ToolbarButtonsProps) => {
  const iconSize = 14;
  
  const toolbarButtonClass = cn(
    "p-1 rounded hover:bg-accent touch-manipulation",
    "transition-colors duration-200 ease-in-out flex items-center justify-center"
  );

  const isActive = (callback: () => boolean) => {
    return callback() ? "bg-accent text-accent-foreground" : "text-muted-foreground";
  };

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(toolbarButtonClass, isActive(() => editor.isActive("bold")))}
        title="Bold"
      >
        <Bold size={iconSize} />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(toolbarButtonClass, isActive(() => editor.isActive("italic")))}
        title="Italic"
      >
        <Italic size={iconSize} />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(toolbarButtonClass, isActive(() => editor.isActive("bulletList")))}
        title="Bullet List"
      >
        <List size={iconSize} />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(toolbarButtonClass, isActive(() => editor.isActive("orderedList")))}
        title="Ordered List"
      >
        <ListOrdered size={iconSize} />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={cn(toolbarButtonClass, isActive(() => editor.isActive({ textAlign: "left" })))}
        title="Align Left"
      >
        <AlignLeft size={iconSize} />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={cn(toolbarButtonClass, isActive(() => editor.isActive({ textAlign: "center" })))}
        title="Align Center"
      >
        <AlignCenter size={iconSize} />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={cn(toolbarButtonClass, isActive(() => editor.isActive({ textAlign: "right" })))}
        title="Align Right"
      >
        <AlignRight size={iconSize} />
      </button>
      
      <button
        type="button"
        onClick={addImage}
        className={toolbarButtonClass}
        title="Add Image"
      >
        <ImageIcon size={iconSize} />
      </button>
      
      <button
        type="button"
        onClick={addTable}
        className={toolbarButtonClass}
        title="Add Table"
      >
        <TableIcon size={iconSize} />
      </button>
    </div>
  );
};
