import z from "zod";

export const onboardingSchema = z.object({
    industry: z
        .string({
            required_error: "Please select an industry",
        })
        .min(1, "Please select an industry"),
    subIndustry: z
        .string({
            required_error: "Please select a specialization",
        })
        .min(1, "Please select a specialization"),
    bio: z.string().max(500).optional(),
    experience: z
        .string()
        .refine((val) => val !== "", { message: "Experience is required" }) // must not be empty
        .refine((val) => !isNaN(parseInt(val, 10)), {
            message: "Experience must be a valid number",
        })
        .transform((val) => parseInt(val, 10))
        .pipe(
            z
                .number()
                .min(0, "Experience must be at least 0 years")
                .max(50, "Experience cannot exceed 50 years")
        ),
    skills: z.string().transform((val) =>
        val ? val.split(",").map(skill => skill.trim()).filter(Boolean) : undefined)
})