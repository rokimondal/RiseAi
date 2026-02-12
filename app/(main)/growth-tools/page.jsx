import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Target,
    Rocket,
    Lock,
    PenBox,
    FileSearch,
    DollarSign
} from "lucide-react"

const growthTools = [
    {
        title: "Build Resume",
        description: "Create professional resumes tailored to your industry.",
        icon: FileText,
        href: "/resume",
        status: "available"
    },
    {
        title: "Cover Letter Generator",
        description: "Generate AI-powered personalized cover letters.",
        icon: PenBox,
        href: "/ai-cover-letter",
        status: "available"
    },
    {
        title: "Skill Gap Analysis",
        description: "Discover missing skills required for your target industry.",
        icon: Target,
        href: "/dashboard/growth-tools/skill-gap",
        status: "upcoming"
    },
    {
        title: "Personalized Roadmap",
        description: "AI-generated roadmap tailored to your career goals.",
        icon: Rocket,
        href: "#",
        status: "upcoming"
    },
    {
        title: "Job Role Skill Match",
        description: "Analyze your readiness for roles like Frontend, Backend, or SDE with skill match percentage.",
        icon: Target,
        href: "#",
        status: "upcoming"
    },
    {
        title: "Resume ATS Score Checker",
        description: "Evaluate your resume against ATS systems and improve keyword optimization.",
        icon: FileSearch,
        href: "#",
        status: "upcoming"
    },
    {
        title: "Salary Readiness Estimator",
        description: "Estimate your market readiness and potential salary range based on your skill profile.",
        icon: DollarSign,
        href: "#",
        status: "upcoming"
    }
]

export default function GrowthToolsPage() {
    return (
        <div className="container mx-auto py-8 space-y-12">

            {/* Header */}
            <div className="space-y-2">
                <h1 className='text-3xl md:text-6xl font-bold gradient-title mb-5'>
                    Growth Tools
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Improve faster with AI-powered insights and career acceleration tools.
                </p>
            </div>

            {/* Available Tools */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Available Now</h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {growthTools
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
                                    <CardDescription>{tool.description}</CardDescription>

                                    <Link href={tool.href}>
                                        <Button className="w-full">
                                            Open Tool
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </div>

            {/* Upcoming Tools */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-muted-foreground">
                    Coming Soon
                </h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {growthTools
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
                                    <CardDescription>{tool.description}</CardDescription>

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
