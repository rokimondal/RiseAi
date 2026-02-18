import mammoth from "mammoth";

export async function extractResumeText(file) {

    if (!file) return "";

    if (file.type === "application/pdf") {

        const pdfjsLib = await import("pdfjs-dist");

        pdfjsLib.GlobalWorkerOptions.workerSrc =
            new URL(
                "pdfjs-dist/build/pdf.worker.min.mjs",
                import.meta.url
            ).toString();

        const buffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
            data: buffer,
        }).promise;

        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {

            const page = await pdf.getPage(i);

            const content = await page.getTextContent();

            const pageText = content.items
                .map(item => item.str)
                .join(" ");

            text += pageText + "\n\n";
        }

        return text.trim();
    }

    if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {

        const buffer = await file.arrayBuffer();

        const result = await mammoth.extractRawText({
            arrayBuffer: buffer,
        });

        return result.value.trim();
    }

    const rawText = await file.text();

    try {

        const parsed = JSON.parse(rawText);

        if (parsed?.type === "doc") {
            return tiptapJSONToText(parsed);
        }

        return JSON.stringify(parsed, null, 2);

    } catch { }

    if (rawText.includes("<") && rawText.includes(">")) {
        return htmlToText(rawText);
    }

    return rawText.trim();
}


export function htmlToText(html) {

    if (typeof window === "undefined") return html;

    const parser = new DOMParser();

    const doc = parser.parseFromString(html, "text/html");

    return doc.body.innerText.trim();
}


export function tiptapJSONToText(json) {

    if (!json) return "";

    let text = "";

    function traverse(node) {

        if (!node) return;

        if (node.type === "text") {
            text += node.text;
        }

        if (node.type === "paragraph" || node.type === "heading") {
            text += "\n";
        }

        if (Array.isArray(node.content)) {
            node.content.forEach(traverse);
        }
    }

    traverse(json);

    return text.trim();
}