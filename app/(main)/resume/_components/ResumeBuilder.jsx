import Editor from "./Editor"
import Toolbar from "./Toolbar"


const ResumeBuilder = ({ initialContent }) => {
    return (
        <div>
            <Toolbar />
            <Editor />
        </div>
    )
}

export default ResumeBuilder