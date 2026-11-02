import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const durationsPath = path.resolve("scripts/durations.json");
const catalogPath = path.resolve("lib/sfx-catalog.ts");
const dbPath = path.resolve("data/echodeck.sqlite");

const raw = fs.readFileSync(durationsPath, "utf-8").replace(/^\uFEFF/, "");
const durations = JSON.parse(raw);

// 1. Update lib/sfx-catalog.ts
let catalogContent = fs.readFileSync(catalogPath, "utf-8");

// Import catalog data to iterate
import("../lib/sfx-catalog.ts").then((mod) => {
	const catalog = mod.INSTALLED_SFX_CATALOG;
	let updatedCount = 0;

	for (const item of catalog) {
		const filename = item.originalFilename || `${item.id}.mp3`;
		const basename = filename.replace(/\.mp3$/, "");
		const dur = durations[filename] || durations[basename] || durations[item.id] || "0:02";

		item.duration = dur;
		updatedCount++;
	}

	const newCatalogSource = `export type ApiSfx = {
\tid: string;
\ttitle: string;
\toriginalTitle: string;
\toriginalFilename: string;
\tcategory: string;
\tdescription: string;
\tversion: "Original" | "Streamer Take";
\tcolor: string;
\tfreq: number;
\ttype: OscillatorType;
\tduration: string;
\taudioUrl: string;
\ttags: string[];
\tsource: "Myinstants (Installed)" | "Broadcast CDN";
};

export const INSTALLED_SFX_CATALOG: ApiSfx[] = ${JSON.stringify(catalog, null, 2)};
`;

	fs.writeFileSync(catalogPath, newCatalogSource, "utf-8");
	console.log(`Updated ${updatedCount} entries in lib/sfx-catalog.ts`);

	// 2. Update SQLite database
	if (fs.existsSync(dbPath)) {
		const db = new DatabaseSync(dbPath);
		const updateSfx = db.prepare("UPDATE sfx SET duration = ? WHERE id = ?");
		const updateLib = db.prepare("UPDATE library SET duration = ? WHERE sfx_id = ? OR id = ?");

		for (const item of catalog) {
			updateSfx.run(item.duration, item.id);
			updateLib.run(item.duration, item.id, item.id);
		}
		db.close();
		console.log(`Updated duration values in ${dbPath}`);
	}
});
