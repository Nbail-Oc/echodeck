import { NextResponse } from "next/server";
import { getMimicTakes, saveMimicTake } from "@/lib/db";

export async function GET() {
	try {
		const takes = getMimicTakes();
		return NextResponse.json({ success: true, count: takes.length, takes });
	} catch (error) {
		console.error("GET /api/mimic error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { referenceSfxId, title, audioData, score, takeNumber } = body;

		if (!title) {
			return NextResponse.json({ success: false, error: "title required" }, { status: 400 });
		}

		const id = saveMimicTake({
			referenceSfxId: referenceSfxId || "custom",
			title,
			audioData: audioData || "",
			score: typeof score === "number" ? score : 88,
			takeNumber: typeof takeNumber === "number" ? takeNumber : 1,
		});

		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error("POST /api/mimic error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

