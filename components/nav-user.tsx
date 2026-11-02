"use client";

import { useState, useEffect } from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon, SettingsIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

export function NavUser() {
	const router = useRouter();
	const [user, setUser] = useState({
		name: "EchoDeck Streamer",
		email: "streamer@twitch.tv",
	});

	useEffect(() => {
		function syncUser() {
			const stored = localStorage.getItem("echodeck_user");
			if (stored) {
				const rawName = stored.includes("@") ? stored.split("@")[0] : stored;
				const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
				setUser({
					name: formattedName,
					email: stored.includes("@") ? stored : `${stored}@twitch.tv`,
				});
			}
		}
		syncUser();
		window.addEventListener("storage", syncUser);
		return () => window.removeEventListener("storage", syncUser);
	}, []);

	const initials = getInitials(user.name);
	const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=7c3aed,4f46e5,059669,d97706,dc2626`;

	function handleLogout() {
		if (typeof window !== "undefined") {
			localStorage.removeItem("echodeck_user");
			window.dispatchEvent(new Event("storage"));
		}
		router.push("/landing");
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Avatar className="size-8 cursor-pointer bg-primary/10" />}>
				<AvatarImage src={avatarUrl} alt={user.name} />
				<AvatarFallback className="font-semibold text-xs bg-primary/20 text-primary">
					{initials}
				</AvatarFallback>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="pointer-events-none flex items-center gap-2">
						<Avatar className="isolate size-8 bg-primary/10">
							<AvatarImage src={avatarUrl} alt={user.name} />
							<AvatarFallback className="font-semibold text-xs bg-primary/20 text-primary">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div>
							<span className="font-medium text-foreground">{user.name}</span>
							<br />
							<div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs">
								{user.email}
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<UserIcon />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<SettingsIcon />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<CreditCardIcon />
						Plan & Billing
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem variant="destructive" onClick={handleLogout}>
						<LogOutIcon />
						Log out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
