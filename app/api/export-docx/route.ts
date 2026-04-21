import { NextRequest } from "next/server";
import {
    Document,
    Packer,
    Paragraph,
    HeadingLevel,
    TextRun,
} from "docx";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            topic,
            report,
            search_results,
            scraped_content,
            feedback,
            debate,
        } = body;

        const children = [
            new Paragraph({
                text: "Research Report",
                heading: HeadingLevel.TITLE,
                spacing: { after: 300 },
            }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: `Topic: ${topic}`,
                        bold: true,
                    }),
                ],
                spacing: { after: 300 },
            }),

            ...section("Main Report", report),
            ...section("Search Data", search_results),
            ...section("Scraped Content", scraped_content),
            ...section("Critic Feedback", feedback),
            ...section("Debate", debate),
        ];

        const doc = new Document({
            sections: [{ children }],
        });

        const buffer = await Packer.toBuffer(doc);

        return new Response(Buffer.from(buffer), {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition":
                    'attachment; filename="research-report.docx"',
            },
        });
    } catch (error) {
        return Response.json(
            { error: "DOCX generation failed" },
            { status: 500 }
        );
    }
}

function section(title: string, content: string): Paragraph[] {
    return [
        new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
        }),
        ...markdownToDocx(content),
    ];
}

function markdownToDocx(markdown: string): Paragraph[] {
    const lines = markdown.split("\n");

    const output: Paragraph[] = [];

    for (const line of lines) {
        const text = line.trim();

        if (!text) {
            output.push(new Paragraph(""));
            continue;
        }

        if (text.startsWith("### ")) {
            output.push(
                new Paragraph({
                    text: text.replace("### ", ""),
                    heading: HeadingLevel.HEADING_3,
                })
            );
            continue;
        }

        if (text.startsWith("## ")) {
            output.push(
                new Paragraph({
                    text: text.replace("## ", ""),
                    heading: HeadingLevel.HEADING_2,
                })
            );
            continue;
        }

        if (text.startsWith("# ")) {
            output.push(
                new Paragraph({
                    text: text.replace("# ", ""),
                    heading: HeadingLevel.HEADING_1,
                })
            );
            continue;
        }

        if (text.startsWith("- ")) {
            output.push(
                new Paragraph({
                    text: text.replace("- ", ""),
                    bullet: { level: 0 },
                })
            );
            continue;
        }

        output.push(
            new Paragraph({
                children: parseBold(text),
                spacing: { after: 120 },
            })
        );
    }

    return output;
}

function parseBold(text: string): TextRun[] {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return new TextRun({
                text: part.replace(/\*\*/g, ""),
                bold: true,
            });
        }

        return new TextRun(part);
    });
}