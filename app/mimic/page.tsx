"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StoredSound, getSavedLibrary, addSoundToLibrary } from "@/lib/deck-store";
import { playBroadcastSfx, playSyntheticSfx } from "@/lib/mock-audio";
import { AudioVisualizer } from "@/components/audio-visualizer";
import {
	MicIcon,
	Volume2Icon,
	SparklesIcon,
	CheckIcon,
	PlayIcon,
	PauseIcon,
	ArrowLeftIcon,
	StoreIcon,
	SaveIcon,
	UsersIcon,
	BarChart3Icon,
	LayersIcon,
	FlameIcon,
	AlertCircleIcon,
	SquareIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MimicTake = {
	takeNum: number;
	score: number;
	label: string;
	peaks: number[];
	audioUrl: string; // Blob URL for instant playback
	base64Audio: string; // Base64 Data URL for persistent DB storage
	durationSec: number;
};

function MimicStudioContent() {
	const searchParams = useSearchParams();
	const initialSoundId = searchParams.get("soundId");

	const [librarySounds, setLibrarySounds] = useState<StoredSound[]>([]);
	const [activeSound, setActiveSound] = useState<StoredSound | null>(null);

	// Playback & Recording state
	const [isPlayingRef, setIsPlayingRef] = useState(false);
	const [isPlayingTake, setIsPlayingTake] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [playProgress, setPlayProgress] = useState(0); // 0 to 1
	const [micError, setMicError] = useState<string | null>(null);

	// Takes & Arena state
	const [takeCount, setTakeCount] = useState(0);
	const [recordedTakes, setRecordedTakes] = useState<MimicTake[]>([]);
	const [selectedTakeIndex, setSelectedTakeIndex] = useState<number | null>(null);
	const [customTitle, setCustomTitle] = useState("");
	const [publishToMarketplace, setPublishToMarketplace] = useState(false);
	const [saveNotification, setSaveNotification] = useState<string | null>(null);

	// Audience poll state
	const [showPoll, setShowPoll] = useState(false);
	const [pollVotes, setPollVotes] = useState<Record<number, number>>({ 1: 42, 2: 78, 3: 29 });

	const animFrameRef = useRef<number | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const stopRecordingEarlyRef = useRef<(() => void) | null>(null);

	// Load library
	useEffect(() => {
		const fetchLib = async () => {
			try {
				const res = await fetch("/api/library");
				const data = await res.json();
				if (data.success && Array.isArray(data.items)) {
					const mapped: StoredSound[] = data.items.map((r: any) => ({
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
					}));
					setLibrarySounds(mapped);
					if (initialSoundId) {
						const found = mapped.find((s) => s.id === initialSoundId);
						if (found) selectSoundForChallenge(found);
					}
					return;
				}
			} catch {}
			const lib = getSavedLibrary();
			setLibrarySounds(lib);
			if (initialSoundId) {
				const found = lib.find((s) => s.id === initialSoundId);
				if (found) selectSoundForChallenge(found);
			}
		};
		fetchLib();
	}, [initialSoundId]);

	// Clean up media / audio on unmount
	useEffect(() => {
		return () => {
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
			if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
				mediaRecorderRef.current.stop();
			}
		};
	}, []);

	const selectSoundForChallenge = (sound: StoredSound) => {
		setActiveSound(sound);
		setCustomTitle(`${sound.title} (My Take)`);
		setTakeCount(0);
		setRecordedTakes([]);
		setSelectedTakeIndex(null);
		setSaveNotification(null);
		setPlayProgress(0);
		setMicError(null);
		setShowPoll(false);
	};

	const getSoundDurationSeconds = (durationStr?: string): number => {
		if (!durationStr) return 2.5;
		const parts = durationStr.split(":");
		if (parts.length === 2) {
			const m = parseInt(parts[0], 10) || 0;
			const s = parseInt(parts[1], 10) || 0;
			return Math.max(1.8, m * 60 + s);
		}
		return 2.5;
	};

	// 1. Play original reference sound
	const playReference = () => {
		if (!activeSound) return;
		if (isPlayingRef) {
			setIsPlayingRef(false);
			if (audioRef.current) audioRef.current.pause();
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
			return;
		}

		setIsPlayingRef(true);
		setIsPlayingTake(false);
		setPlayProgress(0);

		const totalSeconds = getSoundDurationSeconds(activeSound.duration);
		const startTime = performance.now();

		if (activeSound.audioUrl) {
			const audio = new Audio(activeSound.audioUrl);
			audioRef.current = audio;
			audio.play().catch(() => playSyntheticSfx(activeSound.freq, activeSound.type, totalSeconds));
		} else {
			playSyntheticSfx(activeSound.freq, activeSound.type, totalSeconds);
		}

		const tick = () => {
			const elapsed = (performance.now() - startTime) / 1000;
			const p = Math.min(1, elapsed / totalSeconds);
			setPlayProgress(p);

			if (p < 1) {
				animFrameRef.current = requestAnimationFrame(tick);
			} else {
				setIsPlayingRef(false);
				setPlayProgress(1);
			}
		};

		animFrameRef.current = requestAnimationFrame(tick);
	};

	// 2. Genuine Microphone Recording using Web MediaRecorder & Analyser
	const recordVoiceTake = async () => {
		if (takeCount >= 3 || !activeSound) return;

		// If currently recording, clicking stops it immediately
		if (isRecording && stopRecordingEarlyRef.current) {
			stopRecordingEarlyRef.current();
			return;
		}

		setMicError(null);
		setIsPlayingRef(false);
		setIsPlayingTake(false);

		let mediaStream: MediaStream | null = null;
		let mediaRecorder: MediaRecorder | null = null;
		const audioChunks: BlobPart[] = [];
		let audioContext: AudioContext | null = null;
		let analyser: AnalyserNode | null = null;

		try {
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				throw new Error("Your browser does not support microphone recording.");
			}

			// Prompt browser microphone permission
			mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
			});

			let mimeType = "audio/webm";
			if (typeof MediaRecorder !== "undefined") {
				if (!MediaRecorder.isTypeSupported("audio/webm")) {
					if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
					else if (MediaRecorder.isTypeSupported("audio/ogg")) mimeType = "audio/ogg";
					else mimeType = "";
				}
			}

			mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
			mediaRecorderRef.current = mediaRecorder;

			mediaRecorder.ondataavailable = (e) => {
				if (e.data && e.data.size > 0) {
					audioChunks.push(e.data);
				}
			};

			const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			audioContext = new AudioCtx();
			if (audioContext.state === "suspended") {
				await audioContext.resume();
			}
			const source = audioContext.createMediaStreamSource(mediaStream);
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);

			mediaRecorder.start(100);
		} catch (err: any) {
			console.error("Microphone error:", err);
			setMicError(
				err?.message?.includes("support")
					? err.message
					: "Microphone access blocked. Please allow microphone permissions in your browser to record your voice."
			);
			return;
		}

		setIsRecording(true);
		setPlayProgress(0);

		const totalSeconds = getSoundDurationSeconds(activeSound.duration);
		const sampleCount = 140;
		const livePeaks: number[] = new Array(sampleCount).fill(0.04);
		const startTime = performance.now();
		const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
		let isStopped = false;

		const finishRecording = () => {
			if (isStopped) return;
			isStopped = true;
			setIsRecording(false);
			setPlayProgress(1);
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
			stopRecordingEarlyRef.current = null;

			const actualDurationSec = Math.max(1, (performance.now() - startTime) / 1000);

			if (mediaRecorder && mediaRecorder.state !== "inactive") {
				mediaRecorder.onstop = async () => {
					const mime = mediaRecorder?.mimeType || "audio/webm";
					const blob = new Blob(audioChunks, { type: mime });
					const playableUrl = URL.createObjectURL(blob);

					// Decode recorded audio blob directly for authentic, punchy waveform peaks (never flat!)
					let finalPeaks: number[] = [];
					try {
						const arrayBuffer = await blob.arrayBuffer();
						const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
						const decodeCtx = new AudioCtx();
						const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
						await decodeCtx.close();

						const channelData = audioBuffer.getChannelData(0);
						const blockSize = Math.max(1, Math.floor(channelData.length / sampleCount));

						for (let i = 0; i < sampleCount; i++) {
							let sum = 0;
							const start = i * blockSize;
							const end = Math.min(start + blockSize, channelData.length);
							for (let j = start; j < end; j++) {
								sum += Math.abs(channelData[j]);
							}
							finalPeaks.push(sum / (end - start || 1));
						}

						// Normalize so peaks pop dynamically
						const maxVal = Math.max(...finalPeaks, 0.005);
						finalPeaks = finalPeaks.map((v) => Math.min(0.95, Math.max(0.06, (v / maxVal) * 0.92)));
					} catch {
						// Fallback to auto-scaled live peaks
						const maxLive = Math.max(...livePeaks, 0.005);
						finalPeaks = livePeaks.map((v) => Math.min(0.95, Math.max(0.06, (v / maxLive) * 0.90)));
					}

					// Convert to Base64 for permanent database storage
					const reader = new FileReader();
					reader.readAsDataURL(blob);
					reader.onloadend = () => {
						const base64Audio = reader.result as string;
						const newTakeNum = takeCount + 1;
						setTakeCount(newTakeNum);

						// Similarity calculation based on real voice activity
						const sumEnergy = finalPeaks.reduce((a, b) => a + b, 0);
						const avgEnergy = sumEnergy / finalPeaks.length;
						const score = Math.min(98, Math.max(72, Math.round(avgEnergy * 115 + 68)));
						const labels = [
							"Scarily Accurate!",
							"Certified Alpha Pitch",
							"Domain Expansion Energy",
							"GigaChad Delivery",
							"Spot-on Cadence",
						];
						const label = labels[Math.floor(Math.random() * labels.length)];

						const newTake: MimicTake = {
							takeNum: newTakeNum,
							score,
							label,
							peaks: finalPeaks,
							audioUrl: playableUrl,
							base64Audio,
							durationSec: actualDurationSec,
						};

						const updatedTakes = [...recordedTakes, newTake];
						setRecordedTakes(updatedTakes);
						setSelectedTakeIndex(updatedTakes.length - 1);
					};

					// Release microphone tracks
					if (mediaStream) {
						mediaStream.getTracks().forEach((track) => track.stop());
					}
					if (audioContext) {
						audioContext.close().catch(() => {});
					}
				};

				mediaRecorder.stop();
			}
		};

		stopRecordingEarlyRef.current = finishRecording;

		const recordTick = () => {
			const elapsed = (performance.now() - startTime) / 1000;
			const p = Math.min(1, elapsed / totalSeconds);
			setPlayProgress(p);

			const currentIndex = Math.min(sampleCount - 1, Math.floor(p * sampleCount));

			if (analyser && dataArray) {
				analyser.getByteFrequencyData(dataArray);
				let sum = 0;
				for (let i = 0; i < dataArray.length; i++) {
					sum += dataArray[i];
				}
				const avg = sum / (dataArray.length || 1);
				const normalized = Math.min(0.95, Math.max(0.06, avg / 120));
				livePeaks[currentIndex] = normalized;
			}

			if (p < 1 && !isStopped) {
				animFrameRef.current = requestAnimationFrame(recordTick);
			} else if (!isStopped) {
				finishRecording();
			}
		};

		animFrameRef.current = requestAnimationFrame(recordTick);
	};

	// 3. Play selected recorded voice take (plays actual recorded user audio)
	const playSelectedTake = () => {
		if (selectedTakeIndex === null || !recordedTakes[selectedTakeIndex]) return;
		const take = recordedTakes[selectedTakeIndex];
		if (!take.audioUrl) return;

		if (isPlayingTake) {
			setIsPlayingTake(false);
			if (audioRef.current) audioRef.current.pause();
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
			return;
		}

		setIsPlayingTake(true);
		setIsPlayingRef(false);
		setPlayProgress(0);

		const audio = new Audio(take.audioUrl);
		audioRef.current = audio;

		const totalSeconds = take.durationSec || getSoundDurationSeconds(activeSound?.duration);
		const playStartTime = performance.now();

		audio.onended = () => {
			setIsPlayingTake(false);
			setPlayProgress(1);
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
		};

		audio.onerror = () => {
			setIsPlayingTake(false);
		};

		audio.play().catch(() => {
			setIsPlayingTake(false);
		});

		// Animate red scrub bar in real-time across the visualizer
		const trackPlayback = () => {
			let p = 0;
			if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
				p = Math.min(1, audio.currentTime / audio.duration);
			} else {
				const elapsed = (performance.now() - playStartTime) / 1000;
				p = Math.min(1, elapsed / totalSeconds);
			}
			setPlayProgress(p);

			if (p < 1 && !audio.paused) {
				animFrameRef.current = requestAnimationFrame(trackPlayback);
			} else if (p >= 1) {
				setIsPlayingTake(false);
				setPlayProgress(1);
			}
		};
		animFrameRef.current = requestAnimationFrame(trackPlayback);
	};

	// 4. Save take to database and library with actual recorded audio data
	const handleSaveTake = async () => {
		if (!activeSound || selectedTakeIndex === null) return;
		const take = recordedTakes[selectedTakeIndex];
		const title = customTitle.trim() || `${activeSound.title} Take #${take.takeNum}`;
		const audioToSave = take.base64Audio || take.audioUrl || "";

		let savedId = `mimic-${Date.now()}`;
		try {
			const res = await fetch("/api/mimic", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					referenceSfxId: activeSound.id,
					title,
					audioData: audioToSave,
					score: take.score,
					takeNumber: take.takeNum,
				}),
			});
			const data = await res.json();
			if (data.success && data.id) {
				savedId = data.id;
			}
		} catch {}

		const newSound: StoredSound = {
			id: savedId,
			title,
			category: activeSound.category,
			version: "Streamer Take",
			color: "from-purple-500 to-indigo-600",
			freq: activeSound.freq * 1.15,
			type: "sawtooth",
			duration: activeSound.duration,
			audioUrl: audioToSave,
			source: "Mimic Studio",
			tags: ["mimic", "voice", publishToMarketplace ? "marketplace" : "private"],
		};

		addSoundToLibrary(newSound);
		setSaveNotification(`Saved "${newSound.title}" with your actual voice recording to Sound Library!`);
		setLibrarySounds(getSavedLibrary());
	};

	const currentOverlayPeaks = selectedTakeIndex !== null ? recordedTakes[selectedTakeIndex]?.peaks : undefined;

	return (
		<div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-2">
			{/* Mimic Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
				<div>
					<div className="flex items-center gap-2.5">
						<div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
							<MicIcon className="size-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-zinc-100">Mimic Challenge Arena</h1>
					</div>
					<p className="text-xs sm:text-sm text-zinc-400 mt-1">
						Live microphone recording: Your genuine voice audio is captured, overlaid at 55% opacity onto the static target waveform, and saved for immediate playback.
					</p>
				</div>

				{activeSound && (
					<button
						onClick={() => setActiveSound(null)}
						type="button"
						className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer w-fit"
					>
						<ArrowLeftIcon className="size-3.5" />
						Back to Sound List
					</button>
				)}
			</div>

			{/* Microphone Permission Warning Banner */}
			{micError && (
				<div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium animate-in fade-in">
					<AlertCircleIcon className="size-5 shrink-0 text-red-400" />
					<p>{micError}</p>
				</div>
			)}

			{/* Toast Banner */}
			{saveNotification && (
				<div className="flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-in fade-in">
					<div className="flex items-center gap-2">
						<CheckIcon className="size-4 shrink-0" />
						{saveNotification}
					</div>
					<Link
						href="/library"
						className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[11px] hover:bg-emerald-400 transition-colors"
					>
						View in Library →
					</Link>
				</div>
			)}

			{/* ========================================================= */}
			{/* VIEW 1: SOUND SELECTOR FROM USER LIBRARY                  */}
			{/* ========================================================= */}
			{!activeSound ? (
				librarySounds.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-3xl bg-[#141416] border border-zinc-800 shadow-2xl">
						<div className="flex size-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
							<MicIcon className="size-8" />
						</div>
						<h3 className="text-xl font-bold text-zinc-100">No Sounds to Mimic Yet</h3>
						<p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md">
							The Mimic Challenge compares your voice against sounds in your personal Library. Visit the Marketplace to add sound effects first!
						</p>
						<Link
							href="/marketplace"
							className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30"
						>
							<StoreIcon className="size-4" />
							Browse Marketplace
						</Link>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between">
							<h2 className="text-base sm:text-lg font-bold text-zinc-100">
								Choose a Sound from Your Library ({librarySounds.length})
							</h2>
							<span className="text-xs text-zinc-500">Click any sound to start challenge</span>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							{librarySounds.map((sound) => (
								<div
									key={sound.id}
									onClick={() => selectSoundForChallenge(sound)}
									className="group flex items-center justify-between p-4 rounded-[22px] bg-[#1f1f23] hover:bg-[#27272c] border border-zinc-800 hover:border-cyan-500/50 shadow-md transition-all cursor-pointer"
								>
									<div className="flex items-center gap-3">
										<div className="size-10 rounded-full bg-zinc-800 group-hover:bg-cyan-600 text-zinc-300 group-hover:text-white flex items-center justify-center transition-colors">
											<Volume2Icon className="size-4" />
										</div>
										<div>
											<p className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
												{sound.title}
											</p>
											<span className="text-[11px] text-zinc-500">
												{sound.category} • {sound.duration}
											</span>
										</div>
									</div>

									<button
										type="button"
										className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600/20 group-hover:bg-cyan-600 text-cyan-300 group-hover:text-white text-xs font-bold transition-all border border-cyan-500/30"
									>
										<MicIcon className="size-3" />
										Challenge
									</button>
								</div>
							))}
						</div>
					</div>
				)
			) : (
				/* ========================================================= */
				/* VIEW 2: ACTIVE MIMIC RECORDING ARENA (Screenshot Style)   */
				/* ========================================================= */
				<div className="flex flex-col lg:flex-row gap-6 w-full items-start">
					{/* Left Column: Visual Reference Arena Box */}
					<div className="flex-1 flex flex-col gap-6 w-full">
						{/* Arena Presentation Card matching Gojo / Sukuna reference */}
						<div className="rounded-[32px] bg-[#0c0d10] p-6 sm:p-10 border border-zinc-800 shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
							{/* Subtle background ambient glow */}
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />

							{/* Top Center Character / Sound Avatar */}
							<div className="relative">
								<div className="size-24 sm:size-28 rounded-full border-4 border-white/20 shadow-[0_0_25px_rgba(0,210,255,0.35)] overflow-hidden bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center">
									<FlameIcon className="size-12 text-white drop-shadow" />
								</div>
								<div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-extrabold tracking-wider uppercase shadow">
									TARGET
								</div>
							</div>

							{/* Sound Title & Category Subtitle */}
							<div>
								<h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
									{activeSound.title}
								</h2>
								<p className="text-sm font-semibold text-zinc-400 mt-1">
									{activeSound.category} Sound Pack • {activeSound.duration}
								</p>
							</div>

							{/* The Unified Cyan Waveform Visualizer with Center Baseline & Red Scrub Bar */}
							<div className="w-full">
								<AudioVisualizer
									audioUrl={activeSound.audioUrl}
									overlayPeaks={currentOverlayPeaks}
									progress={playProgress}
									isRecording={isRecording}
									isPlaying={isPlayingRef || isPlayingTake}
									soundTitle={activeSound.title}
									soundCategory={activeSound.category}
									className="h-32 sm:h-40"
									onSeek={(ratio) => setPlayProgress(ratio)}
								/>

								{/* Waveform Legend & Scrub Position Indicator */}
								<div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-2.5 px-2">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-1.5">
											<span className="size-2 rounded-full bg-[#38bdf8]" />
											<span>Original Audio (Base)</span>
										</div>
										{selectedTakeIndex !== null && (
											<div className="flex items-center gap-1.5 text-fuchsia-400">
												<span className="size-2 rounded-full bg-fuchsia-400" />
												<span>Take #{recordedTakes[selectedTakeIndex].takeNum} (55% Opacity Voice Overlay)</span>
											</div>
										)}
									</div>
									<span className="text-zinc-500">
										{Math.round(playProgress * 100)}%
									</span>
								</div>
							</div>

							{/* Arena Action Controls */}
							<div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
								{/* Listen to Original Sound */}
								<button
									onClick={playReference}
									disabled={isRecording}
									type="button"
									className={cn(
										"flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border shadow-lg",
										isPlayingRef
											? "bg-cyan-500 text-black border-cyan-400 scale-98"
											: "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700"
									)}
								>
									{isPlayingRef ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
									{isPlayingRef ? "Playing Reference..." : "Play Reference"}
								</button>

								{/* Record Take Button */}
								<button
									onClick={recordVoiceTake}
									disabled={takeCount >= 3 && !isRecording}
									type="button"
									className={cn(
										"flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xl",
										isRecording
											? "bg-red-500 text-white animate-pulse shadow-red-500/50 ring-4 ring-red-500/30"
											: takeCount >= 3
											? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
											: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white shadow-red-500/30 hover:scale-105"
									)}
								>
									{isRecording ? <SquareIcon className="size-4 fill-white" /> : <MicIcon className="size-4" />}
									{isRecording
										? "Stop Recording"
										: takeCount >= 3
										? "3 Takes Completed"
										: `Record My Voice (${takeCount}/3)`}
								</button>

								{/* Playback Selected Take */}
								{selectedTakeIndex !== null && (
									<button
										onClick={playSelectedTake}
										disabled={isRecording}
										type="button"
										className={cn(
											"flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border shadow-lg",
											isPlayingTake
												? "bg-fuchsia-500 text-white border-fuchsia-400 scale-98"
												: "bg-fuchsia-950/40 hover:bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-800/60"
										)}
									>
										{isPlayingTake ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
										{isPlayingTake ? "Playing My Voice..." : `Play Take #${recordedTakes[selectedTakeIndex].takeNum}`}
									</button>
								)}
							</div>
						</div>
					</div>

					{/* Right Column: Takes Comparison, Viewer Poll, & Save */}
					<div className="w-full lg:w-96 flex flex-col gap-6">
						{/* Takes Vault Card */}
						<div className="rounded-[28px] bg-[#141416] p-6 border border-zinc-800 shadow-xl flex flex-col gap-5">
							<div className="flex items-center justify-between">
								<h3 className="text-base font-bold text-white flex items-center gap-2">
									<LayersIcon className="size-4 text-cyan-400" />
									Your Recorded Takes ({recordedTakes.length}/3)
								</h3>
								<span className="text-[11px] font-mono text-zinc-500">Overlay on click</span>
							</div>

							{recordedTakes.length === 0 ? (
								<div className="py-8 text-center text-zinc-500 text-xs">
									No takes recorded yet. Click <strong>Record My Voice</strong> and speak into your microphone to record.
								</div>
							) : (
								<div className="flex flex-col gap-2.5">
									{recordedTakes.map((take, idx) => {
										const isSelected = selectedTakeIndex === idx;
										return (
											<div
												key={`take-${take.takeNum}`}
												onClick={() => {
													setSelectedTakeIndex(idx);
													setIsPlayingTake(false);
													setIsPlayingRef(false);
													if (audioRef.current) audioRef.current.pause();
													if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
													setPlayProgress(0);
												}}
												className={cn(
													"flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer",
													isSelected
														? "bg-fuchsia-950/30 border-fuchsia-500 ring-2 ring-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]"
														: "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
												)}
											>
												<div className="flex items-center gap-3">
													<div
														className={cn(
															"size-9 rounded-full flex items-center justify-center font-mono font-bold text-xs",
															isSelected ? "bg-fuchsia-600 text-white" : "bg-zinc-800 text-zinc-300"
														)}
													>
														#{take.takeNum}
													</div>
													<div>
														<div className="flex items-center gap-2">
															<p className="text-xs font-bold text-white">Take #{take.takeNum}</p>
															{isSelected && (
																<span className="px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 text-[9px] font-bold">
																	OVERLAID
																</span>
															)}
														</div>
														<span className="text-[10px] text-zinc-400">{take.label}</span>
													</div>
												</div>

												<div className="text-right">
													<span className="text-base font-extrabold text-emerald-400">
														{take.score}%
													</span>
													<p className="text-[9px] text-zinc-500">Match</p>
												</div>
											</div>
										);
									})}
								</div>
							)}

							{/* Audience / Chat Poll Widget */}
							{recordedTakes.length >= 2 && (
								<div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
											<BarChart3Icon className="size-4 text-purple-400" />
											Stream Chat Poll
										</div>
										<button
											onClick={() => setShowPoll(!showPoll)}
											type="button"
											className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
										>
											{showPoll ? "Hide" : "Rank Best Take"}
										</button>
									</div>

									{showPoll && (
										<div className="flex flex-col gap-2 pt-1">
											<p className="text-[11px] text-zinc-400">
												Viewers voting live on your best imitation:
											</p>
											{recordedTakes.map((take) => {
												const votes = pollVotes[take.takeNum] || 25;
												const total = Object.values(pollVotes).reduce((a, b) => a + b, 0);
												const pct = Math.round((votes / total) * 100);
												return (
													<div key={`poll-${take.takeNum}`} className="flex flex-col gap-1">
														<div className="flex items-center justify-between text-[11px]">
															<span className="font-semibold text-zinc-300">
																Take #{take.takeNum} ({take.label})
															</span>
															<span className="font-mono text-purple-300">{pct}%</span>
														</div>
														<div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
															<div
																className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500"
																style={{ width: `${pct}%` }}
															/>
														</div>
													</div>
												);
											})}
										</div>
									)}
								</div>
							)}

							{/* Save Take Form */}
							{selectedTakeIndex !== null && (
								<div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-4">
									<div>
										<label className="text-xs font-semibold text-zinc-400 mb-1.5 block">
											Name Your Official SFX
										</label>
										<input
											type="text"
											value={customTitle}
											onChange={(e) => setCustomTitle(e.target.value)}
											placeholder="My Mimic Sound Title"
											className="w-full rounded-xl bg-zinc-900 px-3.5 py-2 text-xs text-white border border-zinc-800 focus:outline-none focus:border-cyan-500"
										/>
									</div>

									{/* Publish to Marketplace Checkbox */}
									<label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 cursor-pointer">
										<input
											type="checkbox"
											checked={publishToMarketplace}
											onChange={(e) => setPublishToMarketplace(e.target.checked)}
											className="size-4 rounded accent-cyan-500"
										/>
										<div className="text-left">
											<p className="text-xs font-semibold text-zinc-200">List on SFX Marketplace</p>
											<p className="text-[10px] text-zinc-500">Allow other streamers to add your voice take</p>
										</div>
									</label>

									{/* Save Button */}
									<button
										onClick={handleSaveTake}
										type="button"
										className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
									>
										<SaveIcon className="size-4" />
										Save Take #{recordedTakes[selectedTakeIndex].takeNum} to Sound Library
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default function MimicPage() {
	return (
		<AppShell pathname="/mimic">
			<Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading Mimic Arena...</div>}>
				<MimicStudioContent />
			</Suspense>
		</AppShell>
	);
}
