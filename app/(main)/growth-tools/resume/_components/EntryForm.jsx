"use client"

import { entrySchema } from '@/app/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { Plus, PlusCircle, X } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';


const formateDisplayDate = (dateString) => {
    if (dateString == "") return;
    const date = parse(dateString, "yyyy-mm", new Date());
    return format(date, "MMM yyyy");
}

const EntryForm = ({ type, entries, onChange }) => {

    const [isAdding, setIsAdding] = useState(false);

    const { register, handleSubmit: handleValidation, formState: { errors }, watch, reset, setValue } = useForm({
        resolver: zodResolver(entrySchema),
        defaultValues: {
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
            current: false,
        },
    })

    const current = watch("current");

    const handleAdd = handleValidation((data) => {
        const formattedEntry = {
            ...data,
            startDate: formateDisplayDate(data.startDate),
            endDate: data.current ? "" : data.endDate
        };

        onChange([...entries, formattedEntry]);
        reset();
        setIsAdding(false);
    })

    const handleDelete = (index) => {
        const newEntries = entries.filter((_, i) => i != index);
        onChange(newEntries)
    }



    return (
        <div className='space-y-4'>
            <div className='space-y-4'>
                {entries.map((item, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center space-y-0 justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {item.title} @{item.organization}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => handleDelete(index)}
                            >
                                <X className='h-4 w-4' />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className='text-sm text-muted-foreground'>
                                {item.current ? `${item.startDate} - Present` : `${item.startDate} - ${item.endDate}`}
                            </p>
                            <p className="mt-2 text-sm whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {isAdding && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Add {type}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className='grid grid-cols-2 gap-2'>
                                <div className='space-y-2'>
                                    <Input
                                        placeholder="Title/Position"
                                        {...register("title")}
                                        error={errors.title}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-500">{errors.title.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Organization/Company"
                                        {...register("organization")}
                                        error={errors.organization}
                                    />
                                    {errors.organization && (
                                        <p className="text-sm text-red-500">
                                            {errors.organization.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Input
                                        type="month"
                                        {...register("startDate")}
                                        error={errors.startDate}
                                    />
                                    {errors.startDate && (
                                        <p className="text-sm text-red-500">
                                            {errors.startDate.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Input
                                        type="month"
                                        {...register("endDate")}
                                        disabled={current}
                                        error={errors.endDate}
                                    />
                                    {errors.endDate && (
                                        <p className="text-sm text-red-500">
                                            {errors.endDate.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="current"
                                    {...register("current")}
                                    onChange={(e) => {
                                        setValue("current", e.target.checked);
                                        if (e.target.checked) {
                                            setValue("endDate", "");
                                        }
                                    }}
                                />
                                <label htmlFor="current">Current {type}</label>
                            </div>

                            <div className="space-y-2">
                                <Textarea
                                    placeholder={`Description of your ${type.toLowerCase()}`}
                                    className="h-32"
                                    {...register("description")}
                                    error={errors.description}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            <CardFooter className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        reset({
                                            title: "",
                                            organization: "",
                                            startDate: "",
                                            endDate: "",
                                            description: "",
                                            current: false
                                        });
                                        setIsAdding(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleAdd}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Entry
                                </Button>
                            </CardFooter>
                        </CardContent>
                    </Card>
                )}

                {!isAdding && (
                    <Button
                        variant="outline"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add {type}
                    </Button>
                )}

            </div>
        </div>
    )
}

export default EntryForm