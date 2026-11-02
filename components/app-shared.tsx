import type { ReactNode } from "react";
import {
	Volume2Icon,
	MicIcon,
	LibraryIcon,
	StoreIcon,
	SlidersIcon,
	RadioIcon,
	UsersIcon,
	SettingsIcon,
	BookOpenIcon,
	HelpCircleIcon,
} from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label?: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Live Studio",
		items: [
			{
				title: "My Deck",
				path: "/deck",
				icon: <Volume2Icon className="size-4" />,
			},
			{
				title: "Mimic Challenge",
				path: "/mimic",
				icon: <MicIcon className="size-4" />,
			},
			{
				title: "Sound Library",
				path: "/library",
				icon: <LibraryIcon className="size-4" />,
			},
			{
				title: "Marketplace",
				path: "/marketplace",
				icon: <StoreIcon className="size-4" />,
			},
		],
	},
	{
		label: "Hardware & Broadcast",
		items: [
			{
				title: "Stream Deck",
				path: "/stream-deck",
				icon: <SlidersIcon className="size-4" />,
			},
			{
				title: "OBS & Broadcast",
				path: "/broadcast",
				icon: <RadioIcon className="size-4" />,
			},
			{
				title: "Audience & Twitch",
				path: "/audience",
				icon: <UsersIcon className="size-4" />,
			},
		],
	},
	{
		label: "System",
		items: [
			{
				title: "Settings",
				path: "/settings",
				icon: <SettingsIcon className="size-4" />,
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Documentation",
		path: "/docs",
		icon: <BookOpenIcon className="size-4" />,
	},
	{
		title: "Help Center",
		path: "/help",
		icon: <HelpCircleIcon className="size-4" />,
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
