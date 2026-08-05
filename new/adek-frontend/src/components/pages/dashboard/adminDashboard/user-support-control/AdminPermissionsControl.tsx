"use client";

import { DeletesIcon } from "@/assets/svgIcon";
import ProfileModal from "@/components/ui/Modal/AddAdminRolesModal";
import { Table } from "@/components/ui/Table/Table";
import Image from "next/image";
import { useState } from "react";
import { GoPlus } from "react-icons/go";

const membersData: Members[] = [
	{
		id: 1,
		name: "Sarah Ahmed",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "sarah.ahmed@example.com",
		phoneNumber: "+8801710000001",
		rule: "Support",
		password: "Sarah@123",
		date: "2025-07-01",
	},
	{
		id: 2,
		name: "Imran Hossain",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "imran.hossain@example.com",
		phoneNumber: "+8801710000002",
		rule: "Finance",
		password: "Imran#456",
		date: "2025-07-02",
	},
	{
		id: 3,
		name: "Nusrat Jahan",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "nusrat.jahan@example.com",
		phoneNumber: "+8801710000003",
		rule: "Support",
		password: "Nusrat@789",
		date: "2025-07-03",
	},
	{
		id: 4,
		name: "Rafiul Islam",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "rafiul.islam@example.com",
		phoneNumber: "+8801710000004",
		rule: "Finance",
		password: "Rafiul@321",
		date: "2025-07-04",
	},
	{
		id: 5,
		name: "Farhana Khan",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "farhana.khan@example.com",
		phoneNumber: "+8801710000005",
		rule: "Support",
		password: "Farhana@pass",
		date: "2025-07-05",
	},
	{
		id: 6,
		name: "Salman Kabir",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "salman.kabir@example.com",
		phoneNumber: "+8801710000006",
		rule: "Finance",
		password: "Kabir$456",
		date: "2025-07-06",
	},
	{
		id: 7,
		name: "Tania Rahman",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "tania.rahman@example.com",
		phoneNumber: "+8801710000007",
		rule: "Support",
		password: "Tania@007",
		date: "2025-07-07",
	},
	{
		id: 8,
		name: "Mahmud Hasan",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "mahmud.hasan@example.com",
		phoneNumber: "+8801710000008",
		rule: "Finance",
		password: "Hasan!852",
		date: "2025-07-08",
	},
	{
		id: 9,
		name: "Lubna Chowdhury",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "lubna.chowdhury@example.com",
		phoneNumber: "+8801710000009",
		rule: "Support",
		password: "Lubna*369",
		date: "2025-07-09",
	},
	{
		id: 10,
		name: "Jubayer Alam",
		image:
			"https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		email: "jubayer.alam@example.com",
		phoneNumber: "+8801710000010",
		rule: "Finance",
		password: "Jubayer@1010",
		date: "2025-07-10",
	},
];

export type Members = {
	id: number;
	name: string;
	image: string;
	email: string;
	phoneNumber: string;
	rule: "Support" | "Finance";
	password: string;
	date: string;
};

const AdminPermissionsControl = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	const handleSuccess = (data: unknown) => {
		console.log("Profile data received:", data);
	};

	const columns = [
		{
			header: "Name",
			accessor: "name",
			className: "pl-4 pr-12",
			render: (row: Members) => {
				const sellerImageUrl = row?.image;
				const sellerName = row?.name;
				return (
					<div className="flex items-center">
						<Image
							src={sellerImageUrl || "/placeholder.svg"}
							alt={sellerName}
							width={100}
							height={100}
							className="w-10 h-10 object-cover object-center rounded-full mr-4"
						/>
						<span>{sellerName}</span>
					</div>
				);
			},
		},
		{
			header: "Email",
			accessor: "email",
			className: "px-12",
		},
		{
			header: "Phone number",
			accessor: "phoneNumber",
			className: "px-12",
		},
		{
			header: "Rule",
			accessor: "totalSell",
			className: "px-12",
			render: (row: Members) => {
				const departmentColors: Record<string, string> = {
					Finance: "bg-[#FF914D]",
					Marketing: "bg-[#2196F3]",
					Engineering: "bg-[#9C27B0]",
					Sales: "bg-[#FF9800]",
					Hr: "bg-[#E91E63]",
					Support: "bg-[#159938]",
				};
				const colorClass = departmentColors[row.rule] || "bg-[#159938]"; // fallback color

				return (
					<button
						className={`inline-flex px-3 py-2 justify-center items-center gap-2 rounded-[4px] text-white text-center font-inter text-base font-normal leading-normal ${colorClass}`}
					>
						{row.rule}
					</button>
				);
			},
		},
		{
			header: "Password",
			accessor: "password",
			className: "px-12",
		},
		{
			header: "Date",
			accessor: "date",
			className: "px-12",
		},
		{
			header: "Action",
			accessor: "action",
			className: "px-2",
			render: (row: Members) => (
				<div className="flex items-center space-x-2">
					<button
						className="inline-flex p-2 items-center gap-[10px] rounded border cursor-pointer hover:bg-green-100 /10 border-[#C2C2C2]"
						onClick={() => handleViewDetails(row)}
					>
						<DeletesIcon />
					</button>
				</div>
			),
		},
	];

	const handleViewDetails = (row: Members) => {
		console.log("Clicked", row.id);
	};

	return (
		<div className="w-full">
			<div className="flex items-start justify-between">
				<h5 className="text-[#2A2A2A] text-[16px] font-medium font-sans">
					Members
				</h5>
				<div className="flex gap-2">
					<button
						onClick={handleOpenModal}
						className="flex hover:bg-blue-primary/90 cursor-pointer items-center gap-2 px-3 py-2 text-white text-base font-medium font-nun rounded-[12px] bg-[#007BFF]"
					>
						<GoPlus className="text-md" />
						Add new rule
					</button>
				</div>
			</div>
			<div className="mt-5">
				<Table columns={columns} data={membersData} />
			</div>

			{/* Updated to use ProfileModal */}
			<ProfileModal
				open={isModalOpen}
				onClose={handleCloseModal}
				onSuccess={handleSuccess}
			/>
		</div>
	);
};

export default AdminPermissionsControl;
