"use client";

import { useState } from "react";
import ActionButtons from "@/components/ui/OfferButon/action-buttons";

export default function OfferButon() {
	const [items, setItems] = useState([
		{ id: "1", name: "Item 1", visible: true },
		{ id: "2", name: "Item 2", visible: true },
		{ id: "3", name: "Item 3", visible: false },
	]);

	const handleToggleVisibility = (id: string, isVisible: boolean) => {
		setItems(
			items.map((item) =>
				item.id === id ? { ...item, visible: isVisible } : item
			)
		);
		console.log(`Item ${id} visibility changed to: ${isVisible}`);
	};

	const handleDelete = (id: string) => {
		setItems(items.filter((item) => item.id !== id));
		console.log(`Item ${id} deleted`);
	};

	return (
		<div className="w-full max-w-2xl mx-auto p-6 bg-white">
			<h2 className="text-xl font-semibold text-gray-900 mb-6">
				Action Buttons Demo
			</h2>

			<div className="space-y-4">
				{items.map((item) => (
					<div
						key={item.id}
						className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
					>
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-gray-900">
								{item.name}
							</span>
							<span
								className={`text-xs px-2 py-1 rounded-full ${
									item.visible
										? "bg-green-100 text-green-800"
										: "bg-gray-100 text-gray-600"
								}`}
							>
								{item.visible ? "Visible" : "Hidden"}
							</span>
						</div>

						<ActionButtons
							onToggleVisibility={(isVisible) =>
								handleToggleVisibility(item.id, isVisible)
							}
							onDelete={() => handleDelete(item.id)}
							initialVisibility={item.visible}
						/>
					</div>
				))}

				{items.length === 0 && (
					<div className="text-center py-8 text-gray-500">
						No items remaining
					</div>
				)}
			</div>
		</div>
	);
}
