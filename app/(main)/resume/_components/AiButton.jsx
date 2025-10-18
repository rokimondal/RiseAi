'use client'

import { resumeSchema } from '@/app/lib/schema'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, WandSparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import EntryForm from './EntryForm'
import useFetch from '@/hooks/use-fetch'
import { generateRESUME, improveRESUME } from '@/actions/resume'
import { toast } from 'sonner'
import { useEditorStore } from '@/store/use-editor-store'

const AiButton = () => {
    const [isopenGenerateResume, setOpenGenerateResume] = useState(false);
    const [designInfo, setDesignInfo] = useState("");

    const { editor } = useEditorStore();

    const { control, register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: {},
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: [],
        },
    })

    const { loading: generatingResume, fn: generateResumeFn, data: generateResumeData } = useFetch(generateRESUME)
    const { loading: improvingResume, fn: improveResumeFn, data: improvedResumeData } = useFetch(improveRESUME)

    const onSubmit = async (data) => {
        try {
            await generateResumeFn({
                designInstruction: designInfo,
                userData: data
            })
        } catch (error) {
            console.error("Generating resume error: ", error.message);
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (generateResumeData?.success && !generatingResume) {
            toast.success("Generate resume successfully!");
            console.log(generateResumeData);
            editor.commands.setContent(generateResumeData.data, false);
            setOpenGenerateResume(false);
        }
    }, [generatingResume, generateResumeData])


    const handleImproveResume = async () => {
        if (!editor) return;

        const contentToImprove = editor.getHTML();

        try {
            await improveResumeFn({ editorContent: contentToImprove });
        } catch (error) {
            console.error("Improving resume error: ", error.message);
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (improvedResumeData?.success && !improvingResume) {
            editor.commands.setContent(improvedResumeData.data, false);
            toast.success("Resume improved successfully!");
        }
    }, [improvingResume, improvedResumeData])

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="mr-1"
                    >
                        <WandSparkles size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <div className='flex flex-col'>
                        <Button
                            variant="ghost"
                            onClick={() => setOpenGenerateResume(true)}
                        >
                            Generate Resume
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => handleImproveResume()}
                        >
                            {improvingResume ? (
                                <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Improving....
                                </>
                            ) : "Improve Resume"}
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isopenGenerateResume} onOpenChange={setOpenGenerateResume}>
                <DialogContent className="w-full max-w-6xl sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="flex flex-col items-center ">
                        <DialogTitle className="gradient-title mb-0 text-3xl">Smart Resume Assistant</DialogTitle>
                        <DialogDescription className="">
                            Generate or upgrade your resume effortlessly using AI technology.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col space-y-5 mt-2'>
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Contact Information</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-muted/50 p-2'>
                                <div >
                                    <label className='text-sm font-medium '>Email</label>
                                    <Input
                                        {...register("contactInfo.email")}
                                        type="email"
                                        placeholder="your@email.com"
                                        error={errors.contactInfo?.email}
                                        className="mt-2"
                                    />
                                    {errors.contactInfo?.email && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo.email.message}
                                        </p>
                                    )}
                                </div>

                                <div >
                                    <label className='text-sm font-medium'>Mobile Number</label>
                                    <Input
                                        {...register("contactInfo.mobile")}
                                        type="tel"
                                        placeholder="+91 234 567 8900"
                                        className="mt-2"
                                    />
                                    {errors.contactInfo?.mobile && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo.mobile.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className='text-sm font-medium'>LinkedIn URL</label>
                                    <Input
                                        {...register("contactInfo.linkedin")}
                                        type="url"
                                        placeholder="https://linkedin.com/in/your-profile"
                                        className="mt-2"
                                    />
                                    {errors.contactInfo?.linkedin && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo.linkedin.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className='text-sm font-medium'>Twitter/X Profile</label>
                                    <Input
                                        {...register("contactInfo.twitter")}
                                        type="url"
                                        placeholder="https://twitter.com/your-handle"
                                        className="mt-2"
                                    />
                                    {errors.contactInfo?.twitter && (
                                        <p className='text-sm text-red-500'>
                                            {errors.contactInfo.twitter.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* summary */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Professional Summary</h3>
                            <Controller
                                name='summary'
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="Write a compelling professional summary..."
                                        error={errors.summary}
                                    />
                                )}
                            />
                            {errors.summary && (
                                <p className="text-sm text-red-500">{errors.summary.message}</p>
                            )}
                        </div>

                        {/* skills */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Skills</h3>
                            <Controller
                                name='skills'
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="List your key skills..."
                                        error={errors.skills}
                                    />
                                )}
                            />
                            {errors.skills && (
                                <p className="text-sm text-red-500">{errors.skills.message}</p>
                            )}
                        </div>

                        {/* experience */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Work Experience</h3>
                            <Controller
                                name='experience'
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Experience"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.experience && (
                                <p className="text-sm text-red-500">{errors.experience.message}</p>
                            )}
                        </div>

                        {/* education */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Education</h3>
                            <Controller
                                name='education'
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="education"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.education && (
                                <p className="text-sm text-red-500">{errors.education.message}</p>
                            )}
                        </div>

                        {/* projects */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Projects</h3>
                            <Controller
                                name='projects'
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="projects"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.projects && (
                                <p className="text-sm text-red-500">{errors.projects.message}</p>
                            )}
                        </div>

                        <Textarea
                            value={designInfo}
                            onChange={e => setDesignInfo(e.target.value)}
                            className="h-32 w-full p-3 resize-none"
                            placeholder="Write what kind of design you want in your resume"
                        />


                        <Button type="submit">
                            {generatingResume ? (
                                <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Generating....
                                </>
                            ) : "Generate Resume"}
                        </Button>
                    </form>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AiButton