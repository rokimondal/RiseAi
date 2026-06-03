"use client"

import { getFilteredJobs, getJobs } from '@/actions/jobs';
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import useFetch from '@/hooks/use-fetch';
import { Skeleton } from '@/components/ui/skeleton';
import JobsCard from './JobsCard';
import { Loader2 } from 'lucide-react';

const JOB_SOURCES = [
    {
        label: "LinkedIn",
        value: "linkedin",
    },
    {
        label: "Naukri",
        value: "naukri",
    },
    {
        label: "Foundit",
        value: "foundit",
    },
];

const JOB_TYPES = [
    { label: "Full Time", value: "full-time" },
    { label: "Part Time", value: "part-time" },
    { label: "Contract", value: "contract" },
    { label: "Internship", value: "internship" },
];

const WORK_MODES = [
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
    { label: "Onsite", value: "onsite" },
];

const EXPERIENCE_LEVELS = [
    { label: "Fresher", value: "fresher" },
    { label: "1-3 Years", value: "1-3" },
    { label: "3-5 Years", value: "3-5" },
    { label: "5-10 Years", value: "5-10" },
    { label: "10+ Years", value: "10+" },
];

const DATE_POSTED_OPTIONS = [
    { label: "All Dates", value: "all" },
    { label: "Last 24 Hours", value: "24h" },
    { label: "Last 3 Days", value: "3d" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 14 Days", value: "14d" },
    // { label: "Last 30 Days", value: "30d" },
];

const FILTERS = [
    {
        key: "jobType",
        placeholder: "Job Type",
        options: JOB_TYPES,
    },
    {
        key: "workMode",
        placeholder: "Work Mode",
        options: WORK_MODES,
    },
    {
        key: "experience",
        placeholder: "Experience",
        options: EXPERIENCE_LEVELS,
    },
    {
        key: "datePosted",
        placeholder: "Date Posted",
        options: DATE_POSTED_OPTIONS,
    },
];

const jobs = () => {

    const { fn: getJobsFn, data: jobsData } = useFetch(getJobs);
    const { loading: filtering, fn: getFilterdJobs, data: FilteredJobsData } = useFetch(getFilteredJobs);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keywords: "", location: "India", sources: ["linkedin"], jobType: "", workMode: "", experience: "", datePosted: "24h",
    });
    const [finalJobs, setFinalJobs] = useState(null);


    useEffect(() => {
        const fetchJob = async () => {
            try {
                await getJobsFn();
            } catch (error) {
                console.error(error);
                toast.error("Failed to get jobs data");
            }
        }
        fetchJob();

    }, [])

    useEffect(() => {
        if (jobsData) {
            setFinalJobs(jobsData);
            setLoading(false);
        }

    }, [jobsData])

    useEffect(() => {
        if (FilteredJobsData) {
            setFinalJobs(FilteredJobsData);
            setLoading(false);
        }

    }, [FilteredJobsData])

    const toggleSource = (source) => {
        setFilters((prev) => ({
            ...prev,
            sources: prev.sources.includes(source)
                ? prev.sources.filter((s) => s !== source)
                : [...prev.sources, source],
        }));
    };

    const handleSearch = async () => {
        setLoading(false);
        const payload = {
            ...filters,
            keywords: filters.keywords
                .split(",")
                .map((keyword) => keyword.trim())
                .filter(Boolean),
        };

        console.log(payload);

        try {
            await getFilterdJobs(payload);
        } catch (error) {
            console.error(error);
            toast.error("Failed to get jobs data");
        }



        // await getJobsFn(filters);
    };

    if (!finalJobs && !loading) {
        return (
            <>
                <div className="container mx-auto py-8">
                    No jobs found
                </div>
            </>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                        <Input
                            className="h-11 focus:outline-none"
                            placeholder="Keywords"
                            value={filters.keywords}
                            onChange={(e) => {
                                const value = e.target.value
                                    .split(" ")
                                    .map((word) =>
                                        word
                                            ? word.charAt(0).toUpperCase() + word.slice(1)
                                            : ""
                                    )
                                    .join(" ");

                                setFilters((prev) => ({
                                    ...prev,
                                    keywords: value,
                                }));
                            }}
                        />

                        <Input
                            className="h-11 focus:outline-none"
                            placeholder="Location"
                            value={filters.location}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    location: e.target.value,
                                }))
                            }
                        />

                        <Button
                            className="h-11 md:w-auto w-full px-8"
                            onClick={handleSearch}
                            disabled={filtering}
                        >
                            {
                                filtering ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : "Search"
                            }

                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {FILTERS.map((filter) => (
                            <Select
                                key={filter.key}
                                value={filters[filter.key]}
                                onValueChange={(value) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        [filter.key]: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder={filter.placeholder} />
                                </SelectTrigger>

                                <SelectContent>
                                    {filter.options.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}
                    </div>

                    {/* <div>
                        <div className="flex flex-wrap gap-2">
                            {JOB_SOURCES.map((source) => (
                                <Button
                                    key={source.value}
                                    size="sm"
                                    className="flex-1 min-w-[120px]"
                                    variant={
                                        filters.sources.includes(source.value)
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => toggleSource(source.value)}
                                >
                                    {source.label}
                                </Button>
                            ))}
                        </div>
                    </div> */}
                </CardContent>
            </Card>

            {/* Results Header */}
            {/* <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">
                    {jobsData.length} Jobs Found
                </h2>

                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                </Select>
            </div> */}

            {/* Existing Component */}
            {loading && <JobsSkeleton />}
            {!loading && <JobsCard jobs={finalJobs} />}
        </div>
    )
}

function JobsSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[...Array(8)].map((_, index) => (
                <Card key={index}>
                    <CardContent className="flex items-center justify-between gap-6 p-5">
                        <div className="flex items-start gap-4 flex-1">
                            <Skeleton className="h-12 w-12 rounded-lg" />

                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-5 w-64" />
                                <Skeleton className="h-4 w-40" />

                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-24" />
                                </div>

                                <Skeleton className="h-6 w-32 rounded-full" />
                            </div>
                        </div>

                        <Skeleton className="h-10 w-28" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export default jobs;