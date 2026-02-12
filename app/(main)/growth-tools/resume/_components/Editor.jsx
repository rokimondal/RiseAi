'use client'

import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import 'tiptap-extension-resizable-image/styles.css';
import { ResizableImage } from 'tiptap-extension-resizable-image'
import { useEditorStore } from '@/store/use-editor-store'
import { TextStyle, FontFamily, FontSize, LineHeight } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Ruler from './Ruler'
import { useRef } from 'react'
import { useMarginStore } from '@/store/use-margin-store'




const Editor = ({ initialContent }) => {
    const printRef = useRef(null)

    const { setEditor } = useEditorStore();
    const { marginLeft, marginRight } = useMarginStore();

    const editor = useEditor({
        onCreate({ editor }) {
            setEditor(editor);
        },
        onDestroy() {
            setEditor(null);
        },
        onUpdate({ editor }) {
            setEditor(editor);
        },
        onSelectionUpdate({ editor }) {
            setEditor(editor);
        },
        onFocus({ editor }) {
            setEditor(editor);
        },
        onBlur({ editor }) {
            setEditor(editor);
        },
        onContentError({ editor }) {
            setEditor(editor);
        },
        editorProps: {
            attributes: {
                style: `padding-left: ${marginLeft}px; padding-right: ${marginRight}px;`,
                class: 'focus:outline-none print:border-0 border-2 editor flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text'
            }
        },
        extensions: [
            StarterKit,
            TableKit.configure({ resizable: true }),
            ResizableImage.configure({ defaultWidth: 200, defaultHeight: 200 }),
            FontFamily,
            FontSize,
            TaskList.configure({ nested: true }),
            TaskItem.configure({ nested: true }),
            TextStyle,
            Highlight.configure({ multicolor: true }),
            Color.configure({ types: ["textStyle"] }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            LineHeight,
        ],
        content: initialContent,
        immediatelyRender: false,
    })
    return (
        <div className='size-full overflow-x-auto px-4 print:p-0 print:bg-white print:overflow-visible'>
            <Ruler />
            <div ref={printRef} className='min-w-max flex justify-center w-[816px] py-4 mx-auto print:fixed print:top-0 print:left-0 print:w-full print:min-w-0 print:py-0 print:m-0 '>
                <EditorContent
                    className="tiptap-light"
                    editor={editor}
                />
            </div>
        </div>
    )
}

export default Editor