"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, SparklesIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

const latestChange = {
	badge: "CHANGELOG",
	title: "Product update",
	description: "Performance boosts, mimic challenge polish, and sound deck updates.",
	version: "v1.2.0",
	readMore: { href: "/docs", label: "View full release notes" },
} as const;

export function LatestChange() {
	const [hasUnread, setHasUnread] = useState(true);

	return (
		<DropdownMenu
			onOpenChange={(open) => {
				if (open) setHasUnread(false);
			}}
		>
			<DropdownMenuTrigger
				render={
					<Button
						aria-label="Changelog & notifications"
						size="icon-sm"
						variant="outline"
						className="relative cursor-pointer"
					/>
				}
			>
				<BellIcon className="size-4" />
				{hasUnread && (
					<span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80 p-4">
				<div className="flex items-center justify-between pb-2 mb-2 border-b">
					<div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
						<SparklesIcon className="size-3.5 text-primary" />
						<span>What's New</span>
					</div>
					<span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
						{latestChange.version}
					</span>
				</div>
				<div className="flex flex-col gap-1.5">
					<span className="font-mono text-[10px] text-primary font-medium">
						{latestChange.badge}
					</span>
					<p className="font-heading font-medium text-sm text-foreground">
						{latestChange.title}
					</p>
					<p className="text-xs text-muted-foreground leading-relaxed">
						{latestChange.description}
					</p>
					<div className="pt-2">
						<Button
							className="h-auto p-0 text-xs font-medium text-primary hover:underline flex items-center gap-1"
							variant="link"
							render={<Link href={latestChange.readMore.href} />}
							nativeButton={false}
						>
							{latestChange.readMore.label}
							<ExternalLinkIcon className="size-3" />
						</Button>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
