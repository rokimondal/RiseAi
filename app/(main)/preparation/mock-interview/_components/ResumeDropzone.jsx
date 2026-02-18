"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extractResumeText } from "@/app/lib/helper";

export default function ResumeDropzone({ onUpload }) {

    const [file, setFile] = useState(null);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {

        if (rejectedFiles.length > 0) {
            toast.error("Invalid file type");
            return;
        }

        const selectedFile = acceptedFiles[0];

        if (!selectedFile) return;

        setFile(selectedFile);

    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({

        onDrop,

        multiple: false,

        maxFiles: 1,

        accept: {
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "text/plain": [".txt"],
            "application/json": [".json"],
            "text/html": [".html"],
        },

    });

    async function handleUpload() {

        if (!file) {
            toast.error("Please select a resume first");
            return;
        }
        onUpload(file);

    }

    return (
        <div className="space-y-4">

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
          w-full border-2 border-gray-500 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition h-52 flex flex-col items-center justify-center
          ${isDragActive
                        ? "bg-gray-100 border-gray-600"
                        : "hover:bg-secondary"
                    }
        `}
            >

                <input {...getInputProps()} />

                {isDragActive ? (

                    <p className="text-primary font-medium">
                        Drop your resume here...
                    </p>

                ) : (

                    <>
                        <CloudUpload className="w-8 h-8 mb-2 text-muted-foreground" />

                        <p className="font-medium">
                            Drag & drop your resume
                        </p>

                        <p className="text-sm text-muted-foreground">
                            or click to browse
                        </p>

                        <p className="text-xs text-muted-foreground mt-2">
                            PDF, DOC, DOCX, TXT, JSON, HTML
                        </p>
                    </>

                )}

            </div>

            {/* Selected file */}
            {file && (

                <div className="flex items-center gap-2 text-sm">

                    <FileText className="w-5 h-5" />

                    <span className="truncate">
                        {file.name}
                    </span>

                </div>

            )}

            {/* Upload button */}
            <Button
                variant=""
                className="w-full md:w-fit ml-auto flex items-center gap-2 p-5"
                onClick={handleUpload}
            >
                <CloudUpload className="w-5 h-5" />
                Upload Resume
            </Button>

        </div>
    );
}