"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import TwitchPanelExtension from "@/app/extension/panel/page";
import {
	RadioIcon,
	ExternalLinkIcon,
	SparklesIcon,
	ShieldCheckIcon,
	ClockIcon,
	SettingsIcon,
	LaptopIcon,
	CopyIcon,
	CheckIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AudiencePage() {
	const [copiedUrl, setCopiedUrl] = useState(false);
	const [viewerTier, setViewerTier] = useState<"everyone" | "followers" | "subscribers">("everyone");
	const [cooldownSeconds, setCooldownSeconds] = useState(10);
	const [channelLimit, setChannelLimit] = useState(2);

	const handleCopyUrl = () => {
		if (typeof window !== "undefined") {
			navigator.clipboard.writeText(`${window.location.origin}/extension/panel`);
			setCopiedUrl(true);
			setTimeout(() => setCopiedUrl(false), 2000);
		}
	};

	return (
		<AppShell pathname="/audience">
			<div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-2">
				{/* Header */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
					<div>
						<div className="flex items-center gap-2.5">
							<div className="flex size-9 items-center justify-center rounded-xl bg-[#9146FF]/20 text-[#bf94ff] border border-[#9146FF]/40">
								<RadioIcon className="size-5" />
							</div>
							<h1 className="text-2xl font-bold tracking-tight text-zinc-100">
								Twitch Viewer Extension
							</h1>
						</div>
						<p className="text-xs sm:text-sm text-zinc-400 mt-1">
							Live interactive Twitch Panel Extension simulator (standard 318px iframe). Test your sound boxes, audience permissions, and viewer triggers.
						</p>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={handleCopyUrl}
							type="button"
							className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
						>
							{copiedUrl ? <CheckIcon className="size-3.5 text-emerald-400" /> : <CopyIcon className="size-3.5" />}
							{copiedUrl ? "Copied Panel URL" : "Copy Extension URL"}
						</button>
						<a
							href="/extension/panel"
							target="_blank"
							rel="noreferrer"
							className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
						>
							<ExternalLinkIcon className="size-3.5" />
							Open Standalone Panel
						</a>
					</div>
				</div>

				{/* Two-Column Layout: Controls & Documentation on Left, Live Simulator on Right */}
				<div className="flex flex-col lg:flex-row gap-8 items-start w-full">
					{/* Left: Extension Architecture & Configuration */}
					<div className="flex-1 flex flex-col gap-6 w-full">
						{/* How It Works Card */}
						<div className="rounded-[28px] bg-[#141416] p-6 sm:p-7 border border-zinc-800 shadow-xl flex flex-col gap-4">
							<h3 className="text-base font-bold text-white flex items-center gap-2">
								<SparklesIcon className="size-4 text-[#bf94ff]" />
								How Twitch Panel Extensions Work
							</h3>
							<p className="text-xs text-zinc-300 leading-relaxed">
								Twitch loads your extension inside a sandboxed <strong>318px wide iframe</strong> directly under your video player on your channel page.
							</p>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
								<div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1.5">
									<div className="flex items-center gap-2 text-xs font-bold text-white">
										<LaptopIcon className="size-4 text-[#9146FF]" />
										Standard Panel Format
									</div>
									<p className="text-[11px] text-zinc-400 leading-tight">
										Exact width of <strong>318px</strong>. Designed for responsive touch and mouse buzzer taps.
									</p>
								</div>

								<div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1.5">
									<div className="flex items-center gap-2 text-xs font-bold text-white">
										<ShieldCheckIcon className="size-4 text-emerald-400" />
										Twitch Extension Helper
									</div>
									<p className="text-[11px] text-zinc-400 leading-tight">
										Loads <code className="text-[#bf94ff]">twitch-ext.min.js</code> for secure channel & viewer authentication.
									</p>
								</div>
							</div>
						</div>

						{/* Rate Limits & Access Rules */}
						<div className="rounded-[28px] bg-[#141416] p-6 sm:p-7 border border-zinc-800 shadow-xl flex flex-col gap-5">
							<h3 className="text-base font-bold text-white flex items-center gap-2">
								<SettingsIcon className="size-4 text-zinc-400" />
								Audience Access & Rate Limits
							</h3>

							{/* Viewer Tier Selection */}
							<div className="flex flex-col gap-2">
								<label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
									Viewer Access Tier
								</label>
								<div className="grid grid-cols-3 gap-2">
									{[
										{ id: "everyone", label: "Everyone (Free)" },
										{ id: "followers", label: "Followers Only" },
										{ id: "subscribers", label: "Subscribers Only" },
									].map((tier) => (
										<button
											key={tier.id}
											onClick={() => setViewerTier(tier.id as any)}
											type="button"
											className={cn(
												"py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center",
												viewerTier === tier.id
													? "bg-[#9146FF] text-white border-[#9146FF] shadow-md shadow-[#9146FF]/30"
													: "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
											)}
										>
											{tier.label}
										</button>
									))}
								</div>
							</div>

							{/* Cooldown Settings */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
										<span>Per-Viewer Cooldown</span>
										<span className="font-mono text-[#bf94ff]">{cooldownSeconds}s</span>
									</label>
									<input
										type="range"
										min="2"
										max="60"
										step="1"
										value={cooldownSeconds}
										onChange={(e) => setCooldownSeconds(parseInt(e.target.value, 10))}
										className="accent-[#9146FF] cursor-pointer"
									/>
									<span className="text-[10px] text-zinc-500">Wait time before a viewer can trigger again</span>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
										<span>Channel Burst Limit</span>
										<span className="font-mono text-emerald-400">{channelLimit} sounds / 5s</span>
									</label>
									<input
										type="range"
										min="1"
										max="8"
										step="1"
										value={channelLimit}
										onChange={(e) => setChannelLimit(parseInt(e.target.value, 10))}
										className="accent-emerald-500 cursor-pointer"
									/>
									<span className="text-[10px] text-zinc-500">Prevents chat spam during high-volume raids</span>
								</div>
							</div>
						</div>

						{/* Developer Rig / Twitch Console Setup Card */}
						<div className="rounded-[28px] bg-gradient-to-br from-[#121216] to-[#18181f] p-6 border border-zinc-800/80 shadow-md flex flex-col gap-3">
							<h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
								<ClockIcon className="size-3.5 text-[#bf94ff]" />
								Twitch Developer Console Guide
							</h4>
							<ol className="text-xs text-zinc-400 flex flex-col gap-1.5 pl-4 list-decimal">
								<li>
									Go to the{" "}
									<a
										href="https://dev.twitch.tv/console/extensions"
										target="_blank"
										rel="noreferrer"
										className="text-[#bf94ff] hover:underline"
									>
										Twitch Developer Console
									</a>{" "}
									and click <strong>Create Extension</strong>.
								</li>
								<li>Select <strong>Panel</strong> as the Extension Type.</li>
								<li>Set the local testing URL to <code className="text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded">http://localhost:3000/extension/panel</code>.</li>
								<li>For standalone release, zip <code className="text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded">public/extension/panel.html</code> and upload.</li>
							</ol>
						</div>
					</div>

					{/* Right: Simulated Twitch Channel with the 318px Panel */}
					<div className="w-full lg:w-[360px] flex flex-col items-center shrink-0">
						<div className="w-full rounded-[32px] bg-[#18181b] p-4 border border-[#2e2e35] shadow-2xl flex flex-col items-center gap-3">
							{/* Simulated Twitch Channel Header */}
							<div className="w-full flex items-center justify-between pb-3 border-b border-[#2e2e35] px-1">
								<div className="flex items-center gap-2">
									<div className="size-6 rounded-full bg-[#9146FF] flex items-center justify-center font-bold text-xs text-white">
										T
									</div>
									<span className="text-xs font-bold text-white">twitch.tv/YourChannel</span>
								</div>
								<span className="text-[10px] text-zinc-500 font-mono">318px Panel Frame</span>
							</div>

							{/* The Actual Twitch Panel Extension */}
							<div className="flex justify-center w-full">
								<TwitchPanelExtension />
							</div>

							<p className="text-[10px] text-zinc-500 text-center mt-1">
								Interactive viewer test: Tap <strong>Play</strong> on either sound box to trigger local playback.
							</p>
						</div>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
