"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { StoredSound, getSavedLibrary, saveLibrary, MARKETPLACE_DECKS, MARKETPLACE_CATALOG } from "@/lib/deck-store";
import { playBroadcastSfx } from "@/lib/mock-audio";
import {
	LibraryIcon,
	SearchIcon,
	Volume2Icon,
	LayoutGridIcon,
	MicIcon,
	Trash2Icon,
	CheckIcon,
	SparklesIcon,
	PlusIcon,
	XIcon,
	StoreIcon,
	FolderPlusIcon,
	LockIcon,
	CheckCircle2Icon,
	AlertTriangleIcon,
	ZapIcon,
	LayersIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DeckPageData = {
	pageIndex: number;
	title: string;
	category: string;
	soundIds: string[];
};

export default function LibraryPage() {
	const [sounds, setSounds] = useState<StoredSound[]>([]);
	const [activeCategory, setActiveCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [playingId, setPlayingId] = useState<string | null>(null);
	const [notification, setNotification] = useState<string | null>(null);

	// Deck Assignment Modal state
	const [selectedSoundForDeck, setSelectedSoundForDeck] = useState<StoredSound | null>(null);
	const [deckPages, setDeckPages] = useState<DeckPageData[]>([
		{
			pageIndex: 0,
			title: "My First Deck",
			category: "Custom Stream Deck",
			soundIds: Array.from({ length: 10 }, (_, i) => `empty-1-${i + 1}`),
		},
	]);
	const [selectedDeckPage, setSelectedDeckPage] = useState(0);
	const [allowOverwrite, setAllowOverwrite] = useState(false);
	const [slotWarning, setSlotWarning] = useState<string | null>(null);

	// Build a fast lookup map for sound titles
	const soundMap = new Map<string, string>();
	MARKETPLACE_CATALOG.forEach((s) => soundMap.set(s.id, s.title));
	sounds.forEach((s) => soundMap.set(s.id, s.title));

	const fetchLibraryFromDb = async () => {
		try {
			const res = await fetch("/api/library");
			const data = await res.json();
			if (data.success && Array.isArray(data.items)) {
				setSounds(
					data.items.map((r: any) => ({
						id: r.id,
						title: r.title,
						category: r.category,
						description: r.description,
						audioUrl: r.audio_url,
						version: r.version,
						source: r.source,
						color: r.color,
						freq: r.freq,
						type: r.type,
						duration: r.duration,
					}))
				);
				return;
			}
		} catch {}
		setSounds(getSavedLibrary());
	};

	useEffect(() => {
		fetchLibraryFromDb();
		window.addEventListener("echodeck_library_updated", fetchLibraryFromDb);
		return () => window.removeEventListener("echodeck_library_updated", fetchLibraryFromDb);
	}, []);

	// Audio Playback with Queue awareness
	const handlePlay = (sound: StoredSound) => {
		setPlayingId(sound.id);
		playBroadcastSfx(sound.audioUrl, sound.freq, sound.type, 0.35, sound.title, sound.id);
		setTimeout(() => setPlayingId((prev) => (prev === sound.id ? null : prev)), 350);
	};

	const handleLoadStarterPack = async () => {
		const starter = MARKETPLACE_DECKS[0];
		for (const s of starter.sounds) {
			await fetch("/api/library", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sfxId: s.id }),
			}).catch(() => {});
		}
		fetchLibraryFromDb();
		setNotification(`Loaded ${starter.sounds.length} starter sounds into your Library!`);
		setTimeout(() => setNotification(null), 3500);
	};

	const handleDelete = async (id: string, title: string) => {
		try {
			await fetch(`/api/library?id=${encodeURIComponent(id)}`, { method: "DELETE" });
		} catch {}
		setSounds((prev) => prev.filter((s) => s.id !== id));
		setNotification(`Removed "${title}" from Library.`);
		setTimeout(() => setNotification(null), 3000);
	};

	// Open Deck Assignment Modal: load actual pages from DB & localStorage
	const openAssignModal = async (sound: StoredSound) => {
		setSelectedSoundForDeck(sound);
		setAllowOverwrite(false);
		setSlotWarning(null);

		let pagesLoaded: DeckPageData[] | null = null;
		try {
			const res = await fetch("/api/deck");
			const data = await res.json();
			if (data.success && Array.isArray(data.pages) && data.pages.length > 0) {
				pagesLoaded = data.pages;
			}
		} catch {}

		if (!pagesLoaded) {
			const rawLayout = localStorage.getItem("echodeck_layout_v1");
			if (rawLayout) {
				try {
					const parsed = JSON.parse(rawLayout);
					if (Array.isArray(parsed) && parsed.length > 0) {
						pagesLoaded = parsed.map((p, i) => ({
							pageIndex: i,
							title: p.title || `Deck Page ${i + 1}`,
							category: p.category || "Custom Stream Deck",
							soundIds: p.soundIds || Array.from({ length: 10 }, (_, s) => `empty-${i + 1}-${s + 1}`),
						}));
					}
				} catch {}
			}
		}

		if (pagesLoaded && pagesLoaded.length > 0) {
			setDeckPages(pagesLoaded);
			setSelectedDeckPage(0);
		} else {
			setDeckPages([
				{
					pageIndex: 0,
					title: "My First Deck",
					category: "Custom Stream Deck",
					soundIds: Array.from({ length: 10 }, (_, i) => `empty-1-${i + 1}`),
				},
			]);
			setSelectedDeckPage(0);
		}
	};

	// Provision a new Deck Page so non-existent pages are never phantom
	const handleCreateNewPage = () => {
		const newPageIdx = deckPages.length;
		const newPage: DeckPageData = {
			pageIndex: newPageIdx,
			title: `Deck Page ${newPageIdx + 1}`,
			category: "Custom Stream Deck",
			soundIds: Array.from({ length: 10 }, (_, i) => `empty-${newPageIdx + 1}-${i + 1}`),
		};

		const updated = [...deckPages, newPage];
		setDeckPages(updated);
		setSelectedDeckPage(newPageIdx);
		setSlotWarning(null);

		localStorage.setItem("echodeck_layout_v1", JSON.stringify(updated));
		window.dispatchEvent(new Event("echodeck_layout_updated"));
		setNotification(`Created Deck Page ${newPageIdx + 1}! Select a slot below.`);
	};

	// Assign sound to slot with overwrite protection
	const handleAssignToSlot = async (slotIndex: number, targetPage = selectedDeckPage) => {
		if (!selectedSoundForDeck) return;

		const page = deckPages[targetPage];
		if (!page) return;

		const currentOccupantId = page.soundIds[slotIndex];
		const isOccupied = currentOccupantId && !currentOccupantId.startsWith("empty-");

		// If occupied and overwrite is NOT allowed, block the action and warn user
		if (isOccupied && !allowOverwrite) {
			const occupantTitle = soundMap.get(currentOccupantId) || currentOccupantId;
			const displayKey = slotIndex === 9 ? "0" : `${slotIndex + 1}`;
			setSlotWarning(
				`Slot [${displayKey}] is already occupied by "${occupantTitle}". Enable "Allow Overwrite" below to replace it, or select an empty slot.`
			);
			return;
		}

		try {
			// 1. Save in SQLite database
			await fetch("/api/deck", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					pageIndex: targetPage,
					slotIndex,
					soundId: selectedSoundForDeck.id,
				}),
			});

			// 2. Update local state
			const updatedPages = deckPages.map((p, pIdx) => {
				if (pIdx !== targetPage) return p;
				const newSounds = [...p.soundIds];
				newSounds[slotIndex] = selectedSoundForDeck.id;
				return { ...p, soundIds: newSounds };
			});

			setDeckPages(updatedPages);
			localStorage.setItem("echodeck_layout_v1", JSON.stringify(updatedPages));
			window.dispatchEvent(new Event("echodeck_layout_updated"));

			const displayKey = slotIndex === 9 ? "0" : `${slotIndex + 1}`;
			setNotification(
				`Assigned "${selectedSoundForDeck.title}" to Page ${targetPage + 1}, Slot [${displayKey}]!`
			);
			setSelectedSoundForDeck(null);
			setTimeout(() => setNotification(null), 3500);
		} catch {
			setNotification("Error assigning slot. Please try again.");
		}
	};

	// 1-Click Auto-Assign to the first available empty slot
	const handleAutoAssign = async () => {
		if (!selectedSoundForDeck) return;

		for (let p = 0; p < deckPages.length; p++) {
			for (let s = 0; s < 10; s++) {
				const id = deckPages[p].soundIds[s];
				if (!id || id.startsWith("empty-")) {
					setSelectedDeckPage(p);
					await handleAssignToSlot(s, p);
					return;
				}
			}
		}

		// If all current pages are completely full (10/10), create a new page and place in Slot 1
		const newPageIdx = deckPages.length;
		const newPage: DeckPageData = {
			pageIndex: newPageIdx,
			title: `Deck Page ${newPageIdx + 1}`,
			category: "Custom Stream Deck",
			soundIds: Array.from({ length: 10 }, (_, i) => `empty-${newPageIdx + 1}-${i + 1}`),
		};

		const updated = [...deckPages, newPage];
		setDeckPages(updated);
		setSelectedDeckPage(newPageIdx);
		await handleAssignToSlot(0, newPageIdx);
	};

	// Detect if sound is already assigned anywhere on the deck
	const alreadyAssignedLocation = selectedSoundForDeck
		? deckPages
				.flatMap((p, pIdx) =>
					p.soundIds.map((sId, sIdx) => ({
						pageIndex: pIdx,
						slotIndex: sIdx,
						soundId: sId,
					}))
				)
				.find((loc) => loc.soundId === selectedSoundForDeck.id)
		: null;

	const categories = ["All", ...Array.from(new Set(sounds.map((s) => s.category)))];
	const filteredSounds = sounds.filter((sound) => {
		const matchesCategory = activeCategory === "All" || sound.category === activeCategory;
		const matchesSearch =
			sound.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(sound.description && sound.description.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	return (
		<AppShell pathname="/library">
			<div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-2">
				{/* Top Header */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
					<div>
						<div className="flex items-center gap-2.5">
							<div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
								<LibraryIcon className="size-5" />
							</div>
							<h1 className="text-2xl font-bold tracking-tight text-zinc-100">Sound Library</h1>
						</div>
						<p className="text-xs sm:text-sm text-zinc-400 mt-1">
							All installed SFX and personal streamer takes. Assign directly to Steam Deck buzzer slots with overwrite safety.
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Link
							href="/marketplace"
							className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
						>
							<StoreIcon className="size-3.5" />
							Add from Marketplace
						</Link>
						<Link
							href="/deck"
							className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
						>
							<LayoutGridIcon className="size-3.5" />
							Open Deck
						</Link>
					</div>
				</div>

				{/* Notification Banner */}
				{notification && (
					<div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-in fade-in">
						<CheckIcon className="size-4 shrink-0" />
						{notification}
					</div>
				)}

				{/* Filter & Search Bar */}
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
					<div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
						{categories.map((cat) => (
							<button
								key={cat}
								onClick={() => setActiveCategory(cat)}
								type="button"
								className={cn(
									"px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
									activeCategory === cat
										? "bg-purple-600 text-white shadow-sm"
										: "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
								)}
							>
								{cat}
							</button>
						))}
					</div>

					<div className="relative w-full sm:w-64">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
						<input
							type="text"
							placeholder="Search library sounds..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-xl bg-zinc-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 border border-zinc-800 focus:outline-none focus:border-purple-500"
						/>
					</div>
				</div>

				{/* Empty Library State */}
				{sounds.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-3xl bg-[#141416] border border-zinc-800 shadow-2xl">
						<div className="flex size-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
							<LibraryIcon className="size-8" />
						</div>
						<h3 className="text-xl font-bold text-zinc-100">Your Sound Library is Empty</h3>
						<p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md">
							Pick individual SFX or pre-configured Sound Packs from the Marketplace, or record your voice in the Mimic Challenge arena.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-3 mt-6">
							<button
								onClick={handleLoadStarterPack}
								type="button"
								className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
							>
								<FolderPlusIcon className="size-4" />
								Load 8 Starter SFX
							</button>
							<Link
								href="/marketplace"
								className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors"
							>
								<StoreIcon className="size-4" />
								Browse Marketplace
							</Link>
						</div>
					</div>
				) : (
					/* Sound Card Grid */
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{filteredSounds.map((sound) => {
							const isPlaying = playingId === sound.id;
							return (
								<div
									key={sound.id}
									className="group flex flex-col justify-between p-4 rounded-[22px] bg-[#1f1f23] border border-zinc-800/80 hover:border-zinc-700 shadow-md transition-all gap-4"
								>
									<div className="flex items-start gap-3">
										<button
											onClick={() => handlePlay(sound)}
											type="button"
											className={cn(
												"size-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow",
												isPlaying
													? "bg-purple-500 text-white scale-105"
													: "bg-gradient-to-tr from-zinc-800 to-zinc-900 text-zinc-300 hover:text-white group-hover:border-purple-500/50 border border-zinc-700/60"
											)}
										>
											<Volume2Icon className={cn("size-5", isPlaying && "animate-pulse")} />
										</button>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<h4 className="text-sm font-bold text-zinc-200 group-hover:text-white truncate">
													{sound.title}
												</h4>
												{sound.version === "Streamer Take" && (
													<span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold shrink-0">
														TAKE
													</span>
												)}
											</div>
											<div className="flex items-center gap-2 mt-1">
												<span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 font-medium">
													{sound.category}
												</span>
												<span className="text-[10px] font-mono text-zinc-500">
													{sound.duration}
												</span>
											</div>
										</div>
									</div>

									{/* Action Footer */}
									<div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
										<button
											onClick={() => openAssignModal(sound)}
											type="button"
											className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
										>
											<LayoutGridIcon className="size-3.5" />
											Add to Deck
										</button>

										<Link
											href={`/mimic?soundId=${sound.id}&title=${encodeURIComponent(sound.title)}`}
											className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold transition-colors border border-purple-500/30"
										>
											<MicIcon className="size-3.5" />
											Mimic
										</Link>

										<button
											onClick={() => handleDelete(sound.id, sound.title)}
											title="Delete sound"
											type="button"
											className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
										>
											<Trash2Icon className="size-3.5" />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* ========================================================= */}
				{/* MODAL: INTELLIGENT DECK SLOT ASSIGNMENT SYSTEM           */}
				{/* ========================================================= */}
				{selectedSoundForDeck && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
						<div className="relative w-full max-w-xl rounded-3xl bg-[#141416] p-6 sm:p-7 border border-zinc-700 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="flex items-start justify-between pb-4 border-b border-zinc-800">
								<div>
									<div className="flex items-center gap-2">
										<span className="size-2 rounded-full bg-cyan-400" />
										<h3 className="text-lg font-bold text-white">Assign Sound to Deck</h3>
									</div>
									<p className="text-xs text-zinc-400 mt-1">
										Assigning:{" "}
										<span className="font-bold text-white text-sm">
											"{selectedSoundForDeck.title}"
										</span>{" "}
										({selectedSoundForDeck.category} • {selectedSoundForDeck.duration})
									</p>
								</div>
								<button
									onClick={() => setSelectedSoundForDeck(null)}
									className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
								>
									<XIcon className="size-5" />
								</button>
							</div>

							{/* Sound Already in Deck Status Banner */}
							{alreadyAssignedLocation && (
								<div className="flex items-center gap-2.5 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
									<CheckCircle2Icon className="size-4 shrink-0 text-cyan-400" />
									<span>
										Currently active on{" "}
										<strong>Page {alreadyAssignedLocation.pageIndex + 1}</strong>, Slot{" "}
										<strong>
											[{alreadyAssignedLocation.slotIndex === 9 ? 0 : alreadyAssignedLocation.slotIndex + 1}]
										</strong>
										. You can reassign or place it in another slot.
									</span>
								</div>
							)}

							{/* Warning Banner (e.g. attempted to overwrite blocked slot) */}
							{slotWarning && (
								<div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs animate-in shake">
									<AlertTriangleIcon className="size-4 shrink-0 text-amber-400 mt-0.5" />
									<div className="flex-1">
										<p>{slotWarning}</p>
									</div>
									<button
										onClick={() => setSlotWarning(null)}
										className="text-amber-400 hover:text-white text-[11px] font-bold cursor-pointer"
									>
										Dismiss
									</button>
								</div>
							)}

							{/* Page Selector & Create Page Button */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
										<LayersIcon className="size-3.5" />
										1. Select Deck Page
									</label>
									<span className="text-[11px] text-zinc-500">
										{deckPages.length} active page{deckPages.length > 1 ? "s" : ""}
									</span>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									{deckPages.map((page, pIdx) => {
										const isSelected = selectedDeckPage === pIdx;
										const occupiedCount = page.soundIds.filter(
											(id) => id && !id.startsWith("empty-")
										).length;
										return (
											<button
												key={`page-tab-${pIdx}`}
												onClick={() => {
													setSelectedDeckPage(pIdx);
													setSlotWarning(null);
												}}
												type="button"
												className={cn(
													"px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2",
													isSelected
														? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30 scale-102"
														: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700"
												)}
											>
												<span>Page {pIdx + 1}</span>
												<span
													className={cn(
														"px-1.5 py-0.5 rounded-full text-[10px] font-mono",
														isSelected ? "bg-purple-700 text-purple-200" : "bg-zinc-800 text-zinc-400"
													)}
												>
													{occupiedCount}/10
												</span>
											</button>
										);
									})}

									{/* Explicit "+ New Page" Button: Solves non-existent page edge cases */}
									<button
										onClick={handleCreateNewPage}
										type="button"
										className="px-3.5 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-dashed border-zinc-700 hover:border-zinc-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
									>
										<PlusIcon className="size-3.5" />
										Create Page {deckPages.length + 1}
									</button>
								</div>
							</div>

							{/* Slot Visualizer 2x5 Grid */}
							<div>
								<div className="flex items-center justify-between mb-2">
									<label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
										2. Select Slot on Page {selectedDeckPage + 1} (Keys 1-9, 0)
									</label>
									<span className="text-[11px] text-zinc-500">
										Click any available slot
									</span>
								</div>

								<div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
									{Array.from({ length: 10 }).map((_, sIdx) => {
										const currentSlots = deckPages[selectedDeckPage]?.soundIds || [];
										const currentSoundId = currentSlots[sIdx];
										const isEmpty = !currentSoundId || currentSoundId.startsWith("empty-");
										const occupantTitle = soundMap.get(currentSoundId) || currentSoundId;
										const displayKey = sIdx === 9 ? "0" : `${sIdx + 1}`;

										return (
											<button
												key={`slot-card-${sIdx}`}
												onClick={() => handleAssignToSlot(sIdx)}
												type="button"
												className={cn(
													"p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 min-h-[82px] cursor-pointer relative group",
													isEmpty
														? "bg-zinc-900/80 border-dashed border-zinc-700 hover:border-cyan-400 hover:bg-cyan-950/20 shadow-sm"
														: allowOverwrite
														? "bg-amber-950/20 border-amber-600/50 hover:border-amber-400"
														: "bg-zinc-900 border-zinc-800/80 opacity-75 hover:opacity-100"
												)}
											>
												{/* Header: Key & Status Badge */}
												<div className="flex items-center justify-between w-full">
													<span className="size-6 rounded-lg bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-white">
														{displayKey}
													</span>
													{isEmpty ? (
														<span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
															FREE
														</span>
													) : (
														<span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
															{!allowOverwrite && <LockIcon className="size-2.5" />}
															OCCUPIED
														</span>
													)}
												</div>

												{/* Occupant Sound Label */}
												<div>
													<p
														className={cn(
															"text-xs font-semibold truncate",
															isEmpty
																? "text-zinc-500 group-hover:text-cyan-300"
																: "text-zinc-200"
														)}
													>
														{isEmpty ? "+ Assign Here" : occupantTitle}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							</div>

							{/* Overwrite Protection & Quick Actions */}
							<div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
								{/* Safety Toggle: Allow Overwrite */}
								<label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
									<input
										type="checkbox"
										checked={allowOverwrite}
										onChange={(e) => {
											setAllowOverwrite(e.target.checked);
											setSlotWarning(null);
										}}
										className="size-4 rounded accent-purple-600 cursor-pointer"
									/>
									<span>Allow Overwrite / Replace occupied slots</span>
								</label>

								{/* Auto-Assign to next available slot */}
								<button
									onClick={handleAutoAssign}
									type="button"
									className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
								>
									<ZapIcon className="size-3.5" />
									Auto-Assign Next Free Slot
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</AppShell>
	);
}
