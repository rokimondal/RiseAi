"use client"

import { companyHiringSimulationSchema } from '@/app/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { experienceLevels, hiringTypes } from '@/data/simulationPageForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React from 'react'
import { useForm } from 'react-hook-form';

const SimulationForm = ({ setFormData, setStep }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(companyHiringSimulationSchema)
    });

    const onSubmit = async (values) => {
        setFormData(values);
        setStep(3);

    }

    return (
        <Card className="mx-2">
            <CardHeader>
                <CardTitle>
                    Company Hiring Simulation
                </CardTitle>

                <CardDescription>
                    Provide details to generate a realistic multi-round hiring process.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >
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
                            placeholder="Software Engineer"
                            {...register("role")}
                        />

                        {errors.role && (
                            <p className="text-sm text-red-500">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="experienceLevel">
                                Experience Level
                            </Label>

                            <Select
                                onValueChange={(value) =>
                                    setValue(
                                        "experienceLevel",
                                        value,
                                        { shouldValidate: true }
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="experienceLevel"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select experience level" />
                                </SelectTrigger>

                                <SelectContent>
                                    {experienceLevels.map((level) => (
                                        <SelectItem
                                            key={level}
                                            value={level}
                                        >
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="">
                                {errors.experienceLevel && (
                                    <p className="text-sm text-destructive">
                                        Experience level is required
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hiringType">
                                Hiring Type
                            </Label>

                            <Select
                                onValueChange={(value) =>
                                    setValue(
                                        "hiringType",
                                        value,
                                        { shouldValidate: true }
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="hiringType"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select hiring type" />
                                </SelectTrigger>

                                <SelectContent>
                                    {hiringTypes.map((type) => (
                                        <SelectItem
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="">
                                {errors.hiringType && (
                                    <p className="text-sm text-destructive">
                                        Hiring type is required
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Job Description</Label>

                        <textarea
                            rows={6}
                            placeholder="Paste job description (optional)"
                            className="w-full rounded-md border p-3"
                            {...register("jobDescription")}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                        >
                            Plan Hiring Process
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default SimulationForm;