import { AppShell } from "@/components/app-shell";
import { EmptyPagePlaceholder } from "@/components/empty-page-placeholder";
import { SlidersIcon } from "lucide-react";

export default function StreamDeckPage() {
	return (
		<AppShell pathname="/stream-deck">
			<EmptyPagePlaceholder
				title="Stream Deck & Keypad"
				description="Configure Elgato Stream Deck integration, download profile presets, and map 10-key buzzer hotkeys."
				icon={<SlidersIcon className="size-5" />}
				badge="Hardware Matrix"
			/>
		</AppShell>
	);
}

