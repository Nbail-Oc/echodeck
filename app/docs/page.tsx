import { AppShell } from "@/components/app-shell";
import { EmptyPagePlaceholder } from "@/components/empty-page-placeholder";
import { BookOpenIcon } from "lucide-react";

export default function DocsPage() {
	return (
		<AppShell pathname="/docs">
			<EmptyPagePlaceholder
				title="Documentation"
				description="Complete setup guides for Twitch Panel Extension, OBS Studio Browser Source, and hotkey configuration."
				icon={<BookOpenIcon className="size-5" />}
				badge="Guides & API"
			/>
		</AppShell>
	);
}

