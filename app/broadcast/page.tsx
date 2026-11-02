import { AppShell } from "@/components/app-shell";
import { EmptyPagePlaceholder } from "@/components/empty-page-placeholder";
import { RadioIcon } from "lucide-react";

export default function BroadcastPage() {
	return (
		<AppShell pathname="/broadcast">
			<EmptyPagePlaceholder
				title="OBS & Broadcast"
				description="Manage OBS Browser Source audio URL, test stream playback, and customize the on-stream alert HUD."
				icon={<RadioIcon className="size-5" />}
				badge="Audio Source"
			/>
		</AppShell>
	);
}

