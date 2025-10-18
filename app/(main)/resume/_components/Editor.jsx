'use client'

import { ListKit, TaskItem, TaskList } from '@tiptap/extension-list'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Dropcursor } from '@tiptap/extensions'
import 'tiptap-extension-resizable-image/styles.css';
import { ResizableImage } from 'tiptap-extension-resizable-image'
import { useEditorStore } from '@/store/use-editor-store'
import Underline from '@tiptap/extension-underline'
import { TextStyle, FontFamily, FontSize, LineHeight } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Ruler from './Ruler'




const Editor = () => {

    const { setEditor } = useEditorStore();

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
                style: "padding-left: 56px; padding-right: 56px;",
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
        content: `
      <table>
  <tbody>
    <tr>
      <th>Name</th>
      <th colspan="3">Description</th>
    </tr>
    <tr>
      <td>Cyndi Lauper</td>
      <td>Singer</td>
      <td>Songwriter</td>
      <td>Actress</td>
      </tr>
  </tbody>
</table>
`,
        immediatelyRender: false,
    })
    return (
        <div className='size-full overflow-x-auto px-4 print:p-0 print:bg-white print:overflow-visible'>
            <Ruler />
            <div className='min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0'>
                <EditorContent
                    className="tiptap-light"
                    editor={editor}
                />
            </div>
        </div>
    )
}

export default Editor