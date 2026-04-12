"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Undo, Redo, ImageIcon
} from 'lucide-react';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: true }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg prose-invert xl:prose-xl mx-auto focus:outline-none min-h-[300px] p-4 text-zinc-300',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Masukkan URL Gambar:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return <div className="min-h-[300px] border border-zinc-800 rounded-xl bg-zinc-950 animate-pulse"></div>;
  }

  const ToolbarButton = ({ onClick, disabled, isActive, icon: Icon, title }: any) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        isActive
          ? 'bg-indigo-500/20 text-indigo-400'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
      } disabled:opacity-50`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex flex-col">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-800 bg-[#11121f]">
        
        <div className="flex items-center gap-1 border-r border-zinc-700/50 pr-2 mr-1">
          <ToolbarButton
            icon={Undo} title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo} title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
          />
        </div>

        <div className="flex items-center gap-1 border-r border-zinc-700/50 pr-2 mr-1">
          <ToolbarButton
            icon={Heading1} title="Heading 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
          />
          <ToolbarButton
            icon={Heading2} title="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          />
          <ToolbarButton
            icon={Heading3} title="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
          />
        </div>

        <div className="flex items-center gap-1 border-r border-zinc-700/50 pr-2 mr-1">
          <ToolbarButton
            icon={Bold} title="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          />
          <ToolbarButton
            icon={Italic} title="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          />
          <ToolbarButton
            icon={UnderlineIcon} title="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
          />
          <ToolbarButton
            icon={Strikethrough} title="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
          />
        </div>

        <div className="flex items-center gap-1 border-r border-zinc-700/50 pr-2 mr-1">
          <ToolbarButton
            icon={AlignLeft} title="Bata Kiri"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
          />
          <ToolbarButton
            icon={AlignCenter} title="Rata Tengah"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
          />
          <ToolbarButton
            icon={AlignRight} title="Rata Kanan"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
          />
          <ToolbarButton
            icon={AlignJustify} title="Justify"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
          />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={List} title="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          />
          <ToolbarButton
            icon={ListOrdered} title="Ordered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          />
          <ToolbarButton
            icon={Quote} title="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          />
          <ToolbarButton
            icon={ImageIcon} title="Insert Image URL"
            onClick={addImage}
          />
        </div>

      </div>

      {/* EDITOR AREA */}
      <div className="flex-1 cursor-text custom-editor-area" onClick={(e) => {
        // Biar gampang click luar ngefokus ke dalam
        if(e.target === e.currentTarget) editor.commands.focus();
      }}>
        <EditorContent editor={editor} />
      </div>

      {/* Global Style for the rich text specifically inside this component so it looks good (Prose fallback) */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-editor-area .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #52525b;
          pointer-events: none;
          height: 0;
        }
        .custom-editor-area .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; color: #f4f4f5; }
        .custom-editor-area .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: #f4f4f5; }
        .custom-editor-area .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: #e4e4e7; }
        .custom-editor-area .ProseMirror p { margin-bottom: 1rem; line-height: 1.6; }
        .custom-editor-area .ProseMirror ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .custom-editor-area .ProseMirror ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
        .custom-editor-area .ProseMirror blockquote { border-left: 3px solid #6366f1; padding-left: 1rem; font-style: italic; color: #a1a1aa; margin-bottom: 1rem; }
        .custom-editor-area .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 1rem; }
        .custom-editor-area .ProseMirror a { color: #818cf8; text-decoration: underline; }
      `}} />
    </div>
  );
}
