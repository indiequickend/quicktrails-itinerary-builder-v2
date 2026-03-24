import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';

export async function POST(req: Request) {
    try {
        const itinerary = await req.json();

        // Helper to fetch Cloudinary images and convert to ArrayBuffer for Word
        const fetchImageBuffer = async (url: string) => {
            const response = await fetch(url);
            return await response.arrayBuffer();
        };

        const docChildren: any[] = [
            // Document Title
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: itinerary.tripTitle, font: "Playfair Display", size: 56 })],
                spacing: { after: 400 },
            }),
            // Duration & B2B/Brand Info
            new Paragraph({
                children: [
                    new TextRun({ text: itinerary.durationText, size: 24, color: "718096" }),
                    new TextRun({
                        text: `  |  Presented by: ${itinerary.b2bDetails?.isB2B ? itinerary.b2bDetails.agencyName : 'QuickTrails'}`,
                        size: 24,
                        bold: true
                    }),
                ],
                spacing: { after: 600 },
            }),
        ];

        // Iterate through the days and build paragraphs
        for (const day of itinerary.days) {
            docChildren.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    children: [new TextRun({ text: `Day ${day.dayNumber}: ${day.dayTitle}`, size: 32, bold: true })],
                    spacing: { before: 400, after: 200 },
                })
            );

            // If there is a high-res image for the day, embed it
            if (day.dayHighlightImage) {
                try {
                    const imageBuffer = await fetchImageBuffer(day.dayHighlightImage);
                    docChildren.push(
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: imageBuffer,
                                    transformation: { width: 600, height: 300 }, // Standardizes image width for A4 Word pages
                                }),
                            ],
                            spacing: { after: 200 },
                        })
                    );
                } catch (imgErr) {
                    console.error(`Failed to load image for Day ${day.dayNumber}`, imgErr);
                }
            }

            // We would loop through day.activities here and push them as standard text Paragraphs
        }

        // Initialize the Word Document
        const doc = new Document({
            sections: [{ properties: {}, children: docChildren }],
        });

        // Pack the document into a buffer
        const buffer = await Packer.toBuffer(doc);

        // Return the buffer as a downloadable file
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${itinerary.tripTitle.replace(/\s+/g, '_')}_Itinerary.docx"`,
            },
        });

    } catch (error) {
        console.error("Docx generation failed:", error);
        return NextResponse.json({ error: 'Failed to generate Word document' }, { status: 500 });
    }
}