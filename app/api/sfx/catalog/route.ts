import { NextResponse } from "next/server";
import { BROADCAST_SFX_50 } from "@/lib/sfx-catalog";

export async function GET() {
	return NextResponse.json({
		count: BROADCAST_SFX_50.length,
		source: "Broadcast CDN Stream",
		sounds: BROADCAST_SFX_50,
	});
}
