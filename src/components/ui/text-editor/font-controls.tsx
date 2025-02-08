
import { Editor } from '@tiptap/react';
import { Type } from "lucide-react";
import { Button } from "../button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

interface FontControlsProps {
  editor: Editor;
  fontFamilies: string[];
}

export const FontControls = ({ editor, fontFamilies }: FontControlsProps) => {
  return (
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
  );
};
