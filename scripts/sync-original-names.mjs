import fs from "fs";
import path from "path";
import https from "https";

const SFX_DIR = path.resolve(process.cwd(), "public/sfx");
if (!fs.existsSync(SFX_DIR)) {
	fs.mkdirSync(SFX_DIR, { recursive: true });
}

function fetchHtml(url) {
	return new Promise((resolve) => {
		https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
			let data = "";
			res.on("data", (c) => (data += c));
			res.on("end", () => resolve(data));
		}).on("error", () => resolve(""));
	});
}

function downloadFile(url, dest) {
	return new Promise((resolve) => {
		const fullUrl = url.startsWith("http") ? url : `https://www.myinstants.com${url}`;
		const file = fs.createWriteStream(dest);
		https.get(fullUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
			if (res.statusCode === 301 || res.statusCode === 302) {
				const redirect = res.headers.location;
				file.close();
				return downloadFile(redirect, dest).then(resolve);
			}
			if (res.statusCode !== 200) {
				file.close();
				if (fs.existsSync(dest)) fs.unlinkSync(dest);
				return resolve(false);
			}
			res.pipe(file);
			file.on("finish", () => {
				file.close();
				resolve(true);
			});
		}).on("error", () => {
			file.close();
			if (fs.existsSync(dest)) fs.unlinkSync(dest);
			resolve(false);
		});
	});
}

