'use client'

import { saveResume } from "@/actions/resume"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useFetch from "@/hooks/use-fetch"
import { useEditorStore } from "@/store/use-editor-store"
import { ArrowDownToLine, CodeXml, FileJson, FileText, Loader2, SaveIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { FaFilePdf } from "react-icons/fa"
import { toast } from "sonner"

const DownloadButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { editor } = useEditorStore();

    const onDownload = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
    }

    const onSaveJSON = () => {
        if (!editor) return;
        const content = editor.getJSON();
        const blob = new Blob([JSON.stringify(content)], {
            type: "application/json",
        });

        onDownload(blob, 'resume.json');
    }

    const onSaveHTML = () => {
        if (!editor) return;
        const content = editor.getHTML();
        const blob = new Blob([content], {
            type: "text/html",
        });

        onDownload(blob, 'resume.html');
    }

    const onSaveText = () => {
        if (!editor) return;
        const content = editor.getText();
        const blob = new Blob([content], {
            type: "text/plain",
        });

        onDownload(blob, 'resume.txt');
    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                    {!isLoading && <ArrowDownToLine size={16} />}
                    {isLoading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="">
                <DropdownMenuItem onClick={onSaveJSON} disabled={isLoading}>
                    <FileJson />JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSaveHTML} disabled={isLoading}>
                    <CodeXml /> HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { window.print() }} disabled={isLoading}>
                    <FaFilePdf /> PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSaveText} disabled={isLoading}>
                    <FileText /> Text
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const SaveButton = () => {

    const { editor } = useEditorStore()

    const { loading: savingResume, fn: saveRsumeFn, data: saveResumeData } = useFetch(saveResume)

    const onSubmit = async () => {
        if (!editor) return;

        const content = editor.getHTML();

        try {
            await saveRsumeFn(content);
        } catch (error) {
            console.error("Improving resume error: ", error.message);
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (saveResumeData?.success && !savingResume) {
            toast.success("Resume saved successfully!");
            console.log(saveResumeData);
        }
    }, [savingResume, saveResumeData])

    return (
        <Button
            variant="outline"
            onClick={onSubmit}
            disabled={!editor || savingResume}
            className="flex items-center gap-2"
        >
            {!savingResume && <SaveIcon size={16} />}
            {savingResume && <Loader2 className="h-4 w-4 animate-spin" />}
        </Button>
    )
}

export { DownloadButton, SaveButton }