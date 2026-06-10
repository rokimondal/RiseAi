import { modelStats } from "@/Ai/modelStats";

export async function GET(request) {
    const secret = request.headers.get("x-admin-secret");

    if (secret !== process.env.ADMIN_SECRET) {
        return Response.json(
            {
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    return Response.json(modelStats);
    
}