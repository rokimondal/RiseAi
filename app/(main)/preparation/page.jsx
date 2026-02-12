import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Code2,
    Mic,
    Building2,
    Lock,
    Briefcase,
    Calculator,
    FileQuestion
} from "lucide-react"

const preparationTools = [
    // ✅ Available
    {
        title: "Technical Mock Test",
        description: "Take industry-focused mock tests to evaluate your core skills and practical knowledge.",
        icon: Code2,
        href: "/preparation/mock-test",
        status: "available"
    },
    {
        title: "Mock Interview",
        description: "Engage in live AI-driven interview simulations with voice interaction and real-time follow-ups.",
        icon: Mic,
        href: "/preparation/mock-interview",
        status: "available"
    },
    {
        title: "Company Hiring Simulation",
        description: "Simulate complete hiring rounds based on real company patterns and difficulty levels.",
        icon: Building2,
        href: "/preparation/company-simulation",
        status: "available"
    },

    // 🚧 Upcoming
    {
        title: "Aptitude Test",
        description: "Practice important quantitative, verbal, and logical reasoning questions for exam success.",
        icon: Calculator,
        href: "#",
        status: "upcoming"
    }

]

export default function PreparationPage() {
    return (
        <div className="container mx-auto py-8 space-y-12">

            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl md:text-6xl font-bold gradient-title mb-5">
                    Preparation
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Prepare smarter with structured assessments and simulations.
                </p>
            </div>

            {/* Available Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Available Now</h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {preparationTools
                        .filter(tool => tool.status === "available")
                        .map((tool, index) => (
                            <Card
                                key={index}
                                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <tool.icon className="h-6 w-6 text-primary" />
                                    <CardTitle>{tool.title}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <CardDescription>
                                        {tool.description}
                                    </CardDescription>

                                    <Link href={tool.href}>
                                        <Button className="w-full">
                                            Start Now
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </div>

            {/* Upcoming Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-muted-foreground">
                    Coming Soon
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {preparationTools
                        .filter(tool => tool.status === "upcoming")
                        .map((tool, index) => (
                            <Card
                                key={index}
                                className="opacity-70 border-dashed"
                            >
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <tool.icon className="h-6 w-6 text-muted-foreground" />
                                    <CardTitle>{tool.title}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <CardDescription>
                                        {tool.description}
                                    </CardDescription>

                                    <Button
                                        variant="outline"
                                        className="w-full cursor-not-allowed"
                                        disabled
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Coming Soon
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    )
}
