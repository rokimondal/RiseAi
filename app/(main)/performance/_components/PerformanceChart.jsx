"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



const PerformanceChart = ({ assessments }) => {
    const { resolvedTheme } = useTheme()
    const lineColour = resolvedTheme === "dark" ? "#FFFFFF" : "#000000"

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (assessments) {
            const formattedData = assessments.slice().reverse().map(assessment => ({
                date: format(new Date(assessment.createdAt), "MMM dd"),
                score: assessment.quizScore
            }));

            console.log(formattedData);
            setChartData(formattedData);
        }
    }, [assessments])

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