import type { LucideIcon } from "lucide-react";

export interface ProgressStep {
	id: string;
	title: string;
	status: string;
	statusColor: string;
	icon: LucideIcon;
	completed: boolean;
}

export interface ProgressTrackerProps {
	steps: ProgressStep[];
}
