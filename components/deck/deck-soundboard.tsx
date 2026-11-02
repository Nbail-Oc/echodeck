"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { playBroadcastSfx, soundQueue, AudioQueueItem } from "@/lib/mock-audio";
import { LiquidGlass } from "@/components/ui/glasscn/liquid-glass";
import { useSidebar } from "@/components/ui/sidebar";
import { getSavedLibrary, MARKETPLACE_CATALOG, StoredSound } from "@/lib/deck-store";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	SparklesIcon,
	Volume2Icon,
	SlidersHorizontalIcon,
	FlameIcon,
	ZapIcon,
	SmileIcon,
	SkullIcon,
	MusicIcon,
	MicIcon,
	BellIcon,
	RadioIcon,
	BombIcon,
	HeartIcon,
	GhostIcon,
	PlayIcon,
	ActivityIcon,
	AlertTriangleIcon,
	PencilIcon,
	CheckIcon,
	RotateCcwIcon,
	GripVerticalIcon,
	MaximizeIcon,
	MinimizeIcon,
	PlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SoundItem = {
	id: string;
	key: string;
	title: string;
	version: "Original" | "Streamer Take";
	color: string;
	freq: number;
	type: OscillatorType;
	icon: React.ReactNode;
	audioUrl?: string;
	isEmpty?: boolean;
};

type DeckPage = {
	title: string;
	category: string;
	sounds: SoundItem[];
};

const SLOT_HOTKEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

// Initial clean state: single page with 10 open slots
const DEFAULT_EMPTY_PAGE: DeckPage = {
	title: "My First Deck",
	category: "10-Slot Soundboard",
	sounds: Array.from({ length: 10 }, (_, i) => ({
		id: `empty-1-${i + 1}`,
		key: SLOT_HOTKEYS[i],
		title: "Empty Slot",
		version: "Original",
		color: "from-zinc-800 to-zinc-900",
		freq: 0,
		type: "sine",
		isEmpty: true,
		icon: null,
	})),
};

const DEFAULT_DECK_PAGES: DeckPage[] = [DEFAULT_EMPTY_PAGE];

