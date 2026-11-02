"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glasscn/glass-card";
import { GlassButton } from "@/components/ui/glasscn/glass-button";
import { RadioIcon, Volume2Icon, VolumeXIcon, UsersIcon, ShieldAlertIcon, PlayIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeckStreamPreview() {
	const [isMuted, setIsMuted] = useState(false);
	const [requestsActive, setRequestsActive] = useState(true);

	return (
		<GlassCard glassVariant="liquid" className="relative overflow-hidden rounded-2xl p-4 border border-white/20">
			<div className="flex flex-col gap-3">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
							<span className="size-2 rounded-full bg-red-500 animate-pulse" />
							LIVE
						</span>
						<span className="text-xs font-mono text-muted-foreground">02:44:12</span>
					</div>

					<div className="flex items-center gap-2">
						<GlassButton
							glassVariant="subtle"
							size="sm"
							onClick={() => setRequestsActive(!requestsActive)}
							className={cn(
								"text-xs font-medium h-7 px-2.5",
								requestsActive ? "text-emerald-400 border-emerald-500/30" : "text-amber-400 border-amber-500/30"
							)}
						>
							<ShieldAlertIcon className="size-3.5 mr-1" />
							{requestsActive ? "Viewer SFX: Active" : "Viewer SFX: Paused"}
						</GlassButton>

						<GlassButton
							glassVariant="subtle"
							size="icon-sm"
							onClick={() => setIsMuted(!isMuted)}
							className="size-7"
						>
							{isMuted ? <VolumeXIcon className="size-3.5 text-red-400" /> : <Volume2Icon className="size-3.5 text-white" />}
						</GlassButton>
					</div>
				</div>

				{/* Stream Monitor Video Canvas Mockup */}
				<div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-tr from-slate-950 via-purple-950/60 to-slate-900 border border-white/10 shadow-inner flex items-center justify-center group">
					{/* Ambient Game / Stream Background */}
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-800/20 via-transparent to-black" />
					
					{/* Streamer Avatar / Webcam PiP Mockup */}
					<div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1.5 backdrop-blur-md border border-white/10">
						<div className="size-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow">
							ED
						</div>
						<div className="text-left">
							<p className="text-xs font-semibold text-white leading-none">EchoStreamer</p>
							<p className="text-[10px] text-emerald-400 font-mono leading-tight">60 FPS • 1080p</p>
						</div>
					</div>

					{/* Center Audio Reactive Watermark */}
					<div className="flex flex-col items-center justify-center text-center">
						<div className="flex items-end gap-1 mb-2 h-8">
							<span className="w-1 bg-primary/80 rounded-full h-3 animate-[pulse_1s_ease-in-out_infinite]" />
							<span className="w-1 bg-primary rounded-full h-7 animate-[pulse_0.8s_ease-in-out_infinite]" />
							<span className="w-1 bg-purple-400 rounded-full h-5 animate-[pulse_0.6s_ease-in-out_infinite]" />
							<span className="w-1 bg-primary rounded-full h-8 animate-[pulse_1.2s_ease-in-out_infinite]" />
							<span className="w-1 bg-indigo-400 rounded-full h-4 animate-[pulse_0.7s_ease-in-out_infinite]" />
						</div>
						<p className="text-xs text-white/70 font-medium">OBS Audio Bridge Active</p>
					</div>

					{/* Viewers & Category Overlay */}
					<div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-[11px] text-white/90 backdrop-blur-sm">
						<UsersIcon className="size-3 text-purple-400" />
						<span className="font-semibold">4,821</span>
					</div>
				</div>

				{/* Title & Metadata */}
				<div className="flex items-center justify-between text-xs">
					<div className="truncate">
						<span className="font-semibold text-foreground">Just Chatting • Soundboard Live</span>
						<span className="text-muted-foreground ml-2">Channel: twitch.tv/echodeck</span>
					</div>
					<span className="font-mono text-muted-foreground">OBS Audio Source #1</span>
				</div>
			</div>
		</GlassCard>
	);
}

