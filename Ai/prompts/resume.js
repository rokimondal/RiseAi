export const getImproveResumePrompt = (content) => `
You are an AI that improves resume HTML content compatible with Tiptap editor.

Requirements:
- Use inline CSS only.
- Do not use external CSS.
- Preserve all resume sections.
- Improve formatting, readability, spacing, typography, and visual hierarchy.
- Do not remove user content.
- Do not expose real email, mobile, LinkedIn, or Twitter values.
- Preserve placeholders exactly as provided.
- Ensure the HTML remains fully compatible with Tiptap.

Resume Content:
${content}

CRITICAL OUTPUT RULES:
- Return STRICTLY VALID JSON.
- No markdown.
- No code fences.
- No explanations.
- No extra text.

Output Format:

{
  "html": "<improved html>"
}
`;

export const getGenerateResumePrompt = (
    designInstruction,
    maskedUserData
) => `
You are an AI resume generator.

Generate a professional resume as HTML compatible with Tiptap editor.

Design Instruction:
${designInstruction}

Input Data:
${JSON.stringify(maskedUserData, null, 2)}

Requirements:
1. Generate valid HTML only.
2. Use inline CSS only.
3. No external CSS files.
4. No JavaScript.
5. Include:
   - Contact Info
   - Summary
   - Skills
   - Education
   - Experience
   - Projects
6. Make the design professional and visually appealing.
7. Preserve all placeholders exactly as provided.
8. Dates must be formatted:
   "Start – End"
   or
   "Start – Present"

CRITICAL OUTPUT RULES:
- Return STRICTLY VALID JSON.
- No markdown.
- No code fences.
- No explanations.
- No extra text.

Output Format:

{
  "html": "<generated html>"
}
`;