"use client";

import { useState } from "react";

interface StepIndicatorProps {
	steps: number;
	currentStep?: number;
	onStepChange?: (step: number) => void;
}

export default function StepIndicator({
	steps = 5,
	currentStep = 1,
	onStepChange,
}: StepIndicatorProps) {
	const [activeStep, setActiveStep] = useState(currentStep);

	const handleStepClick = (step: number) => {
		setActiveStep(step);
		if (onStepChange) {
			onStepChange(step);
		}
	};

	return (
		<div className="flex items-center flex-wrap gap-5  max-lg:justify-center w-full max-w-3xl max-lg:mx-auto py-1 sm:py-6">
			{Array.from({ length: steps }).map((_, index) => {
				const stepNumber = index + 1;
				const isActive = stepNumber === activeStep;
				const isLast = stepNumber === steps;

				return (
					<div key={stepNumber} className="flex items-center">
						{/* Step circle */}
						<button
							onClick={() => handleStepClick(stepNumber)}
							className={`flex items-center justify-center sm:w-8 sm:h-8 h-4 w-4 rounded-full text-[10px] sm:text-sm font-medium transition-colors ${
								isActive
									? "bg-blue-500 text-white"
									: "bg-gray-200 text-gray-600 hover:bg-gray-300"
							}`}
							aria-current={isActive ? "step" : undefined}
						>
							{stepNumber}
						</button>

						{/* Arrow and dashed line (only if not the last step) */}
						{!isLast && (
							<div className="flex items-center">
								{/* Arrow */}
								<div className="ml-1">
									<svg
										className="sm:w-4 w-2 h-2   sm:h-4 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</div>

								{/* Dashed line */}
								<div className="w-16 h-px border-t border-dashed border-gray-300 mx-1"></div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
