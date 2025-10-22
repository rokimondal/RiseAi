'use client'

import Editor from "./Editor"
import Toolbar from "./Toolbar"


const ResumeBuilder = ({ initialContent }) => {
    return (
        <div >
            <Toolbar />
            <Editor initialContent={initialContent} />
        </div>
    )
}

export default ResumeBuilder