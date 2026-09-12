"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, differenceInMonths, format, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



const PerformanceChart = ({ completedAssessments }) => {
    const { resolvedTheme } = useTheme()
    const lineColour = resolvedTheme === "dark" ? "#FFFFFF" : "#000000"

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (!completedAssessments?.length) {
            setChartDat([]);
            return;
        }

        const sortedData = completedAssessments
            .slice()
            .sort(
                (a, b) =>
                    new Date(a.createdAt) - new Date(b.createdAt)
            );

        const firstDate = new Date(sortedData[0].createdAt);
        const lastDate = new Date(
            sortedData[sortedData.length - 1].createdAt
        );

        const totalDays = differenceInDays(lastDate, firstDate);
        const totalMonths = differenceInMonths(lastDate, firstDate);
        let groupedData = {};

        if (totalDays <= 30) {
            // Day-wise
            sortedData.forEach((assessment) => {
                const date = format(
                    new Date(assessment.createdAt),
                    "MMM dd"
                );

                groupedData[date] ??= [];
                groupedData[date].push(assessment.score);
            });
        } else if (totalDays <= 365) {
            // Week-wise
            sortedData.forEach((assessment) => {
                const date = format(
                    startOfWeek(new Date(assessment.createdAt)),
                    "MMM dd"
                );

                groupedData[date] ??= [];
                groupedData[date].push(assessment.score);
            });
        } else if (totalMonths <= 48) {
            // Month-wise
            sortedData.forEach((assessment) => {
                const date = format(
                    startOfMonth(new Date(assessment.createdAt)),
                    "MMM yyyy"
                );

                groupedData[date] ??= [];
                groupedData[date].push(assessment.score);
            });
        } else {
            // Year-wise
            sortedData.forEach((assessment) => {
                const date = format(
                    startOfYear(new Date(assessment.createdAt)),
                    "yyyy"
                );

                groupedData[date] ??= [];
                groupedData[date].push(assessment.score);
            });
        }

        const formattedData = Object.entries(groupedData).map(
            ([date, scores]) => ({
                date,
                score: Number(
                    (
                        scores.reduce((sum, score) => sum + score, 0) /
                        scores.length
                    ).toFixed(1)
                ),
            })
        );

        setChartData(formattedData);
    }, [completedAssessments])

    if (!chartData.length) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="gradient-title text-3xl md:text-4xl">Performance Trend</CardTitle>
                <CardDescription>Your quiz scores over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload?.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border rounded-lg p-2 shadow-md">
                                                <p className="text-sm font-medium">
                                                    Score: {data.score}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {data.date}
                                                </p>
                                            </div>
                                        )
                                    };
                                    return null;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke={lineColour}
                                strokeWidth={2}
                                isAnimationActive={true}
                                animationDuration={800}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default PerformanceChart