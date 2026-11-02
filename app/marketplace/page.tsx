"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import {
	MARKETPLACE_CATALOG,
	MARKETPLACE_DECKS,
	StoredSound,
	SoundPack,
	addSoundToLibrary,
	addDeckPackToLibrary,
	getSavedLibrary,
} from "@/lib/deck-store";
import { playBroadcastSfx } from "@/lib/mock-audio";
import {
	SearchIcon,
	Volume2Icon,
	PlusIcon,
	CheckIcon,
	SparklesIcon,
	StoreIcon,
	FolderPlusIcon,
	LayersIcon,
	FlameIcon,
	RadioIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Hindi", "Funny", "Voice", "Gaming", "Horror", "Laughing", "English"];

export default function MarketplacePage() {
	const [activeCategory, setActiveCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [playingId, setPlayingId] = useState<string | null>(null);
	const [sounds, setSounds] = useState<StoredSound[]>(MARKETPLACE_CATALOG);
	const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set());
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	const fetchSfxFromDb = async () => {
		try {
			const res = await fetch("/api/sfx");
			const data = await res.json();
			if (data.success && Array.isArray(data.sounds)) {
				setSounds(data.sounds.map((s: any) => ({
					id: s.id,
					title: s.title,
					originalFilename: s.original_filename,
					category: s.category,
					description: s.description,
					audioUrl: s.audio_url,
					version: "Original",
					color: s.color,
					freq: s.freq,
					type: s.type,
					duration: s.duration,
					tags: s.tags,
					source: s.source,
				})));
				const inLib = new Set<string>();
				data.sounds.forEach((s: any) => {
					if (s.in_library) inLib.add(s.id);
				});
				setLibraryIds(inLib);
			}
		} catch {
			// Fallback to static catalog if offline
		}
	};

	useEffect(() => {
		fetchSfxFromDb();
	}, []);

	const handlePlay = (sound: StoredSound) => {
		setPlayingId(sound.id);
		playBroadcastSfx(sound.audioUrl, sound.freq, sound.type, 0.4, sound.title, sound.id);
		setTimeout(() => setPlayingId((prev) => (prev === sound.id ? null : prev)), 400);
	};

	const handleAddSound = async (sound: StoredSound) => {
		try {
			const res = await fetch("/api/library", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sfxId: sound.id }),
			});
			const data = await res.json();
			if (data.success) {
				setStatusMessage(`Added "${sound.title}" to Sound Library!`);
				setLibraryIds((prev) => new Set([...prev, sound.id]));
			} else {
				setStatusMessage(`"${sound.title}" already in your Library.`);
			}
		} catch {
			addSoundToLibrary(sound);
			setStatusMessage(`Added "${sound.title}" to Sound Library!`);
		}
		setTimeout(() => setStatusMessage(null), 3000);
	};

	const handleAddPack = async (pack: SoundPack) => {
		try {
			for (const s of pack.sounds) {
				await fetch("/api/library", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ sfxId: s.id }),
				}).catch(() => {});
			}
			setLibraryIds((prev) => new Set([...prev, ...pack.sounds.map((s) => s.id)]));
			setStatusMessage(`Added ${pack.sounds.length} sounds from "${pack.title}" to Library!`);
		} catch {
			const added = addDeckPackToLibrary(pack);
			setStatusMessage(`Added ${added} new sounds from "${pack.title}" to Library!`);
		}
		setTimeout(() => setStatusMessage(null), 3500);
	};

	const handleLoadPackToDeck = async (pack: SoundPack) => {
		try {
			for (const s of pack.sounds) {
				await fetch("/api/library", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ sfxId: s.id }),
				}).catch(() => {});
			}
			for (let i = 0; i < Math.min(10, pack.sounds.length); i++) {
				await fetch("/api/deck", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ pageIndex: 0, slotIndex: i, soundId: pack.sounds[i].id }),
				}).catch(() => {});
			}
			setLibraryIds((prev) => new Set([...prev, ...pack.sounds.map((s) => s.id)]));
			setStatusMessage(`Applied "${pack.title}" directly to Deck Page 1!`);
			window.dispatchEvent(new Event("echodeck_layout_updated"));
		} catch {
			// Fallback
		}
		setTimeout(() => setStatusMessage(null), 3500);
	};

	const filteredSounds = sounds.filter((s) => {
		const matchesCategory = activeCategory === "All" || s.category === activeCategory;
		const matchesSearch =
			s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	return (
		<AppShell pathname="/marketplace">
			<div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-2">
				{/* Marketplace Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
					<div>
						<div className="flex items-center gap-2.5">
							<div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
								<StoreIcon className="size-5" />
							</div>
							<h1 className="text-2xl font-bold tracking-tight text-zinc-100">SFX Marketplace</h1>
						</div>
						<p className="text-xs sm:text-sm text-zinc-400 mt-1">
							Discover community sounds and curated 10-SFX decks. Preview anytime and add directly to your Sound Library.
						</p>
					</div>

					{/* Search Input */}
					<div className="relative w-full sm:w-72">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
						<input
							type="text"
							placeholder="Search sounds or tags..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-xl bg-[#1f1f23] pl-9 pr-4 py-2 text-xs text-zinc-100 border border-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all"
						/>
					</div>
				</div>

				{/* Toast Banner */}
				{statusMessage && (
					<div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-in fade-in duration-200">
						<CheckIcon className="size-4 shrink-0" />
						{statusMessage}
					</div>
				)}

				{/* Category Pills Bar */}
				<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={cn(
								"px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border",
								activeCategory === cat
									? "bg-purple-600 text-white border-purple-500 shadow-sm"
									: "bg-[#1f1f23] text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
							)}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Section 1: Curated Decks & Playlists (10 SFX Bundles) */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<LayersIcon className="size-4 text-purple-400" />
							<h2 className="text-base sm:text-lg font-bold text-zinc-100">Featured 10-SFX Stream Decks</h2>
						</div>
						<span className="text-xs text-zinc-500">1-click import into Library</span>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{MARKETPLACE_DECKS.map((pack) => (
							<div
								key={pack.id}
								className={cn(
									"group relative flex flex-col justify-between rounded-[24px] p-6 border border-zinc-800/80 shadow-xl overflow-hidden",
									"bg-gradient-to-br bg-[#18181b]",
									pack.coverGradient
								)}
							>
								<div>
									<div className="flex items-center justify-between mb-3">
										<span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/90 uppercase tracking-wider backdrop-blur-md">
											{pack.category} Pack
										</span>
										<span className="text-xs font-mono font-semibold text-purple-300">
											10 Complete SFX
										</span>
									</div>
									<h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
										{pack.title}
									</h3>
									<p className="text-xs text-zinc-300/80 mt-1 line-clamp-2">
										{pack.description}
									</p>
								</div>

								{/* Track previews inside pack */}
								<div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-1.5 items-center">
									{pack.sounds.slice(0, 5).map((s) => (
										<button
											key={s.id}
											onClick={() => handlePlay(s)}
											type="button"
											className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-medium text-white flex items-center gap-1 transition-colors cursor-pointer"
										>
											<Volume2Icon className="size-2.5" />
											{s.title}
										</button>
									))}
									<span className="text-[10px] text-zinc-400">+5 more</span>
								</div>

								{/* Action CTAs */}
								<div className="mt-5 flex flex-wrap items-center justify-between gap-2">
									<span className="text-xs font-semibold text-emerald-400">10-SFX PACK</span>
									<div className="flex items-center gap-2">
										<button
											onClick={() => handleAddPack(pack)}
											type="button"
											className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
										>
											<FolderPlusIcon className="size-3.5" />
											+ Library
										</button>
										<button
											onClick={() => handleLoadPackToDeck(pack)}
											type="button"
											className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102"
										>
											<LayersIcon className="size-3.5" />
											Apply to Deck
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Section 2: Individual Sound Effects Catalog */}
				<div className="flex flex-col gap-4 mt-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<FlameIcon className="size-4 text-amber-400" />
							<h2 className="text-base sm:text-lg font-bold text-zinc-100">
								Individual Sound Effects ({filteredSounds.length})
							</h2>
						</div>
						<span className="text-xs text-zinc-500">Click to listen • Add to library</span>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{filteredSounds.map((sound) => {
							const isPlaying = playingId === sound.id;
							const inLibrary = libraryIds.has(sound.id);

							return (
								<div
									key={sound.id}
									className={cn(
										"group relative flex flex-col justify-between rounded-[22px] p-4 bg-[#1f1f23] border border-zinc-800/80 shadow-md transition-all duration-150",
										"hover:bg-[#27272c] hover:border-zinc-700/80 hover:-translate-y-0.5",
										isPlaying && "border-purple-500 ring-2 ring-purple-500/40 bg-[#2d2d34]"
									)}
								>
									{/* Top Bar: Category badge & Duration */}
									<div className="flex items-center justify-between w-full mb-3">
										<span className="rounded-full bg-zinc-800/90 px-2 py-0.5 text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
											{sound.category}
										</span>
										<span className="text-[10px] font-mono text-zinc-500">{sound.duration}</span>
									</div>

									{/* Center Clickable Trigger for Sound */}
									<button
										onClick={() => handlePlay(sound)}
										type="button"
										className="my-3 flex flex-col items-center justify-center gap-2 cursor-pointer group-hover:scale-102 transition-transform select-none"
									>
										<div
											className={cn(
												"size-12 rounded-full flex items-center justify-center transition-all shadow-md",
												isPlaying
													? "bg-purple-500 text-white scale-110 shadow-purple-500/50"
													: "bg-zinc-800 group-hover:bg-purple-600 text-zinc-200 group-hover:text-white"
											)}
										>
											<Volume2Icon className={cn("size-5", isPlaying && "animate-pulse")} />
										</div>
										<div className="flex flex-col items-center max-w-full px-1">
											<span className="text-xs font-bold text-zinc-100 group-hover:text-purple-300 truncate max-w-full text-center">
												{sound.title}
											</span>
											{sound.description && (
												<span className="text-[10px] text-zinc-400 line-clamp-1 text-center mt-0.5 leading-snug">
													{sound.description}
												</span>
											)}
										</div>
									</button>

									{/* Bottom Action: Add to Library */}
									<div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
										<span className="text-[10px] font-mono text-zinc-500 truncate max-w-[90px]" title={sound.originalFilename || ""}>
											{sound.originalFilename ? sound.originalFilename.replace(".mp3", "") : "Local MP3"}
										</span>
										<button
											onClick={() => handleAddSound(sound)}
											disabled={inLibrary}
											type="button"
											className={cn(
												"flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
												inLibrary
													? "bg-zinc-800 text-emerald-400 cursor-default"
													: "bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30"
											)}
										>
											{inLibrary ? (
												<>
													<CheckIcon className="size-3" />
													In Library
												</>
											) : (
												<>
													<PlusIcon className="size-3" />
													Add
												</>
											)}
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</AppShell>
	);
}
