import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import { INSTALLED_SFX_CATALOG } from "@/lib/sfx-catalog";

const DB_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
	fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, "echodeck.sqlite");

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
	if (_db) return _db;

	_db = new DatabaseSync(DB_PATH);

	// Enable WAL mode for high concurrency
	_db.exec("PRAGMA journal_mode = WAL;");

	// Initialize tables
	_db.exec(`
		CREATE TABLE IF NOT EXISTS sfx (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			original_title TEXT,
			original_filename TEXT,
			category TEXT NOT NULL,
			description TEXT,
			audio_url TEXT NOT NULL,
			color TEXT,
			freq REAL DEFAULT 440,
			type TEXT DEFAULT 'sine',
			duration TEXT DEFAULT '0:02',
			tags TEXT,
			source TEXT DEFAULT 'Myinstants (Installed)'
		);

		CREATE TABLE IF NOT EXISTS library (
			id TEXT PRIMARY KEY,
			sfx_id TEXT,
			title TEXT NOT NULL,
			category TEXT NOT NULL,
			description TEXT,
			audio_url TEXT NOT NULL,
			version TEXT DEFAULT 'Original',
			source TEXT DEFAULT 'Library',
			color TEXT,
			freq REAL DEFAULT 440,
			type TEXT DEFAULT 'sine',
			duration TEXT DEFAULT '0:02',
			added_at INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS deck_slots (
			page_index INTEGER NOT NULL,
			slot_index INTEGER NOT NULL,
			sound_id TEXT NOT NULL,
			PRIMARY KEY (page_index, slot_index)
		);

		CREATE TABLE IF NOT EXISTS mimic_takes (
			id TEXT PRIMARY KEY,
			reference_sfx_id TEXT,
			title TEXT NOT NULL,
			audio_data TEXT,
			score INTEGER DEFAULT 85,
			take_number INTEGER DEFAULT 1,
			created_at INTEGER NOT NULL
		);
	`);

	// Seed SFX table if empty
	const countRow = _db.prepare("SELECT COUNT(*) as count FROM sfx").get() as { count: number };
	if (countRow.count === 0) {
		const insertStmt = _db.prepare(`
			INSERT OR REPLACE INTO sfx (
				id, title, original_title, original_filename, category,
				description, audio_url, color, freq, type, duration, tags, source
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		for (const item of INSTALLED_SFX_CATALOG) {
			insertStmt.run(
				item.id,
				item.title,
				item.originalTitle || item.title,
				item.originalFilename || `${item.id}.mp3`,
				item.category,
				item.description || "",
				item.audioUrl,
				item.color || "from-purple-500 to-indigo-600",
				item.freq || 440,
				item.type || "sine",
				item.duration || "0:02",
				JSON.stringify(item.tags || []),
				item.source || "Myinstants (Installed)"
			);
		}
	}

	return _db;
}

// Database helper functions
export type DbSfx = {
	id: string;
	title: string;
	original_title: string;
	original_filename: string;
	category: string;
	description: string;
	audio_url: string;
	color: string;
	freq: number;
	type: OscillatorType;
	duration: string;
	tags: string[];
	source: string;
	in_library?: boolean;
};

export type DbLibraryItem = {
	id: string;
	sfx_id: string;
	title: string;
	category: string;
	description: string;
	audio_url: string;
	version: "Original" | "Streamer Take";
	source: string;
	color: string;
	freq: number;
	type: OscillatorType;
	duration: string;
	added_at: number;
};

export function getAllSfx(): DbSfx[] {
	const db = getDb();
	const rows = db.prepare(`
		SELECT s.*, 
			CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END as in_library
		FROM sfx s
		LEFT JOIN library l ON l.sfx_id = s.id OR l.id = s.id
		ORDER BY s.category ASC, s.title ASC
	`).all() as any[];

	return rows.map((r) => ({
		id: r.id,
		title: r.title,
		original_title: r.original_title,
		original_filename: r.original_filename,
		category: r.category,
		description: r.description,
		audio_url: r.audio_url,
		color: r.color,
		freq: r.freq,
		type: r.type,
		duration: r.duration,
		tags: r.tags ? JSON.parse(r.tags) : [],
		source: r.source,
		in_library: Boolean(r.in_library),
	}));
}

export function getLibraryItems(): DbLibraryItem[] {
	const db = getDb();
	const rows = db.prepare(`
		SELECT * FROM library ORDER BY added_at DESC
	`).all() as any[];

	return rows.map((r) => ({
		id: r.id,
		sfx_id: r.sfx_id,
		title: r.title,
		category: r.category,
		description: r.description,
		audio_url: r.audio_url,
		version: r.version,
		source: r.source,
		color: r.color,
		freq: r.freq,
		type: r.type,
		duration: r.duration,
		added_at: r.added_at,
	}));
}

export function addToLibrary(item: {
	id?: string;
	sfx_id?: string;
	title: string;
	category: string;
	description?: string;
	audio_url: string;
	version?: "Original" | "Streamer Take";
	source?: string;
	color?: string;
	freq?: number;
	type?: OscillatorType;
	duration?: string;
}): boolean {
	const db = getDb();
	const id = item.id || `lib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
	const sfxId = item.sfx_id || id;

	// Check if already in library
	const exists = db.prepare("SELECT id FROM library WHERE id = ? OR sfx_id = ?").get(id, sfxId);
	if (exists) return false;

	db.prepare(`
		INSERT INTO library (
			id, sfx_id, title, category, description, audio_url,
			version, source, color, freq, type, duration, added_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`).run(
		id,
		sfxId,
		item.title,
		item.category,
		item.description || "",
		item.audio_url,
		item.version || "Original",
		item.source || "Library",
		item.color || "from-purple-500 to-indigo-600",
		item.freq || 440,
		item.type || "sine",
		item.duration || "0:02",
		Date.now()
	);

	return true;
}

export function removeFromLibrary(id: string): boolean {
	const db = getDb();
	const res = db.prepare("DELETE FROM library WHERE id = ? OR sfx_id = ?").run(id, id);
	return res.changes > 0;
}

export function getDeckLayout(): Array<{ pageIndex: number; title: string; category: string; soundIds: string[] }> {
	const db = getDb();
	const rows = db.prepare("SELECT * FROM deck_slots ORDER BY page_index ASC, slot_index ASC").all() as any[];

	if (rows.length === 0) {
		// Single empty page with 10 empty slots by default
		return [
			{
				pageIndex: 0,
				title: "My First Deck",
				category: "Custom Stream Deck",
				soundIds: Array.from({ length: 10 }, (_, i) => `empty-1-${i + 1}`),
			},
		];
	}

	const maxPage = Math.max(...rows.map((r) => r.page_index), 0);
	const pages: Array<{ pageIndex: number; title: string; category: string; soundIds: string[] }> = [];

	for (let p = 0; p <= maxPage; p++) {
		const pageSlots = Array.from({ length: 10 }, (_, i) => `empty-${p + 1}-${i + 1}`);
		rows.filter((r) => r.page_index === p).forEach((r) => {
			if (r.slot_index >= 0 && r.slot_index < 10) {
				pageSlots[r.slot_index] = r.sound_id;
			}
		});

		pages.push({
			pageIndex: p,
			title: p === 0 ? "My First Deck" : `Deck Page ${p + 1}`,
			category: "Custom Stream Deck",
			soundIds: pageSlots,
		});
	}

	return pages;
}

export function setDeckSlot(pageIndex: number, slotIndex: number, soundId: string): void {
	const db = getDb();
	db.prepare(`
		INSERT OR REPLACE INTO deck_slots (page_index, slot_index, sound_id)
		VALUES (?, ?, ?)
	`).run(pageIndex, slotIndex, soundId);
}

export function swapDeckSlots(
	source: { pageIndex: number; slotIndex: number },
	target: { pageIndex: number; slotIndex: number }
): void {
	const db = getDb();
	const sourceRow = db.prepare("SELECT sound_id FROM deck_slots WHERE page_index = ? AND slot_index = ?").get(source.pageIndex, source.slotIndex) as any;
	const targetRow = db.prepare("SELECT sound_id FROM deck_slots WHERE page_index = ? AND slot_index = ?").get(target.pageIndex, target.slotIndex) as any;

	const sourceId = sourceRow?.sound_id || `empty-${source.pageIndex + 1}-${source.slotIndex + 1}`;
	const targetId = targetRow?.sound_id || `empty-${target.pageIndex + 1}-${target.slotIndex + 1}`;

	db.prepare("INSERT OR REPLACE INTO deck_slots (page_index, slot_index, sound_id) VALUES (?, ?, ?)").run(source.pageIndex, source.slotIndex, targetId);
	db.prepare("INSERT OR REPLACE INTO deck_slots (page_index, slot_index, sound_id) VALUES (?, ?, ?)").run(target.pageIndex, target.slotIndex, sourceId);
}

export function saveMimicTake(take: {
	referenceSfxId: string;
	title: string;
	audioData: string;
	score: number;
	takeNumber: number;
}): string {
	const db = getDb();
	const id = `mimic-${Date.now()}`;
	db.prepare(`
		INSERT INTO mimic_takes (id, reference_sfx_id, title, audio_data, score, take_number, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`).run(id, take.referenceSfxId, take.title, take.audioData, take.score, take.takeNumber, Date.now());

	// Also add directly into library as a Streamer Take!
	addToLibrary({
		id,
		sfx_id: id,
		title: take.title,
		category: "Mimic Studio",
		description: `Mimic take score: ${take.score}% vocal similarity`,
		audio_url: take.audioData,
		version: "Streamer Take",
		source: "Mimic Studio",
		color: "from-purple-500 to-pink-600",
	});

	return id;
}

export function getMimicTakes(): any[] {
	const db = getDb();
	return db.prepare("SELECT * FROM mimic_takes ORDER BY created_at DESC").all();
}

