import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Undo,
  Redo,
  Smile,
} from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// Emoji palette grouped by category
const EMOJI_CATEGORIES = [
  {
    label: "📚 Học tập",
    emojis: ["📚", "📖", "📝", "✏️", "🖊️", "📌", "📎", "🗒️", "📋", "🗂️", "📐", "📏", "🔍", "💡", "🧠"],
  },
  {
    label: "🎯 Mục tiêu",
    emojis: ["🎯", "✅", "☑️", "✔️", "🏆", "🥇", "🎖️", "⭐", "🌟", "💪", "🚀", "🔥", "💥", "🎉", "🎊"],
  },
  {
    label: "💬 Giao tiếp",
    emojis: ["💬", "🗣️", "👂", "🤝", "👏", "🙋", "💁", "🤔", "😊", "😄", "🥳", "😎", "🤩", "👍", "❤️"],
  },
  {
    label: "⏰ Thời gian",
    emojis: ["⏰", "🕐", "📅", "🗓️", "⌛", "⏳", "🔔", "📢", "📣", "🔖", "🏫", "🏠", "💻", "📱", "🌐"],
  },
  {
    label: "🔤 Ngôn ngữ",
    emojis: ["🔤", "🔡", "🔠", "🅰️", "🅱️", "🔢", "💯", "🆗", "🆕", "🆒", "📊", "📈", "📉", "🗺️", "🌍"],
  },
];

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "h-8 w-8 p-0",
      isActive && "bg-accent text-accent-foreground"
    )}
  >
    {children}
  </Button>
);

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "150px",
}: RichTextEditorProps) => {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder || "" }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync external value changes (e.g. when loading a module)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml && !(value === "" && currentHtml === "<p></p>")) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setEmojiOpen(false);
  };

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="In đậm (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Tiêu đề 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Tiêu đề 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Tiêu đề 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Danh sách không thứ tự"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Danh sách có thứ tự"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Trích dẫn"
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Căn trái"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Căn giữa"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Căn phải"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Emoji picker */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Chèn emoji"
              className={cn("h-8 w-8 p-0", emojiOpen && "bg-accent text-accent-foreground")}
            >
              <Smile className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-0 shadow-lg"
            align="start"
            side="bottom"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Category tabs */}
            <div className="flex overflow-x-auto border-b bg-muted/30 scrollbar-hide">
              {EMOJI_CATEGORIES.map((cat, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveCategory(i)}
                  className={cn(
                    "shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors hover:bg-accent",
                    activeCategory === i
                      ? "border-b-2 border-primary text-primary bg-accent"
                      : "text-muted-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="grid grid-cols-8 gap-0.5 p-2">
              {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  title={emoji}
                  className="flex items-center justify-center h-8 w-8 rounded text-lg hover:bg-accent transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0"
      />
    </div>
  );
};
