import { NextResponse } from "next/server";
import { getDeckLayout, setDeckSlot, swapDeckSlots } from "@/lib/db";

export async function GET() {
	try {
		const pages = getDeckLayout();
		return NextResponse.json({ success: true, pages });
	} catch (error) {
		console.error("GET /api/deck error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { pageIndex, slotIndex, soundId } = body;

		if (typeof pageIndex !== "number" || typeof slotIndex !== "number" || !soundId) {
			return NextResponse.json({ success: false, error: "pageIndex, slotIndex, and soundId required" }, { status: 400 });
		}

		setDeckSlot(pageIndex, slotIndex, soundId);
		return NextResponse.json({ success: true, pages: getDeckLayout() });
	} catch (error) {
		console.error("POST /api/deck error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const body = await req.json();
		const { source, target } = body;

		if (!source || !target) {
			return NextResponse.json({ success: false, error: "source and target required" }, { status: 400 });
		}

		swapDeckSlots(source, target);
		return NextResponse.json({ success: true, pages: getDeckLayout() });
	} catch (error) {
		console.error("PUT /api/deck error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

