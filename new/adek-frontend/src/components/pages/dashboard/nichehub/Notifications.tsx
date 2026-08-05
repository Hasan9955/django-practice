import React from "react";
import Image from "next/image";
import bannerimg from "@/assets/images/hub/Notificationsbanners.png";

import type { StaticImageData } from "next/image";

interface NotificationItem {
	id: number;
	message: string;
	tag: string;
	isBold?: boolean;
	imageUrl?: string | StaticImageData;
	type: "order" | "question";
}

interface NotificationGroup {
	id: number;
	title: string;
	items: NotificationItem[];
}

const Notifications = () => {
	// Sample data with images
	const notificationGroups: NotificationGroup[] = [
		{
			id: 1,
			title: "Today",
			items: [
				{
					id: 1,
					message: '1 more order placed Apple series 14" Indian variant',
					tag: "Mor 2",
					imageUrl: bannerimg,
					type: "order",
				},
				{
					id: 2,
					message:
						"8 new questions about Business Strategy, UX, Management, and Ruby on Rails",
					tag: "Mor 2",
					imageUrl: bannerimg,
					type: "question",
				},
			],
		},
		{
			id: 2,
			title: "Yesterday",
			items: [
				{
					id: 3,
					message: '1 more order placed Apple series 14" Indian variant',
					tag: "Mor 2",
					isBold: true,
					imageUrl: bannerimg,
					type: "order",
				},
				{
					id: 4,
					message:
						"8 new questions about Business Strategy, UX, Management, and Ruby on Rails",
					tag: "Mor 2",
					isBold: true,
					imageUrl: bannerimg,
					type: "question",
				},
			],
		},
		{
			id: 3,
			title: "This Week",
			items: [
				{
					id: 5,
					message: "3 orders placed for Apple Watch Series 9",
					tag: "Mor 1",
					imageUrl: bannerimg,
					type: "order",
				},
				{
					id: 6,
					message: "12 new questions about Product Design and Development",
					tag: "Mor 3",
					imageUrl: bannerimg,
					type: "question",
				},
				{
					id: 7,
					message: "Payment received for order #45892",
					tag: "Fin",
					imageUrl: bannerimg,
					type: "order",
				},
			],
		},
		{
			id: 4,
			title: "Last Week",
			items: [
				{
					id: 8,
					message: 'I more order placed Apple series 14" Indian variant',
					tag: "Mor 2",
					imageUrl: bannerimg,
					type: "order",
				},
				{
					id: 9,
					message:
						"8 new questions about Business Strategy, UX, Management, and Ruby on Rails",
					tag: "Mor 2",
					imageUrl: bannerimg,
					type: "question",
				},
			],
		},
	];

	return (
		<div className="bg-white rounded-[16px] p-6 mt-6">
			<h3 className="text-[#606060] text-[24px] font-medium">
				All notification
			</h3>
			<div className="">
				{notificationGroups.map((group) => (
					<div key={group.id} className="space-y-5">
						<h2 className="text-ms font-semibold text-[#707680] mt-4">
							{group.title}
						</h2>
						<div className="space-y-5">
							{group.items.map((item) => (
								<NotificationItem key={item.id} item={item} />
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const NotificationItem = ({ item }: { item: NotificationItem }) => {
	return (
		<div className="bg-white flex items-center gap-5 ">
			{/* Image */}
			<div className="flex items-center">
				<Image
					src={item.imageUrl || "/images/default-notification.png"}
					alt={item.type === "order" ? "Product order" : "Questions"}
					width={40}
					height={40}
					className="rounded-md object-contain"
				/>
			</div>

			{/* Content */}
			<div className="flex flex-col gap-2">
				<p
					className={`text-sm ${
						item.isBold ? "font-medium" : "font-normal"
					} text-gray-800`}
				>
					{item.message}
				</p>
				<span
					className={`text-xs ${
						item.isBold ? "font-bold" : "font-normal"
					} text-gray-500 `}
				>
					{item.tag}
				</span>
			</div>
		</div>
	);
};

export default Notifications;
