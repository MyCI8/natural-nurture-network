
import { Editor } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FontControlsProps {
  editor: Editor;
  fontFamilies: Record<string, string>;
}

export const FontControls = ({ editor, fontFamilies }: FontControlsProps) => {
  const headingOptions = [
    { value: "paragraph", label: "Normal" },
    { value: "heading-1", label: "Heading 1" },
    { value: "heading-2", label: "Heading 2" },
    { value: "heading-3", label: "Heading 3" },
  ];

  const getCurrentHeadingLevel = () => {
    if (editor.isActive("heading", { level: 1 })) return "heading-1";
    if (editor.isActive("heading", { level: 2 })) return "heading-2";
    if (editor.isActive("heading", { level: 3 })) return "heading-3";
    return "paragraph";
  };

  const getFontFamily = () => {
    const attributes = editor.getAttributes("textStyle");
    return attributes.fontFamily || "";
  };

  return (
    <div className="flex gap-1 items-center mr-1">
      <Select
        value={getCurrentHeadingLevel()}
        onValueChange={(value) => {
          if (value === "paragraph") {
            editor.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(value.split("-")[1], 10) as 1 | 2 | 3;
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
      >
        <SelectTrigger className="h-7 w-24 text-xs bg-background">
          <SelectValue placeholder="Style" />
        </SelectTrigger>
        <SelectContent className="bg-popover/100 border shadow-lg">
          {headingOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-accent focus:bg-accent text-xs"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={getFontFamily()}
        onValueChange={(value) => {
          if (value === "") {
            editor.chain().focus().unsetFontFamily().run();
          } else {
            editor.chain().focus().setFontFamily(value).run();
          }
        }}
      >
        <SelectTrigger className="h-7 w-24 text-xs bg-background">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent className="bg-popover/100 border shadow-lg">
          <SelectItem value="" className="hover:bg-accent focus:bg-accent text-xs">
            Default
          </SelectItem>
          {Object.entries(fontFamilies).map(([key, value]) => (
            <SelectItem
              key={key}
              value={value}
              className={cn("hover:bg-accent focus:bg-accent text-xs", {
                "font-sans": value === "Arial, sans-serif",
                "font-serif": value === "Georgia, serif",
                "font-mono": value === "monospace",
              })}
            >
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