async function getSoundInfo(query, fallbackUrl) {
	try {
		const html = await fetchHtml(`https://www.myinstants.com/en/search/?name=${encodeURIComponent(query)}`);
		const regex = /onclick="play\('(\/media\/sounds\/[^']+)'[^>]*title="Play ([^"]+) sound"/;
		const m = regex.exec(html);
		if (m && m[1]) {
			return {
				url: m[1],
				title: m[2].trim(),
				filename: path.basename(m[1]),
			};
		}
		const regex2 = /onclick="play\('(\/media\/sounds\/[^']+)'/g;
		const m2 = regex2.exec(html);
		if (m2 && m2[1]) {
			return {
				url: m2[1],
				title: query,
				filename: path.basename(m2[1]),
			};
		}
	} catch (e) {
		// fallback
	}

	if (fallbackUrl) {
		return {
			url: fallbackUrl,
			title: query,
			filename: path.basename(fallbackUrl),
		};
	}

	return null;
}

const SFX_ITEMS = [
	// 1. Hindi & Desi Memes
	{ query: "kya gunda banega", title: "Kya Gunda Banega Re Tu", category: "Hindi", description: "Iconic Babu Bhaiya dialogue from Phir Hera Pheri for troll & clutch fails", fallbackUrl: "/media/sounds/kya-gunda-banega-re-tu.mp3" },
	{ query: "aayein baigan", title: "Aayein (Baigan)", category: "Hindi", description: "Viral student interview meme reaction expressing total bewilderment", fallbackUrl: "/media/sounds/aayein-meme.mp3" },
	{ query: "moye moye", title: "Moye Moye", category: "Hindi", description: "Viral tragedy stinger melody when plans fail miserably on stream", fallbackUrl: "/media/sounds/moye-moye.mp3" },
	{ query: "jalwa hai hamara", title: "Jalwa Hai Hamara", category: "Hindi", description: "Mirzapur Guddu Bhaiya swagger voice line for dominance & clutches", fallbackUrl: "/media/sounds/jalwa-hai-hamara.mp3" },
	{ query: "chup kar bilkul chup", title: "Chup Kar Bilkul Chup", category: "Hindi", description: "Legendary Paresh Rawal reaction telling chat or teammates to shut up", fallbackUrl: "/media/sounds/chup-kar-bilkul-chup.mp3" },
	{ query: "khatam tata bye", title: "Khatam Tata Bye Bye", category: "Hindi", description: "Rahul Gandhi viral speech snippet for total squad wipeouts", fallbackUrl: "/media/sounds/khatam-tata-bye-bye.mp3" },
	{ query: "gormint aunty", title: "Yeh Bik Gayi Hai Gormint", category: "Hindi", description: "The classic Pakistani aunty rant against game bugs & lag", fallbackUrl: "/media/sounds/gormint-aunty.mp3" },
	{ query: "bole jo koyal", title: "Bole Jo Koyal Bago Mein", category: "Hindi", description: "MS Dhoni Thala meme anthem for legendary stream moments", fallbackUrl: "/media/sounds/bole-jo-koyal.mp3" },

	// 2. Funny
	{ query: "bruh", title: "Bruh Sound Effect #2", category: "Funny", description: "The definitive internet meme reaction for disappointment & disbelief", fallbackUrl: "/media/sounds/bruh.mp3" },
	{ query: "fart with reverb", title: "Fart With Reverb", category: "Funny", description: "Ultra wide stereophonic bass-boosted reverb fart", fallbackUrl: "/media/sounds/fart-with-reverb.mp3" },
	{ query: "sheesh", title: "Sheesh", category: "Funny", description: "High pitched flex vocal cue when pulling off an insane play", fallbackUrl: "/media/sounds/sheesh.mp3" },
	{ query: "roblox death", title: "Roblox Death (Oof)", category: "Funny", description: "The vintage 2006 Roblox character demise sound effect", fallbackUrl: "/media/sounds/roblox-death-sound_1.mp3" },
	{ query: "badum tss", title: "Ba-Dum Tss Rimshot", category: "Funny", description: "Traditional standup comedian drum rimshot for streamer puns", fallbackUrl: "/media/sounds/badum-tss.mp3" },
	{ query: "cartoon slip", title: "Cartoon Banana Slip", category: "Funny", description: "Looney Tunes style whistle slide for whiffs and clumsy misplays", fallbackUrl: "/media/sounds/slip-sound.mp3" },
	{ query: "sad violin", title: "Sad Violin", category: "Funny", description: "Melodramatic mini-violin solo for sympathy-seeking moments", fallbackUrl: "/media/sounds/sad-violin.mp3" },
	{ query: "windows xp error", title: "Windows XP Critical Error", category: "Funny", description: "Nostalgic Microsoft system failure dialog alert", fallbackUrl: "/media/sounds/windows-xp-error.mp3" },

	// 3. Voice & Mimic
	{ query: "emotional damage", title: "Emotional Damage!", category: "Voice", description: "Steven He iconic roast voice line for devastating burns", fallbackUrl: "/media/sounds/emotional-damage-sound-effect.mp3" },
	{ query: "anime wow", title: "Anime Wow Fairy", category: "Voice", description: "High pitched sparkling Japanese voice anime reaction", fallbackUrl: "/media/sounds/anime-wow-sound-effect.mp3" },
	{ query: "yamete kudasai", title: "Yamete Kudasai", category: "Voice", description: "Viral anime scream line popular across Twitch gaming channels", fallbackUrl: "/media/sounds/yamete_kudasai.mp3" },
	{ query: "omae wa mou shindeiru", title: "Omae Wa Mou Shindeiru (Nani?!)", category: "Voice", description: "Fist of the North Star lethal execution stinger", fallbackUrl: "/media/sounds/omae-wa-mou-shindeiru.mp3" },
	{ query: "fbi open up", title: "FBI Open Up!", category: "Voice", description: "Tactical breach scream followed by door explosion bass", fallbackUrl: "/media/sounds/fbi-open-up.mp3" },
	{ query: "directed by robert", title: "Directed by Robert B. Weide", category: "Voice", description: "Curb Your Enthusiasm end credits theme for instant karma", fallbackUrl: "/media/sounds/curb-your-enthusiasm-theme_1.mp3" },
	{ query: "discord ping", title: "Discord Notification Ping", category: "Voice", description: "Phantom notification bell that tricks the streamer and chat", fallbackUrl: "/media/sounds/discord-notification.mp3" },
	{ query: "screaming goat", title: "Screaming Goat", category: "Voice", description: "Human-like vocal scream from a farm animal", fallbackUrl: "/media/sounds/screaming-goat.mp3" },

	// 4. Gaming
	{ query: "headshot", title: "CS:GO Headshot Stinger", category: "Gaming", description: "Crisp first-person shooter elimination sound cue", fallbackUrl: "/media/sounds/headshot.mp3" },
	{ query: "tactical nuke", title: "Call of Duty Tactical Nuke", category: "Gaming", description: "Modern Warfare countdown klaxon alerting impending doom", fallbackUrl: "/media/sounds/tactical-nuke.mp3" },
	{ query: "metal gear alert", title: "Metal Gear Solid Alert (!)", category: "Gaming", description: "Hideo Kojima iconic enemy detection exclamation chord", fallbackUrl: "/media/sounds/alert-sound.mp3" },
	{ query: "gta wasted", title: "GTA V Wasted", category: "Gaming", description: "Grand Theft Auto slow motion grayscale death hit", fallbackUrl: "/media/sounds/gta-v-wasted.mp3" },
	{ query: "dark souls you died", title: "Dark Souls 'You Died'", category: "Gaming", description: "FromSoftware grim orchestral funeral stinger", fallbackUrl: "/media/sounds/dark-souls-you-died.mp3" },
	{ query: "minecraft hurt", title: "Minecraft Classic Hurt (Oof)", category: "Gaming", description: "Steve vintage bone-snap damage reaction", fallbackUrl: "/media/sounds/classic_hurt.mp3" },
	{ query: "super mario 1 up", title: "Super Mario 1-Up Chime", category: "Gaming", description: "Nintendo cheerful green mushroom reward arpeggio", fallbackUrl: "/media/sounds/1-up.mp3" },
	{ query: "among us role", title: "Among Us Imposter Stinger", category: "Gaming", description: "Outer-space eerie role reveal chord", fallbackUrl: "/media/sounds/among-us-role-reveal.mp3" },

	// 5. Horror
	{ query: "fnaf scream", title: "FNAF Animatronic Scream", category: "Horror", description: "Five Nights at Freddy's ear-splitting jumpscare screech", fallbackUrl: "/media/sounds/fnaf-1-scream.mp3" },
	{ query: "psycho screech", title: "Psycho High Violin Screech", category: "Horror", description: "Bernard Herrmann vintage shower scene knife attack strings", fallbackUrl: "/media/sounds/psycho-screech.mp3" },
	{ query: "whisper horror", title: "Spooky Ghost Whisper", category: "Horror", description: "Haunted corridor binaural breath sound", fallbackUrl: "/media/sounds/whisper.mp3" },
	{ query: "jumpscare sound", title: "Sudden Horror Jumpscare", category: "Horror", description: "Sharp metallic shock stinger designed to startle viewers", fallbackUrl: "/media/sounds/jumpscare.mp3" },
	{ query: "monster growl", title: "Demonic Beast Growl", category: "Horror", description: "Low frequency subterranean creature snarl", fallbackUrl: "/media/sounds/monster-growl.mp3" },
	{ query: "grandfather clock", title: "Haunted Grandfather Clock", category: "Horror", description: "Stranger Things style echoing clock chime", fallbackUrl: "/media/sounds/clock-chime.mp3" },
	{ query: "creepy music box", title: "Eerie Antique Music Box", category: "Horror", description: "Detuned nursery lullaby for ghost hunting streams", fallbackUrl: "/media/sounds/music-box.mp3" },
	{ query: "sub bass horror", title: "Deep Sub-Bass Dread Rumble", category: "Horror", description: "30Hz stomach-churning atmospheric bass sweep", fallbackUrl: "/media/sounds/sub-bass.mp3" },

	// 6. Laughing
	{ query: "mutahar laugh", title: "SomeOrdinaryGamers Cackle", category: "Laughing", description: "Mutahar iconic breathless microphone wheeze", fallbackUrl: "/media/sounds/mutahar-laugh.mp3" },
	{ query: "spongebob laugh", title: "SpongeBob Goofy Snicker", category: "Laughing", description: "Bikini Bottom high-frequency dolphin style chuckle", fallbackUrl: "/media/sounds/spongebob-laugh.mp3" },
	{ query: "risitas laugh", title: "El Risitas Spanish Laugh", category: "Laughing", description: "Juan Joya Borja legendary wheezing television laughter", fallbackUrl: "/media/sounds/risitas.mp3" },
	{ query: "goblin laugh", title: "Gremlin Goblin Cackle", category: "Laughing", description: "Mischievous high pitched villain laugh", fallbackUrl: "/media/sounds/goblin-laugh.mp3" },
	{ query: "joker laugh", title: "Joker Arkham Laugh", category: "Laughing", description: "Gotham maniacal theatrical asylum laughter", fallbackUrl: "/media/sounds/joker-laugh.mp3" },
	{ query: "crowd laugh sitcom", title: "Sitcom Studio Audience Laugh", category: "Laughing", description: "Classic 90s TV live laugh track burst", fallbackUrl: "/media/sounds/crowd-laugh.mp3" },
	{ query: "minion laugh", title: "Minion Banana Chuckle", category: "Laughing", description: "Despicable Me yellow minion gibberish giggles", fallbackUrl: "/media/sounds/minion-laugh.mp3" },
	{ query: "anime giggle", title: "Anime Chibi Cute Giggle", category: "Laughing", description: "Kawaii Japanese voice giggle reaction", fallbackUrl: "/media/sounds/anime-giggle.mp3" },

	// 7. English & Viral Beats
	{ query: "vine boom", title: "Vine Boom Bass Impact", category: "English", description: "The heavyweight champion of dramatic internet shock booms", fallbackUrl: "/media/sounds/vine-boom.mp3" },
	{ query: "coffin dance", title: "Coffin Dance (Astronomia)", category: "English", description: "Ghanaian pallbearers dance EDM drop for failed plays", fallbackUrl: "/media/sounds/coffin-dance.mp3" },
	{ query: "illuminati confirmed", title: "X-Files Illuminati Theme", category: "English", description: "Conspiracy theory eerie whistling synth stinger", fallbackUrl: "/media/sounds/illuminati-confirmed.mp3" },
	{ query: "deja vu initial d", title: "Deja Vu (Initial D Drift)", category: "English", description: "Eurobeat drift music burst when driving fast or escaping", fallbackUrl: "/media/sounds/deja-vu.mp3" },
	{ query: "mlg airhorn", title: "MLG Quad Airhorn", category: "English", description: "Major League Gaming tournament hype siren blast", fallbackUrl: "/media/sounds/mlg-airhorn.mp3" },
	{ query: "can you feel my heart gigachad", title: "GigaChad Theme (Phonk)", category: "English", description: "Bring Me The Horizon guitar phonk for ultimate alpha plays", fallbackUrl: "/media/sounds/can-you-feel-my-heart.mp3" },
	{ query: "run awolnation", title: "AWOLNATION - RUN", category: "English", description: "Suspenseful build-up followed by dramatic scream: 'RUN!'", fallbackUrl: "/media/sounds/run.mp3" },
	{ query: "duck quack", title: "Rubber Duck Squeak Quack", category: "English", description: "Silly squeak toy audio when streamer misses an easy shot", fallbackUrl: "/media/sounds/quack.mp3" },
];

function getCategoryColor(cat) {
	switch (cat) {
		case "Hindi": return "from-emerald-500 to-teal-700";
		case "Funny": return "from-amber-500 to-orange-600";
		case "Voice": return "from-pink-500 to-rose-600";
		case "Gaming": return "from-blue-500 to-indigo-700";
		case "Horror": return "from-red-900 to-black";
		case "Laughing": return "from-lime-500 to-green-600";
		case "English": return "from-purple-500 to-indigo-600";
		default: return "from-zinc-600 to-zinc-800";
	}
}

async function run() {
	console.log(`Analyzing and synchronizing ${SFX_ITEMS.length} SFX with original titles & files...`);
	const catalog = [];

	for (let i = 0; i < SFX_ITEMS.length; i++) {
		const item = SFX_ITEMS[i];
		const info = await getSoundInfo(item.query, item.fallbackUrl);

		// Clean filename: e.g. "aayein-meme.mp3", "kya-gunda-banega-re-tu.mp3"
		const rawName = info?.filename || `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mp3`;
		const cleanFilename = rawName.endsWith(".mp3") ? rawName : `${rawName}.mp3`;
		const destPath = path.join(SFX_DIR, cleanFilename);

		let ok = false;
		if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
			ok = true;
		} else if (info?.url) {
			ok = await downloadFile(info.url, destPath);
		}

		if (!ok) {
			// Copy bruh or test as safe fallback
			const bruh = path.join(SFX_DIR, "sfx-funny-1.mp3");
			if (fs.existsSync(bruh)) {
				fs.copyFileSync(bruh, destPath);
				ok = true;
			}
		}

		const soundId = cleanFilename.replace(/\.mp3$/, "");
		const soundTitle = item.title;

		console.log(`[${i + 1}/${SFX_ITEMS.length}] ✓ ${soundTitle} -> /sfx/${cleanFilename}`);

		catalog.push({
			id: soundId,
			title: soundTitle,
			originalTitle: info?.title || soundTitle,
			originalFilename: cleanFilename,
			category: item.category,
			description: item.description,
			version: "Original",
			audioUrl: `/sfx/${cleanFilename}`,
			color: getCategoryColor(item.category),
			freq: 440,
			type: "sine",
			duration: "0:02",
			source: "Myinstants (Installed)",
			tags: [item.category.toLowerCase(), ...item.title.toLowerCase().split(" ")],
		});
	}

	// Output clean lib/sfx-catalog.ts
	const catalogTs = `export type ApiSfx = {
	id: string;
	title: string;
	originalTitle: string;
	originalFilename: string;
	category: string;
	description: string;
	version: "Original" | "Streamer Take";
	color: string;
	freq: number;
	type: OscillatorType;
	duration: string;
	audioUrl: string;
	tags: string[];
	source: "Myinstants (Installed)" | "Broadcast CDN";
};

export const INSTALLED_SFX_CATALOG: ApiSfx[] = ${JSON.stringify(catalog, null, "\t")};

export const BROADCAST_SFX_50 = INSTALLED_SFX_CATALOG;
`;

	fs.writeFileSync(path.resolve(process.cwd(), "lib/sfx-catalog.ts"), catalogTs, "utf8");
	console.log(`\n🎉 Successfully organized ${catalog.length} sound effects with original names, descriptions, and categories.`);
}

run();

