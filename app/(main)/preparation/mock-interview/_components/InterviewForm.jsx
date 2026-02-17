import { interviewSchema } from '@/app/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { interviewTypes } from '@/data/interviewTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';

const InterviewForm = ({ setStep, setFormData }) => {

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({ resolver: zodResolver(interviewSchema) });

    const onSubmit = async (values) => {
        setFormData(values);
        setStep(3)
    }

    return (
        <Card className="mx-2">
            <CardHeader>
                <CardTitle>
                    Interview Details
                </CardTitle>
                <CardDescription>
                    Provide information to generate your AI mock interview
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">


                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
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
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                placeholder="Enter job title"
                                {...register("jobTitle")}
                            />
                            {errors.jobTitle && (
                                <p className="text-sm text-red-500">
                                    {errors.jobTitle.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="interviewType">Interview Type</Label>
                        <Select
                            onValueChange={(value) => {
                                setValue("interviewType", value, {
                                    shouldValidate: true,
                                });
                            }
                            }
                        >
                            <SelectTrigger id="interviewType" className="w-full">
                                <SelectValue placeholder="Interview Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {interviewTypes.map((type) => (
                                    <SelectItem value={type} key={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.interviewType && (
                            <p className="text-sm text-red-500">{errors.interviewType.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="jobDescription">Job Description</Label>
                        <Textarea
                            id="jobDescription"
                            placeholder="Paste the job description here"
                            className="h-32"
                            {...register("jobDescription")}
                        />
                        {errors.jobDescription && (
                            <p className="text-sm text-red-500">
                                {errors.jobDescription.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">
                            Continue
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default InterviewForm