export function DeckSoundboard() {
	const { setOpen } = useSidebar();
	const containerRef = useRef<HTMLDivElement>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [viewMode, setViewMode] = useState<"minimal" | "glass">("minimal");
	const [isEditMode, setIsEditMode] = useState(false);
	const [pages, setPages] = useState<DeckPage[]>(DEFAULT_DECK_PAGES);
	const [pageIndex, setPageIndex] = useState(0);
	const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
	const [lastPlayedName, setLastPlayedName] = useState<string>("Bruh Sound #2");

	// Drag & Drop State
	const [dragSource, setDragSource] = useState<{ pageIndex: number; soundIndex: number } | null>(null);
	const [dropTarget, setDropTarget] = useState<{ pageIndex: number; soundIndex: number } | null>(null);

	// Audio Playback Queue State
	const [queueState, setQueueState] = useState<{ current: AudioQueueItem | null; queue: AudioQueueItem[]; count: number }>({
		current: null,
		queue: [],
		count: 0,
	});

	useEffect(() => {
		const handleQueueUpdate = (e: Event) => {
			const custom = e as CustomEvent<{ current: AudioQueueItem | null; queue: AudioQueueItem[]; count: number }>;
			if (custom.detail) {
				setQueueState(custom.detail);
			}
		};
		window.addEventListener("echodeck_queue_updated", handleQueueUpdate);
		return () => window.removeEventListener("echodeck_queue_updated", handleQueueUpdate);
	}, []);

	// Fullscreen toggle logic with sidebar auto-minimization
	const toggleFullscreen = useCallback(async () => {
		try {
			if (!document.fullscreenElement) {
				// Minimize sidebar automatically
				setOpen(false);

				const elem = containerRef.current || document.documentElement;
				if (elem.requestFullscreen) {
					await elem.requestFullscreen();
				} else if ((elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
					await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
				}
				setIsFullscreen(true);
			} else {
				if (document.exitFullscreen) {
					await document.exitFullscreen();
				} else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
					await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
				}
				setIsFullscreen(false);
			}
		} catch (err) {
			console.error("Fullscreen toggle failed, falling back to overlay:", err);
			// Fallback overlay mode
			setIsFullscreen((prev) => !prev);
			setOpen(false);
		}
	}, [setOpen]);

	// Sync fullscreen state with browser events (e.g. user presses Esc)
	useEffect(() => {
		const handleFsChange = () => {
			const isFs = !!document.fullscreenElement;
			setIsFullscreen(isFs);
			if (isFs) {
				setOpen(false);
			}
		};

		document.addEventListener("fullscreenchange", handleFsChange);
		document.addEventListener("webkitfullscreenchange", handleFsChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFsChange);
			document.removeEventListener("webkitfullscreenchange", handleFsChange);
		};
	}, [setOpen]);

	// Load view mode and saved sound layout from database & local backup
	const loadLayout = useCallback(async () => {
		const savedView = localStorage.getItem("echodeck_view_mode") as "minimal" | "glass" | null;
		if (savedView) setViewMode(savedView);

		let pagesToRestore: Array<{ title: string; category: string; soundIds: string[] }> | null = null;

		// 1. Fetch from SQLite Database
		try {
			const res = await fetch("/api/deck");
			const data = await res.json();
			if (data.success && Array.isArray(data.pages) && data.pages.length > 0) {
				pagesToRestore = data.pages;
			}
		} catch {
			// Fallback to local storage if offline
		}

		if (!pagesToRestore) {
			const savedLayout = localStorage.getItem("echodeck_layout_v1");
			if (savedLayout) {
				try {
					pagesToRestore = JSON.parse(savedLayout);
				} catch {}
			}
		}

		if (pagesToRestore && pagesToRestore.length > 0) {
			try {
				const idMap = new Map<string, StoredSound>();
				MARKETPLACE_CATALOG.forEach((s) => idMap.set(s.id, s));

				// 1. Fetch library from SQLite database so all user takes and added SFX resolve
				try {
					const libRes = await fetch("/api/library");
					const libData = await libRes.json();
					if (libData.success && Array.isArray(libData.items)) {
						libData.items.forEach((r: any) => {
							const soundObj: StoredSound = {
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
							};
							idMap.set(r.id, soundObj);
							if (r.sfx_id) idMap.set(r.sfx_id, soundObj);
						});
					}
				} catch {}

				// 2. Also merge local storage backup
				const lib = getSavedLibrary();
				lib.forEach((s) => {
					if (!idMap.has(s.id)) idMap.set(s.id, s);
				});

				const restored: DeckPage[] = pagesToRestore.map((p, pIdx) => ({
					title: p.title || (pIdx === 0 ? "My First Deck" : `Deck Page ${pIdx + 1}`),
					category: p.category || "Custom Stream Deck",
					sounds: p.soundIds.map((id, sIdx) => {
						const found = idMap.get(id);
						if (found && !id.startsWith("empty-")) {
							return {
								id: found.id,
								key: SLOT_HOTKEYS[sIdx],
								title: found.title,
								version: found.version,
								color: found.color,
								freq: found.freq,
								type: found.type,
								audioUrl: found.audioUrl,
								isEmpty: false,
								icon:
									found.version === "Streamer Take" ? (
										<MicIcon className="size-6 text-purple-400" />
									) : (
										<Volume2Icon className="size-6 text-zinc-300" />
									),
							};
						}
						return {
							id: `empty-${pIdx + 1}-${sIdx + 1}`,
							key: SLOT_HOTKEYS[sIdx],
							title: "Empty Slot",
							version: "Original" as const,
							color: "from-zinc-800 to-zinc-900",
							freq: 0,
							type: "sine" as OscillatorType,
							isEmpty: true,
							icon: null,
						};
					}),
				}));

				if (restored.length > 0 && restored[0].sounds.length === 10) {
					setPages(restored);
					return;
				}
			} catch {
				// Fallback to default
			}
		}
		setPages(DEFAULT_DECK_PAGES);
	}, []);

	useEffect(() => {
		loadLayout();
		window.addEventListener("echodeck_layout_updated", loadLayout);
		window.addEventListener("echodeck_library_updated", loadLayout);
		return () => {
			window.removeEventListener("echodeck_layout_updated", loadLayout);
			window.removeEventListener("echodeck_library_updated", loadLayout);
		};
	}, [loadLayout]);

	const switchViewMode = (mode: "minimal" | "glass") => {
		setViewMode(mode);
		localStorage.setItem("echodeck_view_mode", mode);
	};

	const saveLayout = async (updatedPages: DeckPage[]) => {
		setPages(updatedPages);
		const serializable = updatedPages.map((p) => ({
			title: p.title,
			category: p.category,
			soundIds: p.sounds.map((s) => s.id),
		}));
		localStorage.setItem("echodeck_layout_v1", JSON.stringify(serializable));

		// Persist slots to SQLite database
		for (let p = 0; p < updatedPages.length; p++) {
			for (let s = 0; s < updatedPages[p].sounds.length; s++) {
				fetch("/api/deck", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						pageIndex: p,
						slotIndex: s,
						soundId: updatedPages[p].sounds[s].id,
					}),
				}).catch(() => {});
			}
		}
	};

	const resetLayout = () => {
		setPages(DEFAULT_DECK_PAGES);
		localStorage.removeItem("echodeck_layout_v1");
	};

	const addNewPage = () => {
		const newPageNum = pages.length + 1;
		const newPage: DeckPage = {
			title: `Deck Page ${newPageNum}`,
			category: "Custom Stream Deck",
			sounds: Array.from({ length: 10 }, (_, i) => ({
				id: `empty-${newPageNum}-${i + 1}`,
				key: SLOT_HOTKEYS[i],
				title: "Empty Slot",
				version: "Original",
				color: "from-zinc-800 to-zinc-900",
				freq: 0,
				type: "sine",
				isEmpty: true,
				icon: null,
			})),
		};
		const updated = [...pages, newPage];
		saveLayout(updated);
		setPageIndex(updated.length - 1);
	};

	const currentPage = pages[pageIndex] || pages[0];

	const triggerSound = useCallback((sound: SoundItem) => {
		if (isEditMode || sound.isEmpty) return;
		setActiveSoundId(sound.id);
		setLastPlayedName(sound.title);
		playBroadcastSfx(sound.audioUrl, sound.freq, sound.type, 0.4, sound.title, sound.id);

		setTimeout(() => {
			setActiveSoundId((prev) => (prev === sound.id ? null : prev));
		}, 300);
	}, [isEditMode]);

	const nextPage = useCallback(() => {
		setPageIndex((prev) => (prev + 1) % pages.length);
	}, [pages.length]);

	const prevPage = useCallback(() => {
		setPageIndex((prev) => (prev - 1 + pages.length) % pages.length);
	}, [pages.length]);

	// =========================================================
	// Magnetic Swap Handler (Same-page and Cross-page)
	// =========================================================
	const performMagneticSwap = async (
		source: { pageIndex: number; soundIndex: number },
		target: { pageIndex: number; soundIndex: number }
	) => {
		if (source.pageIndex === target.pageIndex && source.soundIndex === target.soundIndex) {
			return;
		}

		const newPages = pages.map((p) => ({ ...p, sounds: [...p.sounds] }));
		const sourceItem = newPages[source.pageIndex].sounds[source.soundIndex];
		const targetItem = newPages[target.pageIndex].sounds[target.soundIndex];

		// Preserve the physical slot hotkeys
		const keyAtSource = SLOT_HOTKEYS[source.soundIndex];
		const keyAtTarget = SLOT_HOTKEYS[target.soundIndex];

		newPages[source.pageIndex].sounds[source.soundIndex] = { ...targetItem, key: keyAtSource };
		newPages[target.pageIndex].sounds[target.soundIndex] = { ...sourceItem, key: keyAtTarget };

		saveLayout(newPages);

		// Sync with DB
		fetch("/api/deck", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				source: { pageIndex: source.pageIndex, slotIndex: source.soundIndex },
				target: { pageIndex: target.pageIndex, slotIndex: target.soundIndex },
			}),
		}).catch(() => {});
	};

	// Hotkey listener: 1-9, 0 for sounds; strictly A and D for page shift
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (
				target?.isContentEditable ||
				target?.tagName === "INPUT" ||
				target?.tagName === "TEXTAREA" ||
				target?.tagName === "SELECT"
			) {
				return;
			}

			if (e.metaKey || e.ctrlKey || e.altKey) return;

			// Page shift: strictly A and D
			if (e.code === "KeyD" || e.key.toLowerCase() === "d") {
				e.preventDefault();
				e.stopPropagation();
				nextPage();
				return;
			}
			if (e.code === "KeyA" || e.key.toLowerCase() === "a") {
				e.preventDefault();
				e.stopPropagation();
				prevPage();
				return;
			}

			// Numbers 0 to 9: match top-row Digits, Numpad keys, and string keys
			let soundIndex: number | null = null;
			if (e.code === "Digit1" || e.code === "Numpad1" || e.key === "1") soundIndex = 0;
			else if (e.code === "Digit2" || e.code === "Numpad2" || e.key === "2") soundIndex = 1;
			else if (e.code === "Digit3" || e.code === "Numpad3" || e.key === "3") soundIndex = 2;
			else if (e.code === "Digit4" || e.code === "Numpad4" || e.key === "4") soundIndex = 3;
			else if (e.code === "Digit5" || e.code === "Numpad5" || e.key === "5") soundIndex = 4;
			else if (e.code === "Digit6" || e.code === "Numpad6" || e.key === "6") soundIndex = 5;
			else if (e.code === "Digit7" || e.code === "Numpad7" || e.key === "7") soundIndex = 6;
			else if (e.code === "Digit8" || e.code === "Numpad8" || e.key === "8") soundIndex = 7;
			else if (e.code === "Digit9" || e.code === "Numpad9" || e.key === "9") soundIndex = 8;
			else if (e.code === "Digit0" || e.code === "Numpad0" || e.key === "0") soundIndex = 9;

			if (soundIndex !== null && currentPage.sounds[soundIndex]) {
				e.preventDefault();
				e.stopPropagation();
				triggerSound(currentPage.sounds[soundIndex]);
				return;
			}

			// Fullscreen toggle hotkey: F
			if (e.code === "KeyF" || e.key.toLowerCase() === "f") {
				e.preventDefault();
				e.stopPropagation();
				toggleFullscreen();
				return;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentPage, nextPage, prevPage, triggerSound, toggleFullscreen]);

	return (
		<div
			ref={containerRef}
			className={cn(
				"flex flex-col gap-4 w-full transition-all duration-300",
				isFullscreen
					? "fixed inset-0 z-50 h-screen w-screen max-w-none overflow-y-auto bg-[#0d0e11] p-4 sm:p-8 justify-center items-center"
					: "max-w-6xl mx-auto"
			)}
		>
			{/* Top Bar: View Mode Switcher, Edit Mode Toggle, and Carousel Controls */}
			<div className="flex flex-wrap items-center justify-between gap-3 px-1 w-full max-w-6xl">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Style:</span>
						<div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
							<button
								onClick={() => switchViewMode("minimal")}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
									viewMode === "minimal"
										? "bg-zinc-800 text-white shadow-sm"
										: "text-zinc-400 hover:text-white"
								)}
							>
								<SlidersHorizontalIcon className="size-3.5" />
								Minimal
							</button>
							<button
								onClick={() => switchViewMode("glass")}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
									viewMode === "glass"
										? "bg-purple-600 text-white shadow-sm"
										: "text-zinc-400 hover:text-white"
								)}
							>
								<SparklesIcon className="size-3.5" />
								Liquid Glass
							</button>
						</div>
					</div>

					{/* Edit Deck Mode Toggle */}
					<button
						onClick={() => setIsEditMode(!isEditMode)}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
							isEditMode
								? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20"
								: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
						)}
					>
						{isEditMode ? (
							<>
								<CheckIcon className="size-3.5" />
								Done Editing
							</>
						) : (
							<>
								<PencilIcon className="size-3.5" />
								Edit Layout
							</>
						)}
					</button>

					{/* Fullscreen Mode Toggle */}
					<button
						onClick={toggleFullscreen}
						title={isFullscreen ? "Exit Fullscreen (F or Esc)" : "Enter Fullscreen (F)"}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
							isFullscreen
								? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30 hover:bg-purple-500"
								: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
						)}
					>
						{isFullscreen ? (
							<>
								<MinimizeIcon className="size-3.5" />
								<span>Exit Fullscreen</span>
								<kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded bg-purple-700 text-[10px] font-mono">Esc</kbd>
							</>
						) : (
							<>
								<MaximizeIcon className="size-3.5" />
								<span>Fullscreen</span>
								<kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">F</kbd>
							</>
						)}
					</button>

					{isEditMode && (
						<button
							onClick={resetLayout}
							title="Restore default order"
							className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
						>
							<RotateCcwIcon className="size-3" />
							Reset
						</button>
					)}
				</div>

				{/* Carousel Navigation Header */}
				<div className="flex items-center gap-3">
					<div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-zinc-500">
						<kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">A</kbd>
						<span>prev</span>
						<span className="mx-1">•</span>
						<kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">D</kbd>
						<span>next</span>
					</div>

					<div className="flex items-center gap-1 rounded-xl bg-zinc-900 p-1 border border-zinc-800">
						<button
							onClick={prevPage}
							className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
							aria-label="Previous Page"
						>
							<ChevronLeftIcon className="size-4" />
						</button>

						{/* Interactive Page Dots / Drag-Over Target to Switch Pages */}
						<div className="flex items-center gap-1 px-2">
							{pages.map((_, idx) => (
								<button
									key={`dot-${idx}`}
									onClick={() => setPageIndex(idx)}
									onDragOver={(e) => {
										if (dragSource) {
											e.preventDefault();
											setPageIndex(idx);
										}
									}}
									className={cn(
										"h-2 rounded-full transition-all cursor-pointer",
										idx === pageIndex ? "w-6 bg-white" : "w-2 bg-zinc-600 hover:bg-zinc-400",
										dragSource && idx !== pageIndex && "animate-pulse border border-amber-400"
									)}
									aria-label={`Jump to page ${idx + 1}`}
								/>
							))}
						</div>

						<button
							onClick={nextPage}
							className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
							aria-label="Next Page"
						>
							<ChevronRightIcon className="size-4" />
						</button>

						{/* Add Page Button */}
						<button
							onClick={addNewPage}
							title="Add new deck page"
							className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-zinc-800 transition-colors cursor-pointer border-l border-zinc-800 ml-1 pl-1"
							aria-label="Add new deck page"
						>
							<PlusIcon className="size-3.5" />
						</button>
					</div>
				</div>
			</div>

			{/* Cross-Page Quick Tabs in Edit Mode */}
			{isEditMode && (
				<div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs w-full max-w-6xl">
					<span className="font-semibold text-amber-400 flex items-center gap-1 ml-1">
						<GripVerticalIcon className="size-3.5" />
						Magnetic Drop Active:
					</span>
					<span className="text-zinc-400 hidden sm:inline">Drag item over another to swap. Drag onto a page tab below to swap across pages:</span>
					<div className="flex items-center gap-1.5 ml-auto">
						{pages.map((p, idx) => (
							<button
								key={`tab-${idx}`}
								onClick={() => setPageIndex(idx)}
								onDragOver={(e) => {
									e.preventDefault();
									setPageIndex(idx);
								}}
								className={cn(
									"px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border",
									idx === pageIndex
										? "bg-amber-500 text-black border-amber-400 font-bold"
										: "bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-amber-400/50"
								)}
							>
								P{idx + 1}: {p.title.split(" ")[0]}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Audio Playback Queue Indicator */}
			{queueState.current && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#18181b]/95 border border-purple-500/40 shadow-xl backdrop-blur-md text-xs animate-in slide-in-from-top-2">
					<div className="flex items-center gap-2.5">
						<span className="relative flex size-2.5">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
							<span className="relative inline-flex rounded-full size-2.5 bg-purple-500" />
						</span>
						<span className="text-zinc-400">Playing:</span>
						<span className="font-bold text-white truncate max-w-[200px]">
							{queueState.current.title}
						</span>
					</div>

					{queueState.queue.length > 0 && (
						<div className="flex items-center gap-2 text-zinc-400">
							<span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
								Cued Up:
							</span>
							<span className="font-medium text-zinc-200 truncate max-w-[160px]">
								{queueState.queue[0].title}
							</span>
							{queueState.queue.length > 1 && (
								<span className="text-[10px] text-zinc-500">
									(+{queueState.queue.length - 1} more)
								</span>
							)}
						</div>
					)}

					<div className="flex items-center gap-2 shrink-0">
						<button
							onClick={() => soundQueue.skipCurrent()}
							type="button"
							className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[11px] cursor-pointer"
						>
							Skip
						</button>
						<button
							onClick={() => soundQueue.clearQueue()}
							type="button"
							className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 font-semibold text-[11px] cursor-pointer"
						>
							Clear Queue
						</button>
					</div>
				</div>
			)}

			{/* ========================================================= */}
			{/* VIEW 1: MINIMAL VIEW (Matching uploaded reference image)  */}
			{/* ========================================================= */}
			{viewMode === "minimal" && (
				<div className={cn(
					"relative w-full rounded-[32px] bg-[#141416] p-6 sm:p-10 border border-[#27272a] shadow-2xl",
					isFullscreen && "max-w-6xl my-auto"
				)}>
					{/* Header bar inside minimal deck */}
					<div className="mb-6 flex items-center justify-between border-b border-zinc-800/80 pb-4">
						<div>
							<div className="flex items-center gap-2">
								<h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
									{currentPage.title}
								</h2>
								<span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
									Page {pageIndex + 1}/{pages.length}
								</span>
							</div>
							<p className="text-xs text-zinc-500 mt-0.5">
								{currentPage.category} • Last Fired: <span className="text-zinc-300 font-medium">{lastPlayedName}</span>
							</p>
						</div>
						<div className="text-right">
							<span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-400">
								{isEditMode ? "DRAGGING & SWAP MODE" : "Hotkeys [1-0] Active"}
							</span>
						</div>
					</div>

					{/* Minimal Squircle Grid - 2 rows x 5 columns */}
					{currentPage.sounds.every((s) => s.isEmpty) && (
						<div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
									<SparklesIcon className="size-4" />
								</div>
								<div>
									<h4 className="text-sm font-bold text-zinc-100">Deck is Empty</h4>
									<p className="text-xs text-zinc-400">Assign sounds from your Library or import an entire 10-SFX pack from Marketplace.</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Link
									href="/marketplace"
									className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
								>
									Browse Marketplace
								</Link>
								<Link
									href="/library"
									className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition-all"
								>
									Open Library
								</Link>
							</div>
						</div>
					)}

					<div className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-5">
						{currentPage.sounds.map((sound, soundIndex) => {
							const isPlaying = activeSoundId === sound.id || queueState.current?.id === sound.id;
							const isCued = queueState.queue.findIndex((q) => q.id === sound.id);
							const isDragged = dragSource?.pageIndex === pageIndex && dragSource?.soundIndex === soundIndex;
							const isTarget = dropTarget?.pageIndex === pageIndex && dropTarget?.soundIndex === soundIndex;

							if (sound.isEmpty && !isEditMode) {
								return (
									<Link
										key={sound.id}
										href="/library"
										className={cn(
											"group relative flex flex-col items-center justify-center gap-2.5 rounded-[24px] p-4 text-center cursor-pointer select-none transition-all duration-200 aspect-square",
											"bg-[#161619] hover:bg-[#1c1c22] border-2 border-dashed border-zinc-800 hover:border-purple-500/60 shadow-sm"
										)}
									>
										<span className="absolute top-3 left-3 flex size-5 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300">
											{sound.key}
										</span>
										<div className="flex size-11 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 group-hover:bg-purple-500/20 group-hover:text-purple-400 group-hover:border-purple-500/40 transition-all">
											<PlusIcon className="size-5" />
										</div>
										<div className="flex flex-col items-center pointer-events-none">
											<span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
												Empty Slot
											</span>
											<span className="text-[10px] text-zinc-600 group-hover:text-purple-300">
												+ Assign SFX
											</span>
										</div>
									</Link>
								);
							}

							return (
								<div
									key={sound.id}
									draggable={isEditMode}
									onDragStart={(e) => {
										if (!isEditMode) return;
										setDragSource({ pageIndex, soundIndex });
										e.dataTransfer.setData("text/plain", `${pageIndex}:${soundIndex}`);
										e.dataTransfer.effectAllowed = "move";
									}}
									onDragOver={(e) => {
										if (!isEditMode) return;
										e.preventDefault();
										e.dataTransfer.dropEffect = "move";
										if (dropTarget?.pageIndex !== pageIndex || dropTarget?.soundIndex !== soundIndex) {
											setDropTarget({ pageIndex, soundIndex });
										}
									}}
									onDragLeave={() => {
										if (dropTarget?.pageIndex === pageIndex && dropTarget?.soundIndex === soundIndex) {
											setDropTarget(null);
										}
									}}
									onDrop={(e) => {
										if (!isEditMode) return;
										e.preventDefault();
										if (dragSource) {
											performMagneticSwap(dragSource, { pageIndex, soundIndex });
										}
										setDragSource(null);
										setDropTarget(null);
									}}
									onDragEnd={() => {
										setDragSource(null);
										setDropTarget(null);
									}}
									onClick={() => triggerSound(sound)}
									className={cn(
										"group relative flex flex-col items-center justify-center gap-3 rounded-[24px] p-5 text-center cursor-pointer select-none transition-all duration-200 aspect-square",
										"bg-[#1f1f23] hover:bg-[#28282e] border border-transparent hover:border-zinc-700/60 shadow-md",
										isPlaying && "scale-95 bg-[#2f2f36] border-zinc-500 shadow-inner ring-2 ring-white/20",
										isEditMode && "cursor-grab active:cursor-grabbing hover:border-amber-400/50 hover:scale-[1.02]",
										isDragged && "opacity-40 scale-90 border-dashed border-2 border-amber-400 bg-amber-500/10",
										isTarget && !isDragged && "ring-2 ring-amber-400 bg-amber-500/20 border-amber-400 scale-105 shadow-xl shadow-amber-500/20"
									)}
								>
									{/* Hotkey Tag */}
									<span className="absolute top-3 left-3 flex size-5 items-center justify-center rounded-md bg-zinc-900/80 text-[10px] font-mono font-bold text-zinc-400 group-hover:text-zinc-200">
										{sound.key}
									</span>

									{/* Drag Handle Icon in Edit Mode */}
									{isEditMode ? (
										<span className="absolute top-3 right-3 p-1 rounded-md bg-amber-500/20 text-amber-400">
											<GripVerticalIcon className="size-3.5" />
										</span>
									) : isCued !== -1 ? (
										<span className="absolute top-3 right-3 px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-bold shadow animate-pulse">
											QUEUED #{isCued + 1}
										</span>
									) : (
										sound.version === "Streamer Take" && (
											<span className="absolute top-3 right-3 flex items-center gap-0.5 rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-medium text-purple-300">
												Take
											</span>
										)
									)}

									{/* Icon Centered */}
									<div className={cn(
										"transition-transform duration-150 flex items-center justify-center pointer-events-none",
										isPlaying ? "scale-110 text-white" : "group-hover:scale-105"
									)}>
										{sound.icon}
									</div>

									{/* Sound Name */}
									<span className="truncate w-full text-xs font-medium text-zinc-300 group-hover:text-white transition-colors pointer-events-none">
										{sound.title}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* ========================================================= */}
			{/* VIEW 2: LIQUID GLASS VIEW (Vibrant glass refraction)      */}
			{/* ========================================================= */}
			{viewMode === "glass" && (
				<div className={cn(
					"relative w-full overflow-hidden rounded-[32px] bg-[url('/bg-deck.png')] bg-cover bg-center p-4 sm:p-8 shadow-2xl border border-white/20",
					isFullscreen && "max-w-6xl my-auto"
				)}>
					{/* Gentle ambient lighting layer */}
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-black/25 to-indigo-900/30 backdrop-brightness-105" />

					{/* Main Liquid Glass Lens Container */}
					<LiquidGlass
						refraction={30}
						blur={2}
						saturation={1.8}
						className="relative z-10 w-full rounded-[28px] p-5 sm:p-7 border border-white/35 bg-white/[0.12] dark:bg-black/25 backdrop-blur-2xl shadow-[inset_0_2px_1px_rgba(255,255,255,0.7),inset_0_-10px_25px_rgba(255,255,255,0.2),0_25px_60px_rgba(0,0,0,0.5)]"
					>
						{/* Header bar inside liquid glass deck */}
						<div className="mb-6 flex items-center justify-between border-b border-white/20 pb-4">
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-xl bg-white/25 text-white shadow-inner backdrop-blur-md">
									<Volume2Icon className="size-5" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h2 className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-md">
											{currentPage.title}
										</h2>
										<span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md border border-white/30">
											Page {pageIndex + 1}/{pages.length}
										</span>
									</div>
									<p className="text-xs text-white/80 font-medium">
										{currentPage.category} • Last Fired: <span className="text-white font-bold">{lastPlayedName}</span>
									</p>
								</div>
							</div>
							<div className="text-right">
								<span className="inline-block px-3 py-1 rounded-xl bg-white/20 border border-white/30 font-mono text-xs text-white backdrop-blur-md shadow-sm">
									{isEditMode ? "DRAGGING & SWAP MODE" : "Liquid Glass Active"}
								</span>
							</div>
						</div>

						{/* 10 Ultra-Refractive Liquid Glass Tactile Buttons */}
						{currentPage.sounds.every((s) => s.isEmpty) && (
							<div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md">
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
										<SparklesIcon className="size-4" />
									</div>
									<div>
										<h4 className="text-sm font-bold text-white drop-shadow">Fresh Glass Deck</h4>
										<p className="text-xs text-white/80">All 10 slots are open. Populate from your Library or import from Marketplace.</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Link
										href="/marketplace"
										className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold transition-all shadow-md hover:bg-white/90"
									>
										Browse Marketplace
									</Link>
									<Link
										href="/library"
										className="px-3.5 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-medium border border-white/25 transition-all"
									>
										Open Library
									</Link>
								</div>
							</div>
						)}

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
							{currentPage.sounds.map((sound, soundIndex) => {
								const isPlaying = activeSoundId === sound.id || queueState.current?.id === sound.id;
								const isCued = queueState.queue.findIndex((q) => q.id === sound.id);
								const isDragged = dragSource?.pageIndex === pageIndex && dragSource?.soundIndex === soundIndex;
								const isTarget = dropTarget?.pageIndex === pageIndex && dropTarget?.soundIndex === soundIndex;

								if (sound.isEmpty && !isEditMode) {
									return (
										<Link
											key={sound.id}
											href="/library"
											className={cn(
												"group relative flex flex-col items-center justify-between rounded-2xl p-3.5 text-center cursor-pointer select-none transition-all duration-200 aspect-square overflow-hidden",
												"bg-white/[0.06] hover:bg-white/[0.14] border-2 border-dashed border-white/25 hover:border-white/60 backdrop-blur-md"
											)}
										>
											<div className="relative z-10 self-start flex size-5 items-center justify-center rounded-md bg-black/45 text-[10px] font-mono font-bold text-white/60 border border-white/20 group-hover:text-white">
												{sound.key}
											</div>
											<div className="relative z-10 my-2 flex size-12 items-center justify-center rounded-full bg-white/10 border border-white/25 text-white/70 group-hover:text-white group-hover:bg-white/20 group-hover:scale-105 transition-all">
												<PlusIcon className="size-5" />
											</div>
											<div className="relative z-10 w-full pointer-events-none">
												<p className="truncate text-xs font-semibold text-white/80 group-hover:text-white">
													Empty Slot
												</p>
												<span className="text-[10px] text-white/60 font-mono">[+] Assign SFX</span>
											</div>
										</Link>
									);
								}

								return (
									<div
										key={sound.id}
										draggable={isEditMode}
										onDragStart={(e) => {
											if (!isEditMode) return;
											setDragSource({ pageIndex, soundIndex });
											e.dataTransfer.setData("text/plain", `${pageIndex}:${soundIndex}`);
											e.dataTransfer.effectAllowed = "move";
										}}
										onDragOver={(e) => {
											if (!isEditMode) return;
											e.preventDefault();
											e.dataTransfer.dropEffect = "move";
											if (dropTarget?.pageIndex !== pageIndex || dropTarget?.soundIndex !== soundIndex) {
												setDropTarget({ pageIndex, soundIndex });
											}
										}}
										onDragLeave={() => {
											if (dropTarget?.pageIndex === pageIndex && dropTarget?.soundIndex === soundIndex) {
												setDropTarget(null);
											}
										}}
										onDrop={(e) => {
											if (!isEditMode) return;
											e.preventDefault();
											if (dragSource) {
												performMagneticSwap(dragSource, { pageIndex, soundIndex });
											}
											setDragSource(null);
											setDropTarget(null);
										}}
										onDragEnd={() => {
											setDragSource(null);
											setDropTarget(null);
										}}
										onClick={() => triggerSound(sound)}
										className={cn(
											"group relative flex flex-col items-center justify-between rounded-2xl p-4 text-center cursor-pointer select-none transition-all duration-200 overflow-hidden",
											"backdrop-blur-2xl backdrop-saturate-[2.4] backdrop-brightness-110",
											"bg-[linear-gradient(135deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.08)_35%,rgba(255,255,255,0.02)_65%,rgba(255,255,255,0.18)_100%)]",
											"border border-white/40 hover:border-white/70",
											"shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.85),inset_0_-1px_0_0_rgba(255,255,255,0.35),inset_1px_0_0_0_rgba(255,255,255,0.4),inset_-1px_0_0_0_rgba(255,255,255,0.3),0_12px_32px_-4px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.3)]",
											"hover:shadow-[inset_0_2px_1px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(255,255,255,0.5),0_16px_40px_-6px_rgba(0,0,0,0.6),0_0_25px_rgba(255,255,255,0.25)] hover:-translate-y-1",
											isPlaying
												? "scale-95 bg-[linear-gradient(135deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.20)_100%)] border-white ring-2 ring-white/90 shadow-[0_0_35px_rgba(255,255,255,0.7)]"
												: "hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0.14)_100%)]",
											isEditMode && "cursor-grab active:cursor-grabbing hover:border-amber-300",
											isDragged && "opacity-35 scale-90 border-dashed border-2 border-amber-300",
											isTarget && !isDragged && "ring-4 ring-amber-300 bg-amber-400/30 scale-105 shadow-[0_0_35px_rgba(251,191,36,0.5)]"
										)}
									>
										{/* Glass Sheen Streak overlay */}
										<div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-white/30 opacity-75 group-hover:opacity-100 transition-opacity" />

										{/* Frosted Micro-Glass Hotkey Tag */}
										<div className="relative z-10 self-start flex size-5 items-center justify-center rounded-md bg-black/45 backdrop-blur-md text-[10px] font-mono font-bold text-white shadow border border-white/30 group-hover:bg-white group-hover:text-black transition-colors">
											{sound.key}
										</div>

										{/* Frosted Micro-Glass Version Pill or Drag Handle */}
										<div className="absolute top-2.5 right-2.5 z-10">
											{isEditMode ? (
												<span className="flex items-center p-1 rounded-md bg-amber-400/30 text-amber-200 border border-amber-300/40">
													<GripVerticalIcon className="size-3" />
												</span>
											) : isCued !== -1 ? (
												<span className="flex items-center gap-0.5 rounded-full bg-purple-600/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white border border-purple-300 shadow-sm animate-pulse">
													QUEUED #{isCued + 1}
												</span>
											) : sound.version === "Streamer Take" ? (
												<span className="flex items-center gap-0.5 rounded-full bg-purple-500/35 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-semibold text-purple-100 border border-purple-300/60 shadow-sm">
													<SparklesIcon className="size-2.5" />
													Take
												</span>
											) : (
												<span className="rounded-full bg-white/20 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-medium text-white/90 border border-white/35 shadow-sm">
													Orig
												</span>
											)}
										</div>

										{/* 3D Liquid Crystal Lens Dome */}
										<div className="relative z-10 my-2.5 flex items-center justify-center pointer-events-none">
											<div
												className={cn(
													"relative flex size-16 sm:size-18 items-center justify-center rounded-full p-1.5 transition-all duration-150",
													"bg-gradient-to-b from-white/70 via-white/20 to-black/50 border border-white/60",
													"shadow-[inset_0_2px_4px_rgba(255,255,255,0.85),0_10px_24px_rgba(0,0,0,0.55)]",
													isPlaying ? "translate-y-1 shadow-[0_2px_10px_rgba(0,0,0,0.7)]" : "group-hover:scale-105"
												)}
											>
												<div
													className={cn(
														"relative flex size-full items-center justify-center rounded-full bg-gradient-to-br transition-all overflow-hidden",
														sound.color,
														"shadow-[inset_0_2px_8px_rgba(255,255,255,0.85),inset_0_-6px_12px_rgba(0,0,0,0.55)]",
														isPlaying ? "scale-90 brightness-130" : "brightness-110 group-hover:brightness-120"
													)}
												>
													<div className="pointer-events-none absolute top-1 left-2 right-2 h-3.5 rounded-full bg-gradient-to-b from-white/90 to-transparent blur-[0.4px]" />
													<div className="pointer-events-none absolute bottom-1 left-3.5 right-3.5 h-1.5 rounded-full bg-white/40 blur-[0.8px]" />

													<Volume2Icon
														className={cn(
															"size-6 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-transform",
															isPlaying ? "scale-125" : "group-hover:scale-110"
														)}
													/>
												</div>
											</div>
										</div>

										{/* Sound Label */}
										<div className="relative z-10 w-full pointer-events-none">
											<p className="truncate text-xs font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] group-hover:text-white">
												{sound.title}
											</p>
											<span className="text-[10px] text-white/90 font-mono drop-shadow">[{sound.key}]</span>
										</div>
									</div>
								);
							})}
						</div>
					</LiquidGlass>
				</div>
			)}
		</div>
	);
}
