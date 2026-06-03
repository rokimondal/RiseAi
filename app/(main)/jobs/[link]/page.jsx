"use client"

import { getJob, markJobAsApplied } from '@/actions/jobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useFetch from '@/hooks/use-fetch';
import { Bookmark, Building2, ExternalLink, Loader2, MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import BackButton from '@/components/BackButton';

const page = () => {
    const { fn: getJobFn, data: jobData } = useFetch(getJob);
    const { loading: markLoading, fn: markAppliedFn, data: markJobData } = useFetch(markJobAsApplied);
    const [loading, setLoading] = useState(true);
    const [isApplied, setApplied] = useState(false);

    const params = useParams();
    useEffect(() => {
        const fetchJob = async () => {
            const { link } = params;
            try {
                await getJobFn({ url: link });
            } catch (error) {
                console.error(error);
                toast.error("Failed to get job data");
            }


            setLoading(false);
        }
        if (params?.link) {
            fetchJob();
        }
    }, [])

    useEffect(() => {
        if (markJobData) {
            setApplied(markJobData?.success);
            return;
        }
        if (jobData) {
            setApplied(jobData.isApplied);
        }

    }, [jobData, markJobData])

    useEffect(() => {
        if (markJobData) {
            console.log(markJobData);
            toast.success("Job marked");
        }
    }, [markJobData]);

    if (loading) {
        return (<>

            <BackButton />

            <div className="container mx-auto py-8">
                <Card >
                    <CardContent className="p-6 space-y-4">
                        <div className="h-16 w-16 rounded-lg bg-muted animate-pulse" />
                        <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />

                        <div className="space-y-2 pt-4">
                            <div className="h-4 w-full bg-muted rounded animate-pulse" />
                            <div className="h-4 w-full bg-muted rounded animate-pulse" />
                            <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-full bg-muted rounded animate-pulse" />
                            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
        );
    }

    if (!jobData) {
        return (
            <>
                <BackButton />
                <div className="container mx-auto py-8">
                    No job data found
                </div>
            </>
        );
    }

    function linkify(text) {
        return text.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline font-medium">$1</a>'
        );
    }

    console.log(jobData);

    const handleMarkAsApplied = async () => {
        try {
            await markAppliedFn({
                id: jobData.id,
                source: jobData.source,
                title: jobData.title,
                company: jobData.company,
                location: jobData.location,
                description: jobData.description,
                applyLink: jobData.applyLink,
                companyLogo: jobData.companyLogo,
                externalJobId: jobData.externalJobId
            });
        } catch (error) {
            toast.error(error.message || "Failed to mark");
        }
    };

    return (
        <>
            <BackButton />
            <div className="container mx-auto max-w-5xl py-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <img
                                src={jobData.companyLogo}
                                alt={jobData.company}
                                className="h-16 w-16 rounded-lg border"
                            />

                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">
                                    {jobData.title}
                                </h1>

                                <div className="mt-2 flex flex-wrap gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        {jobData.company}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {jobData.location}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleMarkAsApplied}
                                disabled={markLoading || isApplied}
                            >
                                {markLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <>
                                    <Bookmark className="h-4 w-4" />
                                    Mark as Applied
                                </>}

                            </Button>
                            <Button asChild>
                                <a
                                    href={jobData.applyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Apply Now
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                            </Button>
                        </div>

                        <div className="mt-8">
                            <h2 className="mb-4 text-xl font-semibold">
                                Job Description
                            </h2>

                            <div
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: linkify(jobData.description),
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default page