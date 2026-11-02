"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { Volume2Icon, RadioIcon, SparklesIcon, CheckCircle2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample sounds for the simple extension demo
const DEMO_SOUNDS = [
	{
		id: "bruh",
		title: "Bruh Sound #2",
		category: "Meme",
		audioUrl: "/sfx/sfx-funny-1.mp3",
		color: "from-amber-500 to-orange-600",
		freq: 220,
		type: "sawtooth" as OscillatorType,
	},
	{
		id: "reverb-fart",
		title: "Fart Reverb",
		category: "Funny",
		audioUrl: "/sfx/fart-with-reverb.mp3",
		color: "from-purple-600 to-indigo-600",
		freq: 140,
		type: "sine" as OscillatorType,
	},
];

export default function TwitchPanelExtension() {
	const [twitchAuth, setTwitchAuth] = useState<{
		channelId?: string;
		userId?: string;
		token?: string;
	} | null>(null);

	const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
	const [volume, setVolume] = useState(0.8);
	const [lastPlayed, setLastPlayed] = useState<string | null>(null);
	const [clickCount, setClickCount] = useState<Record<string, number>>({ bruh: 0, "reverb-fart": 0 });

	// Initialize Twitch Extension JS Helper
	useEffect(() => {
		if (typeof window !== "undefined" && (window as any).Twitch?.ext) {
			const ext = (window as any).Twitch.ext;
			ext.onAuthorized((auth: any) => {
				setTwitchAuth({
					channelId: auth.channelId,
					userId: auth.userId,
					token: auth.token,
				});
			});
		}
	}, []);

	// Play audio locally on the viewer's device
	const handlePlaySound = (sound: typeof DEMO_SOUNDS[0]) => {
		setActivePlayingId(sound.id);
		setLastPlayed(sound.title);
		setClickCount((prev) => ({ ...prev, [sound.id]: (prev[sound.id] || 0) + 1 }));

		try {
			if (sound.audioUrl) {
				const audio = new Audio(sound.audioUrl);
				audio.volume = volume;
				audio.play().catch(() => playSynthFallback(sound.freq, sound.type));
			} else {
				playSynthFallback(sound.freq, sound.type);
			}
		} catch {
			playSynthFallback(sound.freq, sound.type);
		}

		setTimeout(() => {
			setActivePlayingId((prev) => (prev === sound.id ? null : prev));
		}, 400);
	};

	const playSynthFallback = (freq = 440, type: OscillatorType = "sine") => {
		try {
			const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
			const ctx = new AudioCtx();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = type;
			osc.frequency.setValueAtTime(freq, ctx.currentTime);
			gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start();
			osc.stop(ctx.currentTime + 0.35);
			setTimeout(() => ctx.close().catch(() => {}), 450);
		} catch {}
	};

	return (
		<>
			{/* Official Twitch Extension Helper Script */}
			<Script
				src="https://extension-files.twitch.tv/helper/v1/twitch-ext.min.js"
				strategy="lazyOnload"
				onLoad={() => {
					if (typeof window !== "undefined" && (window as any).Twitch?.ext) {
						(window as any).Twitch.ext.onAuthorized((auth: any) => {
							setTwitchAuth({
								channelId: auth.channelId,
								userId: auth.userId,
								token: auth.token,
							});
						});
					}
				}}
			/>

			{/* Twitch Standard Panel Dimensions: exactly 318px wide */}
			<div className="w-[318px] min-h-[420px] bg-[#0e0e10] text-[#efeff1] p-3.5 rounded-lg border border-[#26262c] shadow-xl font-sans select-none flex flex-col justify-between">
				{/* Twitch Panel Header */}
				<div className="flex flex-col gap-2 border-b border-[#26262c] pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<div className="size-6 rounded-md bg-[#9146FF] flex items-center justify-center text-white">
								<RadioIcon className="size-3.5" />
							</div>
							<h3 className="text-xs font-bold tracking-tight text-white uppercase">
								EchoDeck Twitch Panel
							</h3>
						</div>
						<span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
							<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
							Live
						</span>
					</div>

					<p className="text-[11px] text-zinc-400 leading-tight">
						Viewer soundboard demo: Click a sound box to play audio locally on your device.
					</p>

					{/* Twitch Auth Status Badge */}
					<div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
						<span>Channel: {twitchAuth?.channelId || "Local Test Channel"}</span>
						<span className="text-purple-400">Twitch Extension v1.0</span>
					</div>
				</div>

				{/* The Two Sound Boxes */}
				<div className="flex flex-col gap-3 my-3">
					{DEMO_SOUNDS.map((sound) => {
						const isPlaying = activePlayingId === sound.id;
						const plays = clickCount[sound.id] || 0;

						return (
							<button
								key={sound.id}
								onClick={() => handlePlaySound(sound)}
								type="button"
								className={cn(
									"group relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left shadow-md",
									isPlaying
										? "bg-purple-600/30 border-purple-400 scale-[0.98] ring-2 ring-purple-500/40"
										: "bg-[#18181b] hover:bg-[#1f1f23] border-[#2e2e35] hover:border-purple-500/50 hover:scale-[1.01]"
								)}
							>
								{/* Left: Icon & Sound Info */}
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"size-11 rounded-xl flex items-center justify-center transition-all shadow",
											isPlaying
												? "bg-[#9146FF] text-white scale-110 rotate-6"
												: "bg-zinc-800 group-hover:bg-[#9146FF] text-zinc-300 group-hover:text-white"
										)}
									>
										<Volume2Icon className="size-5" />
									</div>

									<div>
										<h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
											{sound.title}
										</h4>
										<div className="flex items-center gap-2 mt-0.5">
											<span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
												{sound.category}
											</span>
											{plays > 0 && (
												<span className="text-[10px] text-zinc-500 font-mono">
													{plays} tap{plays > 1 ? "s" : ""}
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Right: Trigger Button Pill */}
								<div
									className={cn(
										"px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0",
										isPlaying
											? "bg-white text-black shadow-md scale-105"
											: "bg-[#9146FF]/20 text-[#bf94ff] group-hover:bg-[#9146FF] group-hover:text-white"
									)}
								>
									{isPlaying ? "Playing..." : "Play"}
								</div>
							</button>
						);
					})}
				</div>

				{/* Volume Control & Status Footer */}
				<div className="pt-3 border-t border-[#26262c] flex flex-col gap-2">
					<div className="flex items-center justify-between text-[11px] text-zinc-400">
						<span className="text-[10px] font-semibold text-zinc-500 uppercase">Device Volume</span>
						<span className="font-mono text-zinc-300">{Math.round(volume * 100)}%</span>
					</div>

					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						value={volume}
						onChange={(e) => setVolume(parseFloat(e.target.value))}
						className="w-full accent-[#9146FF] cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
					/>

					{lastPlayed && (
						<p className="text-[10px] text-center text-purple-400/90 font-medium animate-in fade-in">
							Last played: <span className="text-white font-semibold">"{lastPlayed}"</span>
						</p>
					)}
				</div>
			</div>
		</>
	);
}

