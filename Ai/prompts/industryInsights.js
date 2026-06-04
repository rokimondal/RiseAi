export const getGenerateIndustryPrompt = (industry) => {
    const prompt = `
              Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
              {
                "salaryRanges": [
                  { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
                ],
                "growthRate": number,
                "demandLevel": "HIGH" | "MEDIUM" | "LOW",
                "topSkills": ["skill1", "skill2"],
                "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
                "keyTrends": ["trend1", "trend2"],
                "recommendedSkills": ["skill1", "skill2"],
                "jobSearchKeywords": ["keyword1","keyword2"]
              }
    
              IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
              Include at least 5 common roles for salary ranges.
              Growth rate should be a percentage.
              Include at least 5 skills and trends.
              skills write as less word as posible.
            `;
    return prompt
}