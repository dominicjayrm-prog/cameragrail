'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function Editor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'nofollow noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({ inline: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose-cg max-w-none focus:outline-none',
        'data-placeholder': placeholder ?? 'Start writing…',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // Avoid SSR hydration warnings from immediate Render.
    immediatelyRender: false,
  });

  // Keep the editor in sync if the parent resets the value externally.
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="bg-white border border-line rounded-card p-4 text-slate text-sm">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-card overflow-hidden">
      <Toolbar editor={editor} />
      <BubbleMenu
        editor={editor}
        className="flex gap-1 bg-navy text-white rounded-[10px] px-1.5 py-1 shadow-lift"
      >
        <BubbleButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          B
        </BubbleButton>
        <BubbleButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <em>i</em>
        </BubbleButton>
        <BubbleButton
          onClick={() => promptLink(editor)}
          active={editor.isActive('link')}
        >
          link
        </BubbleButton>
      </BubbleMenu>
      <div className="px-5 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

interface EditorInstance {
  chain: () => {
    focus: () => {
      toggleBold: () => { run: () => void };
      toggleItalic: () => { run: () => void };
      toggleHeading: (attrs: { level: 1 | 2 | 3 }) => { run: () => void };
      toggleBulletList: () => { run: () => void };
      toggleOrderedList: () => { run: () => void };
      toggleBlockquote: () => { run: () => void };
      setLink: (attrs: { href: string }) => { run: () => void };
      unsetLink: () => { run: () => void };
      setImage: (attrs: { src: string; alt: string }) => { run: () => void };
    };
  };
  isActive: (name: string, attrs?: object) => boolean;
}

function Toolbar({ editor }: { editor: EditorInstance }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line bg-paper px-3 py-2 text-sm">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
      >
        H2
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
      >
        H3
      </ToolbarBtn>
      <Sep />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
      >
        Bold
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
      >
        Italic
      </ToolbarBtn>
      <Sep />
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
      >
        • List
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
      >
        1. List
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
      >
        Quote
      </ToolbarBtn>
      <Sep />
      <ToolbarBtn onClick={() => promptLink(editor)} active={editor.isActive('link')}>
        Link
      </ToolbarBtn>
      <ToolbarBtn onClick={() => promptImage(editor)}>Image</ToolbarBtn>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
        active ? 'bg-navy text-white' : 'text-slate hover:bg-white hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px bg-line mx-1 self-stretch" />;
}

function BubbleButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded ${
        active ? 'bg-white text-navy' : 'text-white hover:bg-white/15'
      }`}
    >
      {children}
    </button>
  );
}

function promptLink(editor: EditorInstance) {
  const existing = window.prompt('URL (leave empty to unlink)');
  if (existing === null) return;
  if (existing === '') {
    editor.chain().focus().unsetLink().run();
    return;
  }
  editor.chain().focus().setLink({ href: existing }).run();
}

function promptImage(editor: EditorInstance) {
  const src = window.prompt('Image URL');
  if (!src) return;
  const alt = window.prompt('Alt text (describe the image)') ?? '';
  editor.chain().focus().setImage({ src, alt }).run();
}
