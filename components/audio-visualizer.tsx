"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface StaticWaveformVisualizerProps {
	audioUrl?: string;
	referencePeaks?: number[];
	overlayPeaks?: number[];
	progress?: number; // 0 to 1
	isRecording?: boolean;
	isPlaying?: boolean;
	className?: string;
	barCount?: number;
	soundTitle?: string;
	soundCategory?: string;
	onSeek?: (ratio: number) => void;
}

// Generate smooth, natural speech-like waveform peaks as deterministic fallback
function generateSpeechPeaks(seedStr: string, count = 120): number[] {
	let hash = 0;
	for (let i = 0; i < seedStr.length; i++) {
		hash = (hash << 5) - hash + seedStr.charCodeAt(i);
		hash |= 0;
	}

	const peaks: number[] = [];
	for (let i = 0; i < count; i++) {
		const norm = i / count;
		// Create 2 to 3 speech syllable bursts with pauses in between (like Gojo/Sukuna voice lines)
		const burst1 = Math.exp(-Math.pow((norm - 0.2) / 0.08, 2)) * 0.95;
		const burst2 = Math.exp(-Math.pow((norm - 0.42) / 0.07, 2)) * 0.75;
		const burst3 = Math.exp(-Math.pow((norm - 0.78) / 0.12, 2)) * 0.98;
		const speechEnvelope = Math.max(0.04, burst1 + burst2 + burst3);

		// High frequency micro-variation
		const pseudoRand = Math.sin(i * 12.9898 + (hash % 100)) * 43758.5453;
		const jitter = (pseudoRand - Math.floor(pseudoRand)) * 0.25;

		const amp = Math.min(0.95, Math.max(0.06, speechEnvelope * (0.8 + jitter)));
		peaks.push(amp);
	}
	return peaks;
}

