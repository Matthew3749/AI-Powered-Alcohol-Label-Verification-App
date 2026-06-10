import { NextRequest, NextResponse } from "next/server";
import { extractLabelData } from "@/lib/claude";
import { verifyLabel } from "@/lib/verify";
import { ApplicationData } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const image = formData.get("image") as File;
        const applicationRaw = formData.get("application") as string;

        if (!image || !applicationRaw) {
            return NextResponse.json(
                { error: "Missing image or application data" },
                { status: 400 }
            );
        }

        const application = JSON.parse(applicationRaw) as ApplicationData;

        const arrayBuffer = await image.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mediaType = image.type as
            | "image/jpeg"
            | "image/png"
            | "image/webp"
            | "image/gif";

        const start = Date.now();
        const extracted = await extractLabelData(base64, mediaType);
        const processingTimeMs = Date.now() - start;

        const result = verifyLabel(application, extracted, processingTimeMs);

        return NextResponse.json(result);
    } catch (err) {
        console.error("Verify error:", err);
        return NextResponse.json(
            { error: "Failed to process label. Please try again." },
            { status: 500 }
        );
    }
}

export async function POST_BATCH(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("images") as File[];
        const applicationsRaw = formData.get("applications") as string;

        if (!files.length || !applicationsRaw) {
            return NextResponse.json(
                { error: "Missing images or application data" },
                { status: 400 }
            );
        }

        const applications = JSON.parse(applicationsRaw) as ApplicationData[];

        const results = await Promise.all(
            files.map(async (file, i) => {
                const application = applications[i];
                if (!application) return { error: "No matching application data" };

                const arrayBuffer = await file.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString("base64");
                const mediaType = file.type as
                    | "image/jpeg"
                    | "image/png"
                    | "image/webp"
                    | "image/gif";

                const start = Date.now();
                const extracted = await extractLabelData(base64, mediaType);
                const processingTimeMs = Date.now() - start;

                return verifyLabel(application, extracted, processingTimeMs);
            })
        );

        return NextResponse.json({ results });
    } catch (err) {
        console.error("Batch verify error:", err);
        return NextResponse.json(
            { error: "Batch processing failed. Please try again." },
            { status: 500 }
        );
    }
}