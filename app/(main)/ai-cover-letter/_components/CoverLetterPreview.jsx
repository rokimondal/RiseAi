"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateCoverLetter } from "@/actions/cover-leter";
import { cn } from "@/lib/utils";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

const CoverLetterPreview = ({ content, id }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currContent, setCurrContent] = useState(content);

    const { loading, fn: updateFn, data: updateData } = useFetch(updateCoverLetter);

    useEffect(() => {
        if (updateData) {
            toast.success("Cover letter updated successfully!");
            setIsEditing(false);
        }
    }, [updateData]);

    const handleSave = async () => {
        try {
            await updateFn(id, currContent);
        } catch (error) {
            toast.error(error.message || "Failed to update cover letter");
        }
    };

    return (
        <div className="py-4">
            <div className="border flex flex-col mx-auto w-full items-center p-4 rounded-lg">
                <div className="w-full flex justify-end mb-2">
                    <Button
                        className={cn(isEditing && "hidden")}
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Button>
                </div>

                <textarea
                    value={currContent}
                    disabled={!isEditing || loading}
                    onChange={(e) => setCurrContent(e.target.value)}
                    className="w-full h-[700px] border-none p-4 rounded-lg resize-none outline-none focus:outline-none"
                    placeholder="Your generated cover letter will appear here..."
                />

                {isEditing && (
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="mt-4 self-end"
                    >
                        {loading ? <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </> : "Save Changes"}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CoverLetterPreview;
