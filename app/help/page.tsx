import { AppShell } from "@/components/app-shell";
import { EmptyPagePlaceholder } from "@/components/empty-page-placeholder";
import { HelpCircleIcon } from "lucide-react";

export default function HelpPage() {
	return (
		<AppShell pathname="/help">
			<EmptyPagePlaceholder
				title="Help Center"
				description="Troubleshooting audio sync, latency, Twitch Extension connection issues, and community support."
				icon={<HelpCircleIcon className="size-5" />}
				badge="Support"
			/>
		</AppShell>
	);
}

