import { NextResponse } from "next/server";
import { getLibraryItems, addToLibrary, removeFromLibrary, getAllSfx } from "@/lib/db";

export async function GET() {
	try {
		const items = getLibraryItems();
		return NextResponse.json({
			success: true,
			count: items.length,
			items,
		});
	} catch (error) {
		console.error("GET /api/library error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();

		// If sfxId provided, look up from catalog
		if (body.sfxId) {
			const allSfx = getAllSfx();
			const found = allSfx.find((s) => s.id === body.sfxId);
			if (found) {
				const added = addToLibrary({
					id: found.id,
					sfx_id: found.id,
					title: found.title,
					category: found.category,
					description: found.description,
					audio_url: found.audio_url,
					version: "Original",
					source: "Marketplace",
					color: found.color,
					freq: found.freq,
					type: found.type,
					duration: found.duration,
				});
				return NextResponse.json({ success: added, item: found });
			}
		}

		// Or add custom sound directly
		if (body.title && body.audio_url) {
			const added = addToLibrary({
				id: body.id,
				sfx_id: body.sfx_id || body.id,
				title: body.title,
				category: body.category || "Custom",
				description: body.description || "",
				audio_url: body.audio_url,
				version: body.version || "Original",
				source: body.source || "Library",
				color: body.color,
				freq: body.freq,
				type: body.type,
				duration: body.duration,
			});
			return NextResponse.json({ success: added });
		}

		return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
	} catch (error) {
		console.error("POST /api/library error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		if (!id) {
			return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
		}
		const removed = removeFromLibrary(id);
		return NextResponse.json({ success: removed });
	} catch (error) {
		console.error("DELETE /api/library error:", error);
		return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
	}
}

