"use client";
import React, { useState } from "react";
import ShippingBillingAddressForm from "../ShippingBillingAddressForm";
import MessagesPage from "./messages";
import OrdersPage from "./orders";

const B2BMessagesTab = () => {
	const [activeTab, setActiveTab] = useState<
		"Conversation" | "Order" | "Completed"
	>("Conversation");

	const tabs = [
		{
			id: "Conversation" as const,
			label: "Conversation",
			value: 20,
			icon: <MessagesPage />,
		},
		{
			id: "Order" as const,
			label: "Order",
			value: 20,
			icon: <ShippingBillingAddressForm />,
		}
	];

	const renderTabContent = () => {
		switch (activeTab) {
			case "Conversation":
				return <MessagesPage />;
			case "Order":
				return <OrdersPage />;
			default:
				return <MessagesPage />;
		}
	};

	return (
		<div>
			<div>
				<h2 className="text-black font-nun text-[20px] font-semibold ">
					Contact Seller
				</h2>
				<div className="flex items-center justify-stretch gap-6 mt-6 mb-5 ">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							className={`font-nun px-6 py-2.5 inline-block text-base font-medium text-gray-700 rounded-[12px] ${
								activeTab === tab.id
									? "bg-[#007BFF] text-white border border-[#E4E4E4] "
									: "border border-[#E4E4E4] "
							} rounded-md`}
							onClick={() => setActiveTab(tab.id)}
						>
							{tab.label}
						</button>
					))}
				</div>
				<div className="bg-[#D8D8D8] w-full h-[1px] " />
			</div>
			{renderTabContent()}
		</div>
	);
};

export default B2BMessagesTab;
