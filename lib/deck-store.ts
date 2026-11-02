// Central shared storage for EchoDeck: Marketplace, Library, Deck slots, and Mimic takes.
import { BROADCAST_SFX_50 } from "@/lib/sfx-catalog";

export type StoredSound = {
	id: string;
	title: string;
	category: string;
	description?: string;
	originalFilename?: string;
	version: "Original" | "Streamer Take";
	color: string;
	freq: number;
	type: OscillatorType;
	duration: string;
	audioUrl?: string;
	isEmpty?: boolean;
	plays?: number;
	source: "Marketplace" | "Mimic Studio" | "Upload" | "Default" | "Installed" | "Broadcast CDN";
	tags?: string[];
};

export type SoundPack = {
	id: string;
	title: string;
	category: string;
	description: string;
	soundCount: number;
	coverGradient: string;
	sounds: StoredSound[];
};

// Streamer's Library starts completely empty for fresh onboarding
export const INITIAL_LIBRARY_SOUNDS: StoredSound[] = [];

// 56 Installed Local SFX from Myinstants
export const MARKETPLACE_CATALOG: StoredSound[] = BROADCAST_SFX_50 as StoredSound[];

export const MARKETPLACE_DECKS: SoundPack[] = [
	{
		id: "deck-hindi",
		title: "Hindi & Desi Viral Memes",
		category: "Hindi",
		description: "Top Indian streaming audio cues: Kya Gunda Banega Re, Aayein, Moye Moye, Jalwa Hai Hamara, Chup Kar, and Gormint.",
		soundCount: 8,
		coverGradient: "from-emerald-700 via-teal-900 to-black",
		sounds: (BROADCAST_SFX_50.filter((s) => s.category === "Hindi") as StoredSound[]),
	},
	{
		id: "deck-comedy",
		title: "Ultimate Meme & Laughs",
		category: "Funny",
		description: "Crowd-pleaser buzzer reactions: Bruh, Fart Reverb, Sheesh, Ba-Dum Tss, Cartoon Slip, and Roblox Oof.",
		soundCount: 8,
		coverGradient: "from-amber-600 via-orange-800 to-zinc-950",
		sounds: (BROADCAST_SFX_50.filter((s) => s.category === "Funny") as StoredSound[]),
	},
	{
		id: "deck-gaming",
		title: "Pro Gaming & Clutch Alerts",
		category: "Gaming",
		description: "Iconic gaming cues: CS:GO headshot, tactical nuke, GTA wasted, Mario 1-Up, and Minecraft hurt.",
		soundCount: 8,
		coverGradient: "from-blue-600 via-indigo-900 to-black",
		sounds: (BROADCAST_SFX_50.filter((s) => s.category === "Gaming") as StoredSound[]),
	},
	{
		id: "deck-voice",
		title: "Voice & Mimic Studio Pack",
		category: "Voice",
		description: "Viral vocal clips: Emotional Damage, Anime Wow, Yamete Kudasai, Omae Wa Mou Shindeiru, and FBI Open Up.",
		soundCount: 8,
		coverGradient: "from-pink-600 via-purple-900 to-black",
		sounds: (BROADCAST_SFX_50.filter((s) => s.category === "Voice") as StoredSound[]),
	},
	{
		id: "deck-horror",
		title: "Jumpscare & Horror Stinger",
		category: "Horror",
		description: "Hair-raising ambient stingers: FNAF scream, psycho screech, creepy whisper, and jumpscares.",
		soundCount: 8,
		coverGradient: "from-red-950 via-zinc-900 to-black",
		sounds: (BROADCAST_SFX_50.filter((s) => s.category === "Horror") as StoredSound[]),
	},
];

// Helper functions for persistent storage
export function getSavedLibrary(): StoredSound[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem("echodeck_user_library");
		if (raw !== null) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return parsed;
		}
	} catch {
		// Ignore parse errors
	}
	return [];
}

export function saveLibrary(sounds: StoredSound[]): void {
	if (typeof window === "undefined") return;
	localStorage.setItem("echodeck_user_library", JSON.stringify(sounds));
	window.dispatchEvent(new Event("echodeck_library_updated"));
}

export function addSoundToLibrary(sound: StoredSound): boolean {
	const current = getSavedLibrary();
	if (current.some((s) => s.id === sound.id || s.title.toLowerCase() === sound.title.toLowerCase())) {
		return false; // already exists
	}
	const updated = [sound, ...current];
	saveLibrary(updated);
	return true;
}

export function addDeckPackToLibrary(pack: SoundPack): number {
	const current = getSavedLibrary();
	let addedCount = 0;
	const existingTitles = new Set(current.map((s) => s.title.toLowerCase()));

	const newSounds: StoredSound[] = [];
	for (const sound of pack.sounds) {
		if (!existingTitles.has(sound.title.toLowerCase())) {
			newSounds.push(sound);
			existingTitles.add(sound.title.toLowerCase());
			addedCount++;
		}
	}

	saveLibrary([...newSounds, ...current]);
	return addedCount;
}
