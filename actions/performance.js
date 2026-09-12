"use server"

import { callAI } from "@/Ai/callAI";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


export async function getAssessmentsAndSimulations() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
        include: {
            industryInsight: true,
        },
    })

    if (!user) throw new Error("User not exist")

    try {
        const [assessments, simulationSessions] = await Promise.all([
            db.assessment.findMany({
                where: {
                    userId: user.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),

            db.simulationSession.findMany({
                where: {
                    userId: user.id,
                },
                include: {
                    result: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
        ]);

        const today = new Date();

        const isSameDay = (date1, date2) => {
            if (!date1 || !date2) return false;

            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            );
        };

        const history = [];

        for (const assessment of assessments) {
            history.push({
                id: assessment.id,
                userId: assessment.userId,
                questions: assessment.questions,
                category: assessment.category,
                createdAt: assessment.createdAt,
                updateAt: assessment.updateAt,
                type: "ASSESSMENT",
                source: "ASSESSMENT",
                action: "RESULT",
                title: "Technical Mock Test",
                score: assessment.quizScore,
                totalQuestions: assessment.questions?.length ?? 0,
                improvementTip: assessment.improvementTip
            })
        }



        for (const session of simulationSessions) {
            const payload = session.payload ?? {};

            let title = "Simulation Test";
            let totalQuestions = 0;

            switch (session.type) {
                case "MOCK_INTERVIEW":
                    title = "Mock Interview";

                    totalQuestions =
                        payload?.interviewPlan?.questions?.length ??
                        payload?.questions?.length ??
                        0;

                    break;

                case "CODING_ROUND":
                    title = "Company Coding Round";

                    totalQuestions =
                        payload?.questions?.length ?? 0;

                    break;

                case "ASSESSMENT_CENTER":
                    title = "Assessment Center";

                    totalQuestions =
                        payload?.questions?.length ?? 0;

                    break;

                case "COMPANY_SIMULATION":
                    title = "Company Hiring Simulation";

                    totalQuestions =
                        payload?.rounds?.length ?? 0;

                    break;
            }

            const isExpired = session.status === "EXPIRED";

            let action = "RESULT";

            let simulationResult = null;

            // Company Simulation
            if (session.type === "COMPANY_SIMULATION") {
                const overallStatus =
                    payload?.simulationMetadata?.overallStatus;

                simulationResult = overallStatus;
            }

            if (session.result) {
                action = "RESULT";
            } else if (session.status === "EVALUATION_PENDING") {
                action = "EVALUATE";
            } else if (
                session.status === "STARTED" &&
                session.startedAt &&
                isSameDay(new Date(session.startedAt), today)
            ) {
                action = "ATTEMPTED_TODAY";
            } else if (session.status === "STARTED") {
                action = "TAKE_TEST";
            } else if (session.status === "EXPIRED") {
                action = "EXPIRED";
            }

            history.push({
                id: session.id,
                type: session.type,
                title,
                source: "SIMULATION",
                score: session.result?.score ?? null,
                totalQuestions,
                status: session.status,
                isExpired,
                sessionToken: session.sessionToken,
                createdAt: session.createdAt,
                action,
                simulationResult
            });
        }

        history.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

        // console.log(assessments)
        // console.log(simulationSessions)
        // console.log("-----------------------------------------------------------------------")
        // console.log((history))

        return history;
    } catch (error) {
        console.error("Error fetching assessments:", error);
        throw new Error("Failed to fetch assessments");
    }
}


export async function getSessionResult({ result }) {
    console.log(sessionToken)
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) {
        throw new Error("User not exist");
    }
    console.log(sessionToken)
    console.log(sessionId)

    const where = sessionId
        ? { id: sessionId }
        : { sessionToken };

    const session = await db.simulationSession.findFirst({
        where,

        select: {
            id: true,
            sessionToken: true,
            userId: true,
            type: true,
            status: true,
            startedAt: true,
            result: true,
            payload: true,
        },
    });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    console.log(session)

    return {
        success: true,
        data: { session },
    };
}