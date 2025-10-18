'use client'

import Editor from "./Editor"
import Toolbar from "./Toolbar"


const ResumeBuilder = ({ initialContent }) => {
    return (
        <div >
            <Toolbar initialContent={initialContent} />
            <Editor />
        </div>
    )
}

export default ResumeBuilder