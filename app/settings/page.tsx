import { AppShell } from "@/components/app-shell";
import { EmptyPagePlaceholder } from "@/components/empty-page-placeholder";
import { SettingsIcon } from "lucide-react";

export default function SettingsPage() {
	return (
		<AppShell pathname="/settings">
			<EmptyPagePlaceholder
				title="Settings"
				description="Channel profile, audio input/output devices, audio limiter/normalizer, and account preferences."
				icon={<SettingsIcon className="size-5" />}
				badge="Preferences"
			/>
		</AppShell>
	);
}