export function AudioVisualizer({
	audioUrl,
	referencePeaks,
	overlayPeaks,
	progress = 0,
	isRecording = false,
	isPlaying = false,
	className,
	barCount = 140,
	onSeek,
}: StaticWaveformVisualizerProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [peaks, setPeaks] = useState<number[]>(() => referencePeaks || generateSpeechPeaks(audioUrl || "echodeck", barCount));

	// Decode real audio file into authentic waveform peaks when audioUrl is present
	useEffect(() => {
		if (referencePeaks && referencePeaks.length > 0) {
			setPeaks(referencePeaks);
			return;
		}

		if (!audioUrl) {
			setPeaks(generateSpeechPeaks("echodeck-default", barCount));
			return;
		}

		let isCancelled = false;

		async function decodeAudio() {
			try {
				const res = await fetch(audioUrl!);
				if (!res.ok) throw new Error("Audio fetch failed");
				const buffer = await res.arrayBuffer();

				const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
				const ctx = new AudioCtx();
				const audioBuffer = await ctx.decodeAudioData(buffer);
				await ctx.close();

				if (isCancelled) return;

				const rawData = audioBuffer.getChannelData(0);
				const sampleSize = Math.max(1, Math.floor(rawData.length / barCount));
				const calculatedPeaks: number[] = [];

				for (let i = 0; i < barCount; i++) {
					let sum = 0;
					const start = i * sampleSize;
					const end = Math.min(start + sampleSize, rawData.length);
					for (let j = start; j < end; j++) {
						sum += Math.abs(rawData[j]);
					}
					const avg = sum / (end - start || 1);
					calculatedPeaks.push(avg);
				}

				// Normalize peaks so maximum reaches ~0.92
				const max = Math.max(...calculatedPeaks, 0.001);
				const normalized = calculatedPeaks.map((p) => Math.min(0.95, Math.max(0.04, (p / max) * 0.92)));

				if (!isCancelled) {
					setPeaks(normalized);
				}
			} catch {
				// Fallback to organic speech envelope if decode blocked by CORS or network
				if (!isCancelled) {
					setPeaks(generateSpeechPeaks(audioUrl!, barCount));
				}
			}
		}

		decodeAudio();

		return () => {
			isCancelled = true;
		};
	}, [audioUrl, referencePeaks, barCount]);

	// Draw the exact symmetrical layered waveform with center baseline, red scrub bar & take overlay
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;

		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, width, height);

		const centerY = height / 2;
		const barWidth = width / barCount;
		const maxHalfHeight = (height - 12) / 2;

		// 1. Draw horizontal center baseline (pink/lavender line from reference images)
		ctx.beginPath();
		ctx.strokeStyle = "rgba(244, 114, 182, 0.4)"; // soft pink/lavender baseline
		ctx.lineWidth = 1.5;
		ctx.moveTo(0, centerY);
		ctx.lineTo(width, centerY);
		ctx.stroke();

		// Helper to draw a symmetrical waveform layer
		const drawWaveform = (data: number[], isOverlay = false) => {
			for (let i = 0; i < barCount; i++) {
				const peak = data[i] !== undefined ? data[i] : 0.04;
				const barH = Math.max(3, peak * maxHalfHeight);
				const x = i * barWidth;
				const top = centerY - barH;
				const bottom = centerY + barH;

				// Multi-tone vertical linear gradient:
				// White at center baseline -> vibrant cyan -> royal blue at top/bottom tips
				const grad = ctx.createLinearGradient(0, top, 0, bottom);
				if (!isOverlay) {
					// Base target sound: Royal Blue -> Sky Cyan -> Pure White -> Sky Cyan -> Royal Blue
					grad.addColorStop(0.0, "#1d4ed8"); // Deep Royal Blue tip
					grad.addColorStop(0.2, "#3b82f6"); // Vibrant Blue
					grad.addColorStop(0.42, "#38bdf8"); // Cyan / Light Blue
					grad.addColorStop(0.5, "#ffffff"); // Pure White center core
					grad.addColorStop(0.58, "#38bdf8"); // Cyan
					grad.addColorStop(0.8, "#3b82f6"); // Vibrant Blue
					grad.addColorStop(1.0, "#1d4ed8"); // Royal Blue tip
				} else {
					// Overlay take (streamer voice): Coral/Purple/Orange overlay so differences pop
					grad.addColorStop(0.0, "#c026d3"); // Fuchsia tip
					grad.addColorStop(0.3, "#ec4899"); // Pink
					grad.addColorStop(0.5, "#ffffff"); // Pure White center core
					grad.addColorStop(0.7, "#ec4899"); // Pink
					grad.addColorStop(1.0, "#c026d3"); // Fuchsia tip
				}

				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.roundRect(x + 0.5, top, Math.max(1.5, barWidth - 1), barH * 2, [2]);
				ctx.fill();
			}
		};

		// 2. Draw Target Sound Reference Waveform
		ctx.globalAlpha = 1.0;
		drawWaveform(peaks, false);

		// 3. Draw Overlaid Mimic Take Waveform (50% - 60% opacity)
		if (overlayPeaks && overlayPeaks.length > 0) {
			ctx.globalAlpha = 0.55; // 55% opacity overlay as requested
			drawWaveform(overlayPeaks, true);
			ctx.globalAlpha = 1.0;
		}

		// 4. Red scrub bar (playhead / recording cursor) moving across to the right
		const clampedProgress = Math.max(0, Math.min(1, progress));
		const playheadX = clampedProgress * width;

		ctx.shadowColor = "rgba(255, 0, 50, 0.95)";
		ctx.shadowBlur = 12;
		ctx.strokeStyle = "#ff0033"; // Vibrant Laser Red playhead
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(playheadX, 0);
		ctx.lineTo(playheadX, height);
		ctx.stroke();

		// Top & bottom caps on the red scrubber bar
		ctx.fillStyle = "#ff0033";
		ctx.fillRect(playheadX - 4, 0, 8, 5);
		ctx.fillRect(playheadX - 4, height - 5, 8, 5);
		ctx.shadowBlur = 0;
	}, [peaks, overlayPeaks, progress, barCount, isRecording, isPlaying]);

	// Interactive seek scrubber
	const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!onSeek) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const ratio = Math.max(0, Math.min(1, clickX / rect.width));
		onSeek(ratio);
	};

	return (
		<div
			onClick={handleCanvasClick}
			className={cn(
				"relative w-full h-32 sm:h-36 rounded-2xl sm:rounded-3xl bg-[#09090b] border-2 border-[#00d2ff] shadow-[0_0_25px_rgba(0,210,255,0.25)] flex items-center justify-center p-3 sm:p-4 overflow-hidden select-none cursor-pointer group",
				isRecording && "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]",
				className
			)}
		>
			<canvas
				ref={canvasRef}
				className="w-full h-full block"
			/>

			{/* Subtly indicate seekable overlay on hover */}
			<div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors pointer-events-none" />
		</div>
	);
}
