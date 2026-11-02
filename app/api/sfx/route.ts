import { NextResponse } from "next/server";
import { getAllSfx } from "@/lib/db";

export async function GET() {
	try {
		const sounds = getAllSfx();
		return NextResponse.json({
			success: true,
			count: sounds.length,
			sounds,
		});
	} catch (error) {
		console.error("GET /api/sfx error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

