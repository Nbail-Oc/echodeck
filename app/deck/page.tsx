import { AppShell } from "@/components/app-shell";
import { DeckSoundboard } from "@/components/deck/deck-soundboard";

export default function DeckPage() {
	return (
		<AppShell pathname="/deck">
			<div className="flex flex-1 flex-col items-center justify-center w-full py-2">
				<DeckSoundboard />
			</div>
		</AppShell>
	);
}
