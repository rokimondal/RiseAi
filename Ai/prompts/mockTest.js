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

export const getImprovementTipPrompt = (user, wrongQuestionsText) => {
  const prompt = `
The user got the following ${user.industry} technical interview questions wrong:

${wrongQuestionsText}

Analyze the mistakes and generate a response in the following JSON format.

{
  "improvementTip": "string"
}

Rules:
- Return valid JSON only.
- No markdown.
- No explanation outside JSON.
- improvementTip must be under 2 sentences.
- Focus on skills/topics the user should learn or practice.
- Keep the tone encouraging and professional.
`;

  return prompt;
}