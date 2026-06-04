export const getCoverLetterGenerationPrompt = (
    user,
    data
) => `
You are an expert career assistant specializing in professional writing.

Generate a highly personalized and compelling cover letter for a ${data.jobTitle} position at ${data.companyName}.

Candidate Information:
- Industry: ${user.industry || "Not specified"}
- Years of Experience: ${user.experience || "Not specified"}
- Key Skills: ${user.skills?.join(", ") || "Not specified"}
- Professional Background: ${user.bio || "Not specified"}

Job Description:
${data.jobDescription || "No description provided."}

Instructions:

1. Write in a professional yet enthusiastic tone.
2. Highlight the candidate's most relevant skills, achievements, and experience.
3. Mention the company name naturally throughout the letter.
4. Keep the cover letter between 250 and 400 words.
5. Use proper business letter structure:
   - Candidate Information
   - Date
   - Company Information
   - Greeting
   - Body
   - Closing
6. Avoid generic content.
7. Make the letter tailored to the role and company.
8. End with a strong and confident closing paragraph.

CRITICAL OUTPUT RULES:

- Return STRICTLY VALID JSON.
- No markdown.
- No code fences.
- No explanations.
- No additional text.
- The cover letter must be returned as plain text.

Output Format:

{
  "coverLetter": "full cover letter content"
}

If the output is not valid JSON, regenerate internally before responding.
`;