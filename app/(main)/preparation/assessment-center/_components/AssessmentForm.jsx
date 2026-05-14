"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { assessmentCenterSchema } from "@/app/lib/schema";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";

const AssessmentForm = ({
    setFormData,
    handleStartAssesment,
    generatingAssesment,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        resetField,
    } = useForm({
        resolver: zodResolver(assessmentCenterSchema),
        defaultValues: {
            assessmentMode: "ROLE_BASED",
        },
    });

    const assessmentMode = watch("assessmentMode");

    const onSubmit = (values) => {
        setFormData(values);
        handleStartAssesment(values);
    };

    return (
        <Card className="mx-2">
            <CardHeader>
                <CardTitle>Assessment Generator</CardTitle>
                <CardDescription>
                    Provide details to generate your assessment.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* 🔹 Assessment Mode */}
                    <div className="space-y-2">
                        <Label>Assessment Mode</Label>
                        <Select
                            defaultValue="ROLE_BASED"
                            onValueChange={(value) => {
                                setValue("assessmentMode", value, { shouldValidate: true });

                                if (value === "EXAM_BASED") {
                                    resetField("companyName");
                                    resetField("role");
                                    resetField("experienceLevel");
                                    resetField("hiringType");
                                    resetField("roundType");
                                } else {
                                    resetField("examAuthority");
                                    resetField("examName");
                                    resetField("selectedTopics");
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ROLE_BASED">Role Based</SelectItem>
                                <SelectItem value="EXAM_BASED">Exam Based</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 🔹 ROLE BASED */}
                    {assessmentMode === "ROLE_BASED" && (
                        <>
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input
                                    placeholder="Enter company name"
                                    {...register("companyName")}
                                />
                                {errors.companyName && (
                                    <p className="text-sm text-red-500">
                                        {errors.companyName.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                    placeholder="Enter role (e.g. SDE)"
                                    {...register("role")}
                                />
                                {errors.role && (
                                    <p className="text-sm text-red-500">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Experience */}
                                <div className="space-y-2">
                                    <Label>Experience Level</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("experienceLevel", value, { shouldValidate: true })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Experience Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["Intern", "Fresher", "1–3 Years", "3–5 Years", "Senior"].map(
                                                (level) => (
                                                    <SelectItem value={level} key={level}>
                                                        {level}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.experienceLevel && (
                                        <p className="text-sm text-red-500">
                                            {errors.experienceLevel.message}
                                        </p>
                                    )}
                                </div>

                                {/* Hiring Type */}
                                <div className="space-y-2">
                                    <Label>Hiring Type</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("hiringType", value, { shouldValidate: true })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Hiring Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["On-Campus", "Off-Campus", "Lateral"].map((type) => (
                                                <SelectItem value={type} key={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.hiringType && (
                                        <p className="text-sm text-red-500">
                                            {errors.hiringType.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Round Type */}
                            <div className="space-y-2">
                                <Label>Round Type</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue("roundType", value, { shouldValidate: true })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Round Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            "Assessment Round",
                                            "Technical Screening",
                                            "Aptitude Round",
                                            "HR Round",
                                            "Behavioral Round",
                                            "Managerial Round",
                                        ].map((round) => (
                                            <SelectItem value={round} key={round}>
                                                {round}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.roundType && (
                                    <p className="text-sm text-red-500">
                                        {errors.roundType.message}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* 🔹 EXAM BASED */}
                    {assessmentMode === "EXAM_BASED" && (
                        <>
                            <div className="space-y-2">
                                <Label>Exam Authority</Label>
                                <Input
                                    placeholder="Enter exam authority"
                                    {...register("examAuthority")}
                                />
                                {errors.examAuthority && (
                                    <p className="text-sm text-red-500">
                                        {errors.examAuthority.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Exam Name</Label>
                                <Input
                                    placeholder="Enter exam name (e.g. NQT)"
                                    {...register("examName")}
                                />
                                {errors.examName && (
                                    <p className="text-sm text-red-500">
                                        {errors.examName.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Topics (Optional)</Label>
                                <Input
                                    placeholder="DSA, DBMS, OS"
                                    onChange={(e) =>
                                        setValue(
                                            "selectedTopics",
                                            e.target.value.split(",").map((t) => t.trim())
                                        )
                                    }
                                />
                            </div>
                        </>
                    )}

                    {/* 🔹 Submit */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={generatingAssesment}>
                            {generatingAssesment ? (
                                <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                "Start Assessment"
                            )}
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    );
};

export default AssessmentForm;