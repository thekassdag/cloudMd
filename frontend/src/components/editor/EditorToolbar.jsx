import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import clsx from 'clsx';

const ToggleButton = ({
    isActive,
    onClick,
    icon: Icon,
    title
}) => (
    <button
        onClick={onClick}
        className={clsx(
            "p-2 rounded hover:bg-gray-100 transition-colors tooltip",
            isActive ? "bg-gray-200 text-gray-900" : "text-gray-500"
        )}
        title={title}
    >
        <Icon className="w-5 h-5" />
    </button>
);

export default function EditorToolbar({ editor, readOnly }) {
    if (!editor) {
        return null;
    }

    if (readOnly) {
        return null; // Render nothing if in read-only mode
    }

    return (
        <div className="border-b border-gray-200 p-2 flex items-center space-x-1 sticky top-0 bg-white z-10 flex-wrap">
            <div className="flex items-center space-x-1 border-r border-gray-200 pr-2 mr-2">
                <ToggleButton
                    onClick={() => editor.chain().focus().undo().run()}
                    isActive={false}
                    icon={Undo}
                    title="Undo"
                />
                <ToggleButton
                    onClick={() => editor.chain().focus().redo().run()}
                    isActive={false}
                    icon={Redo}
                    title="Redo"
                />
            </div>

            <ToggleButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                icon={Bold}
                title="Bold"
            />
            <ToggleButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                icon={Italic}
                title="Italic"
            />
            <ToggleButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                icon={Strikethrough}
                title="Strikethrough"
            />
            <ToggleButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                icon={Code}
                title="Code"
            />

            <div className="w-px h-6 bg-gray-200 mx-2" />

            <ToggleButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                icon={Heading1}
                title="Heading 1"
            />
            <ToggleButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                icon={Heading2}
                title="Heading 2"
            />
            <ToggleButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                icon={Heading3}
                title="Heading 3"
            />

            <div className="w-px h-6 bg-gray-200 mx-2" />

            <ToggleButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                icon={List}
                title="Bullet List"
            />
            <ToggleButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                icon={ListOrdered}
                title="Ordered List"
            />
            <ToggleButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                icon={Quote}
                title="Blockquote"
            />

        </div>
    );
}
