"use client";

import type React from "react";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleFAQProps {
	question: string;
	answer: React.ReactNode;
}

export default function CollapsibleFAQ({
	question,
	answer,
}: CollapsibleFAQProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className=" ">
			<button
				className="flex justify-between items-center w-full text-left"
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
			>
				<h3 className="sm:text-lg text-base font-medium text-gray-800">
					{question}
				</h3>
				<span className="ml-6 flex-shrink-0 text-gray-500">
					{isOpen ? (
						<ChevronUp className="h-5 w-5" />
					) : (
						<ChevronDown className="h-5 w-5" />
					)}
				</span>
			</button>

			<div
				className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
					isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className=" text-gray-600">{answer}</div>
			</div>
		</div>
	);
}
