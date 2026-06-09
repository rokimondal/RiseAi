"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getSessionDetails({ sessionId, sessionToken }) {
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
        },
    });

    if (!session) {
        throw new Error("Session not found");
    }

    if (session.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    return {
        success: true,
        data: { session },
    };
}

export async function getSessionResultDetails({ sessionId, sessionToken }) {
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