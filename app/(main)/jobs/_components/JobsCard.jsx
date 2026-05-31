"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const JobsCard = ({ jobs = [] }) => {
    const router = useRouter();
    return (
        
        <div className="flex flex-col gap-3">
            {jobs.map((job, index) => (
                <Card
                    key={index}
                    className="transition-all hover:shadow-lg"
                >
                    <CardContent className="flex items-center justify-between gap-6 p-5">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                            <img
                                src={job.companyLogo}
                                alt={job.company}
                                className="h-12 w-12 rounded-lg border object-cover shrink-0"
                            />

                            <div className="min-w-0">
                                <h3 className="font-semibold text-lg line-clamp-1">
                                    {job.title}
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    {job.company}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{job.location}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{job.postedText}</span>
                                    </div>
                                </div>

                                {job.hiringStatus && (
                                    <div className="mt-3 inline-flex rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-200">
                                        {job.hiringStatus}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="link"
                            className="hover:cursor-pointer"
                            onClick={() => router.push(`/jobs/${encodeURIComponent(job.jobUrl)}`)}
                        >
                            View Job
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default JobsCard;