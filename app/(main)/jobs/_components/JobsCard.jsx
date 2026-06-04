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
                    <CardContent className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                <img
                                    src={job.companyLogo}
                                    alt={job.company}
                                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg border object-cover shrink-0"
                                />

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-base sm:text-lg break-words">
                                        {job.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        {job.company}
                                    </p>

                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
                                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span>{job.location}</span>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4 shrink-0" />
                                            <span>{job.postedText}</span>
                                        </div>
                                    </div>

                                    {job.hiringStatus && (
                                        <div className="mt-2 inline-flex rounded-full bg-green-100 dark:bg-green-900 px-2 py-1 text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-200">
                                            {job.hiringStatus}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                                <Button
                                    variant="default"
                                    className="w-full sm:w-auto sm:variant-link"
                                    onClick={() =>
                                        router.push(`/jobs/${encodeURIComponent(job.jobUrl)}`)
                                    }
                                >
                                    View Job
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default JobsCard;