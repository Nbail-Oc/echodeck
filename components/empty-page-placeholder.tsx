import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyPagePlaceholder({
	title,
	description,
	icon,
	badge,
	children,
}: {
	title: string;
	description: string;
	icon?: ReactNode;
	badge?: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					{icon && (
						<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
							{icon}
						</div>
					)}
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
								{title}
							</h1>
							{badge && (
								<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
									{badge}
								</span>
							)}
						</div>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
				</div>
			</div>

			{children ? (
				children
			) : (
				<Card className="border-dashed border-2 bg-muted/20">
					<CardContent className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
						<div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
							{icon}
						</div>
						<h3 className="text-base font-semibold text-foreground">{title} view</h3>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							{description}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

