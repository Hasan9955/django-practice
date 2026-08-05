import { ProgressTrackerProps } from "@/types/progress-tracker";
import { Check } from "lucide-react";

export default function ProgressTracker({ steps }: ProgressTrackerProps) {
	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm mx-auto p-6">
			<div className="grid grid-cols-[1fr_auto] gap-4 items-stretch">
				{/* Content Column */}
				<div className="flex flex-col justify-between ">
					{steps.map((step, index) => (
						<div key={step.id}>
							<div className="flex items-center gap-4">
								{/* Dynamically render the icon component */}
								{step.icon && <step.icon className="w-8 h-8 text-gray-700" />}
								<div>
									<div className="font-medium text-gray-800">{step.title}</div>
									<div className={`${step.statusColor} text-sm`}>
										{step.status}
									</div>
								</div>
							</div>
							{/* Add separator between steps, but not after the last one */}
							{index < steps.length - 1 && (
								<hr className="my-4 border-gray-200" />
							)}
						</div>
					))}
				</div>

				{/* Timeline Column */}
				<div className="flex flex-col mt-9 items-center">
					{steps.map((step, index) => (
						<div
							key={`timeline-${step.id}`}
							className="flex flex-col items-center"
						>
							{/* Checkmark for the current step */}
							<div
								className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
									step.completed ? "bg-blue-500" : "bg-gray-300"
								}`}
							>
								<Check className="w-4 h-4" />
							</div>
							{/* Connecting Line (only if not the last step) */}
							{index < steps.length - 1 && (
								<div
									className={`h-8 w-0.5 ${
										step.completed ? "bg-blue-500" : "bg-gray-300"
									}`}
								></div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
