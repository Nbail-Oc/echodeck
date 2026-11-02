"use client";

import { GlassCard } from "@/components/ui/glasscn/glass-card";
import { UsersIcon, ActivityIcon, HeartIcon, SparklesIcon, Volume2Icon, TrendingUpIcon, ClockIcon } from "lucide-react";
import { playSyntheticSfx } from "@/lib/mock-audio";

const RECENT_ACTIVITIES = [
	{ id: "act-1", user: "PixelKnight", badge: "Sub 14mo", sound: "Bruh Sound #2", time: "3s ago", avatar: "PK", color: "bg-indigo-500" },
	{ id: "act-2", user: "ValkyrieQueen", badge: "VIP", sound: "Airhorn MLG", time: "18s ago", avatar: "VQ", color: "bg-pink-500" },
	{ id: "act-3", user: "NoobMaster69", badge: "Follower", sound: "Vine Boom", time: "42s ago", avatar: "NM", color: "bg-amber-500" },
	{ id: "act-4", user: "ChaiLover", badge: "Sub 3mo", sound: "Anime Wow", time: "1m ago", avatar: "CL", color: "bg-emerald-500" },
	{ id: "act-5", user: "SpeedyGonzales", badge: "Sub 8mo", sound: "Metal Pipe", time: "2m ago", avatar: "SG", color: "bg-cyan-500" },
];

const TOP_STREAMER_SFX = [
	{ id: "top-1", name: "Bruh Sound #2", plays: 348, key: "1", freq: 180 },
	{ id: "top-2", name: "My Pew Pew Take", plays: 284, key: "1 (P2)", freq: 620 },
	{ id: "top-3", name: "Airhorn MLG", plays: 219, key: "2", freq: 520 },
	{ id: "top-4", name: "Emotional Damage", plays: 195, key: "6", freq: 440 },
	{ id: "top-5", name: "Vine Boom", plays: 172, key: "9", freq: 90 },
];

export function DeckStatsWidget() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
			{/* Metric 1: Live Viewers */}
			<GlassCard glassVariant="subtle" className="p-4 rounded-xl border border-white/10">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">Current Viewers</span>
					<div className="p-1.5 rounded-lg bg-primary/10 text-primary">
						<UsersIcon className="size-4" />
					</div>
				</div>
				<div className="mt-2 flex items-baseline gap-2">
					<span className="text-2xl font-bold tracking-tight text-foreground">4,821</span>
					<span className="text-[11px] font-semibold text-emerald-400 flex items-center">
						<TrendingUpIcon className="size-3 mr-0.5" /> +14%
					</span>
				</div>
				<p className="mt-1 text-[11px] text-muted-foreground">Live across Twitch Panel</p>
			</GlassCard>

			{/* Metric 2: Voices Run by Viewers */}
			<GlassCard glassVariant="subtle" className="p-4 rounded-xl border border-white/10">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">Viewer SFX Fired</span>
					<div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
						<ActivityIcon className="size-4" />
					</div>
				</div>
				<div className="mt-2 flex items-baseline gap-2">
					<span className="text-2xl font-bold tracking-tight text-foreground">1,284</span>
					<span className="text-[11px] font-medium text-purple-400">Today</span>
				</div>
				<p className="mt-1 text-[11px] text-muted-foreground">Governed by 30s cooldowns</p>
			</GlassCard>

			{/* Metric 3: Favorite Viewer's Voice */}
			<GlassCard glassVariant="subtle" className="p-4 rounded-xl border border-white/10">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">Top Viewer Voice</span>
					<div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
						<HeartIcon className="size-4" />
					</div>
				</div>
				<div className="mt-2 flex items-baseline gap-2 truncate">
					<span className="text-lg font-bold tracking-tight text-foreground truncate">Airhorn MLG</span>
					<span className="text-[11px] font-semibold text-rose-400">38%</span>
				</div>
				<p className="mt-1 text-[11px] text-muted-foreground">488 requests this session</p>
			</GlassCard>
		</div>
	);
}

export function DeckRecentActivityWidget() {
	return (
		<GlassCard glassVariant="subtle" className="p-4 rounded-2xl border border-white/10 flex flex-col h-full">
			<div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
				<div className="flex items-center gap-2">
					<ClockIcon className="size-4 text-primary" />
					<h3 className="text-sm font-semibold text-foreground">Most Recent User Activity</h3>
				</div>
				<span className="text-[11px] text-muted-foreground font-mono">Live Stream</span>
			</div>

			<div className="flex flex-col gap-2.5 overflow-y-auto max-h-[220px] pr-1">
				{RECENT_ACTIVITIES.map((act) => (
					<div
						key={act.id}
						className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-colors"
					>
						<div className="flex items-center gap-2.5">
							<div className={`size-7 rounded-full ${act.color} text-white flex items-center justify-center font-bold text-[10px] shadow`}>
								{act.avatar}
							</div>
							<div>
								<div className="flex items-center gap-1.5">
									<span className="text-xs font-semibold text-foreground">{act.user}</span>
									<span className="rounded bg-muted px-1.5 py-0.2 text-[9px] text-muted-foreground font-medium">
										{act.badge}
									</span>
								</div>
								<p className="text-[11px] text-primary font-medium flex items-center gap-1">
									<Volume2Icon className="size-3" />
									{act.sound}
								</p>
							</div>
						</div>
						<span className="text-[10px] text-muted-foreground whitespace-nowrap">{act.time}</span>
					</div>
				))}
			</div>
		</GlassCard>
	);
}

export function DeckTopSfxWidget() {
	return (
		<GlassCard glassVariant="subtle" className="p-4 rounded-2xl border border-white/10 flex flex-col h-full">
			<div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
				<div className="flex items-center gap-2">
					<SparklesIcon className="size-4 text-purple-400" />
					<h3 className="text-sm font-semibold text-foreground">Most Played SFX by Streamer</h3>
				</div>
				<span className="text-[11px] text-muted-foreground">Top 5</span>
			</div>

			<div className="flex flex-col gap-2">
				{TOP_STREAMER_SFX.map((sfx, idx) => (
					<div
						key={sfx.id}
						onClick={() => playSyntheticSfx(sfx.freq, "sawtooth", 0.3)}
						className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 transition-all cursor-pointer group"
					>
						<div className="flex items-center gap-2.5">
							<span className="font-mono text-xs font-bold text-muted-foreground w-4">#{idx + 1}</span>
							<div>
								<p className="text-xs font-semibold text-foreground group-hover:text-purple-300 transition-colors">
									{sfx.name}
								</p>
								<span className="text-[10px] text-muted-foreground">Shortcut [{sfx.key}]</span>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-xs font-mono font-medium text-foreground/80">{sfx.plays} plays</span>
							<div className="size-6 rounded-full bg-white/10 group-hover:bg-purple-500 text-white flex items-center justify-center transition-colors">
								<Volume2Icon className="size-3" />
							</div>
						</div>
					</div>
				))}
			</div>
		</GlassCard>
	);
}

