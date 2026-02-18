"use client"

import { getResume } from '@/actions/resume'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import useFetch from '@/hooks/use-fetch'
import { FileText, Loader2, Upload } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ResumeDropzone from './ResumeDropzone'
import { extractResumeText, htmlToText } from '@/app/lib/helper'

const ResumeSelector = ({ setResumeContent, setStep }) => {

    const { loading: fetchingResume, fn: fetchResumeFn, data: fetchResumeData } = useFetch(getResume);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const processResume = async () => {
            if (uploadedFile) {
                const uploadContent = await extractResumeText(uploadedFile);
                if (!uploadContent) {
                    toast.error("No resume found");
                    return;
                }
                // console.log(uploadContent);
                toast.success("Resume Uploaded Successfully");
                setResumeContent(uploadContent);
                setStep(4);
                return;
            }
            if (fetchResumeData) {

                const content = fetchResumeData.content;
                let filteredContent = content;
                if (content.includes("<") && content.includes(">")) {
                    filteredContent = await htmlToText(content);
                }
                if (!filteredContent) {
                    toast.error("No saved resume found");
                    return;
                }
                // console.log(filteredContent);
                toast.success("Resume fetched Successfully");
                setResumeContent(filteredContent);
                setStep(4);
            }
        }
        processResume();

    }, [fetchResumeData, uploadedFile])

    const handleFetchResume = async () => {
        try {
            await fetchResumeFn();
        } catch (error) {
            toast.error(error.message || "Failed to fetch resume");
        }
    }

    const handleUpload = async (file) => {
        try {
            setUploadedFile(file);
            setOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to parse resume");
        }
    }
    return (
        <Card className="mx-2">
            <CardHeader>
                <CardTitle>
                    Resume Selection
                </CardTitle>
                <CardDescription>
                    Upload or select a resume to personalize your interview
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col">

                <Button
                    variant="outline"
                    className="w-full flex items-center h-14 gap-2 hover:cursor-pointer text-[15px]"
                    onClick={handleFetchResume}
                    disabled={fetchingResume}
                >
                    {fetchingResume ? (
                        <>
                            <Loader2 className=" h-4 w-4 animate-spin" />
                            Fetching...
                        </>
                    ) : (
                        <>
                            <FileText />
                            Select Saved Resume
                        </>
                    )}
                </Button>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full flex items-center h-14 gap-2 hover:cursor-pointer text-[15px]"
                            disabled={fetchingResume}
                        >
                            <Upload />
                            Upload New Resume
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-2xl sm:max-w-3xl">

                        <DialogHeader>

                            <DialogTitle>
                                Upload New Resume
                            </DialogTitle>

                            <DialogDescription>
                                Drag and drop your resume or click to browse
                            </DialogDescription>

                        </DialogHeader>

                        <ResumeDropzone
                            // uploading={false}
                            onUpload={handleUpload}
                        />

                    </DialogContent>
                </Dialog>

            </CardContent>
        </Card>
    )
}

export default ResumeSelector