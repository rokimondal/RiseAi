"use client"

import { codingTestSchema } from '@/app/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { experienceLevels, hiringTypes, programmingLanguages } from '@/data/codingPageForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React from 'react'
import { useForm } from 'react-hook-form';

const CodingForm = ({ setFormData, handleStartAssesment, generatingAssesment }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        resetField
    } = useForm({
        resolver: zodResolver(codingTestSchema),
        defaultValues: {
            assessmentMode: "ROLE_BASED"
        }
    });

    const assessmentMode = watch("assessmentMode");

    const onSubmit = async (values) => {
        console.log(values);
        setFormData(values);
        handleStartAssesment(values);
    }
    return (
        <Card className="mx-2">
            <CardHeader>
                <CardTitle>
                    Company Coding Test
                </CardTitle>
                <CardDescription>
                    Provide details to generate your company-specific coding test.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="space-y-2">
                        <Label>Assessment Mode</Label>
                        <Select
                            defaultValue="ROLE_BASED"
                            onValueChange={(value) => {
                                setValue("assessmentMode", value, { shouldValidate: true });

                                // Reset irrelevant fields
                                if (value === "COMPANY_EXAM") {
                                    resetField("role");
                                    resetField("experienceLevel");
                                    resetField("hiringType");
                                } else {
                                    resetField("examName");
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ROLE_BASED">Role Based</SelectItem>
                                <SelectItem value="COMPANY_EXAM">Company Exam</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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

                    {assessmentMode === "ROLE_BASED" && (
                        <>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                    placeholder="Enter job role"
                                    {...register("role")}
                                />
                                {errors.role && (
                                    <p className="text-sm text-red-500">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                                            {experienceLevels.map((level) => (
                                                <SelectItem value={level} key={level}>
                                                    {level}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.experienceLevel && (
                                        <p className="text-sm text-red-500">
                                            Experience Level is required
                                        </p>
                                    )}
                                </div>

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
                                            {hiringTypes.map((type) => (
                                                <SelectItem value={type} key={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.hiringType && (
                                        <p className="text-sm text-red-500">
                                            Hiring Type is required
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {assessmentMode === "COMPANY_EXAM" && (
                        <div className="space-y-2">
                            <Label>Exam Name</Label>
                            <Input
                                placeholder="Enter exam name (e.g. NQT)"
                                {...register("examName")}
                            />
                            {errors.examName && (
                                <p className="text-sm text-red-500">
                                    Exam Name is required
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Programming Language</Label>
                        <Select
                            onValueChange={(value) =>
                                setValue("programmingLanguage", value, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Programming Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {programmingLanguages.map((lang) => (
                                    <SelectItem value={lang} key={lang}>
                                        {lang}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.programmingLanguage && (
                            <p className="text-sm text-red-500">
                                Programming Language is required
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={generatingAssesment}
                        >
                            {generatingAssesment ? (
                                <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                "Start Assesment"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default CodingForm