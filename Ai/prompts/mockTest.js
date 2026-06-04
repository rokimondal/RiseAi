export const getGenerateQuizPrompt = (user) => {
    const prompt = `
    Generate 10 technical interview questions for a ${user.industry
        } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
        }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

    return prompt;
}