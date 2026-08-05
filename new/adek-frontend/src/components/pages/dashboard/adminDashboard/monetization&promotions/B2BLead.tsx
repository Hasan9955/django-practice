import { Profileb2bIcon } from "@/assets/svgIcon";
import SellerCard from "@/components/ui/Card/B2BCard";
import { Table } from "@/components/ui/Table/Table";
import { Select } from "antd";
import Image from "next/image";
import React from "react";
import { IoSearch } from "react-icons/io5";
import { TfiReload } from "react-icons/tfi";
const sellerData = [
	{
		title: "Total Sellers",
		totalSellers: 500,
		subbgicon: "bg-[#E8E8E8]", // Custom background for outer icon
		bgicon: "bg-yellow-500", // Custom background for inner icon
		icon: Profileb2bIcon, // Icon component for each card
	},
	{
		title: "Active Sellers",
		totalSellers: 450,
		subbgicon: "bg-[#FFF5E6]",
		bgicon: "bg-[#5D3A01]",
		icon: Profileb2bIcon,
	},
	{
		title: "Inactive Sellers",
		totalSellers: 50,
		subbgicon: "bg-[#E8E8E8]",
		bgicon: "bg-[#1C1C1C]",
		icon: Profileb2bIcon,
	},
	{
		title: "Pending Sellers",
		totalSellers: 25,
		subbgicon: "bg-[#E8E8E8]",
		bgicon: "bg-purple-500",
		icon: Profileb2bIcon,
	},
];

interface SellerData {
	id: number;
	sellerName: string;
	sellerImage: string;
	items: string;
	importerName: string;
	importerImage: string;
	amount: number;
	contractData: string;
	price: number;
}

// Sample data array with the correct type applied
const sampleData: SellerData[] = [
	{
		id: 1,
		sellerName: "John Doe",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item1",
		importerName: "Alice Johnson",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 100,
		contractData: "Contract #12345",
		price: 150,
	},
	{
		id: 2,
		sellerName: "Jane Smith",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item2",
		importerName: "Bob Williams",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 150,
		contractData: "Contract #12346",
		price: 200,
	},
	{
		id: 3,
		sellerName: "Mark Johnson",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item3",
		importerName: "Carol Davis",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 200,
		contractData: "Contract #12347",
		price: 180,
	},
	{
		id: 4,
		sellerName: "Emily Davis",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item4",
		importerName: "David Brown",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 80,
		contractData: "Contract #12348",
		price: 170,
	},
	{
		id: 5,
		sellerName: "David Brown",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item5",
		importerName: "Sophia Wilson",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 50,
		contractData: "Contract #12349",
		price: 210,
	},
	{
		id: 6,
		sellerName: "Sophia Wilson",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item6",
		importerName: "James Lee",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 120,
		contractData: "Contract #12350",
		price: 190,
	},
	{
		id: 7,
		sellerName: "Christopher Lee",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item7",
		importerName: "Olivia Martinez",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 160,
		contractData: "Contract #12351",
		price: 230,
	},
	{
		id: 8,
		sellerName: "Olivia Martinez",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item8",
		importerName: "Ethan Harris",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 140,
		contractData: "Contract #12352",
		price: 250,
	},
	{
		id: 9,
		sellerName: "Mason Clark",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item9",
		importerName: "Isabella Taylor",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 110,
		contractData: "Contract #12353",
		price: 160,
	},
	{
		id: 10,
		sellerName: "Isabella Taylor",
		sellerImage:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww",
		items: "Item10",
		importerName: "William Martin",
		importerImage:
			"https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		amount: 90,
		contractData: "Contract #12354",
		price: 210,
	},
];
const B2BLead = () => {
	const onChange = (value: string) => {
		console.log(`selected ${value}`);
	};

	const onSearch = (value: string) => {
		console.log("search:", value);
	};

	const columns = [
		{
			header: "Seller",
			accessor: "seller",
			className: "pl-4 pr-12",
			render: (row: SellerData) => {
				const sellerImageUrl = row?.sellerImage;
				const sellerName = row?.sellerName;
				return (
					<div className="flex items-center">
						<Image
							src={sellerImageUrl}
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
			header: "Items",
			accessor: "items",
			className: "px-12",
		},
		{
			header: "Importer",
			accessor: "importer",
			className: "pl-4 pr-12",
			render: (row: SellerData) => {
				const sellerImageUrl = row?.sellerImage;
				const sellerName = row?.sellerName;
				return (
					<div className="flex items-center">
						<Image
							src={sellerImageUrl}
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
			header: "Amount",
			accessor: "amount",
			className: "px-12",
		},
		{
			header: "Cotract date",
			accessor: "cotractDate",
			className: "px-12",
		},
		{
			header: "Price",
			accessor: "price",
			className: "px-12",
		},
		{
			header: "Action",
			accessor: "action",
			className: "px-2",
			render: (row: SellerData) => (
				<div className="flex items-center space-x-2">
					<button
						className="rounded-[8px] bg-black/20 cursor-pointer hover:bg-black/10 inline-block px-2 py-1  text-black font-inter text-base"
						onClick={() => handleViewDetails(row)}
					>
						View
					</button>
				</div>
			),
		},
	];
	const handleViewDetails = (row: SellerData) => console.log("hellrow", row.id);
	return (
		<div className="bg-white rounded-[16px] flex flex-col mt-6 p-6">
			<div className="flex items-center justify-between w-full gap-6">
				{sellerData.map((card, index) => (
					<SellerCard
						key={index}
						title={card.title}
						totalSellers={card.totalSellers}
						icon={card.icon}
						subbgicon={card.subbgicon}
						bgicon={card.bgicon}
					/>
				))}
			</div>
			<div className="w-full mt-8">
				<div className="flex items-center  justify-between">
					<h4 className="text-[#252C32] font-inter text-xl font-medium">
						All B2B lead
					</h4>
					<div className="flex items-center  gap-3">
						<IoSearch className="tex-xl text-[#48535B]" />
						<TfiReload className="tex-xl text-[#48535B]" />
						<div className="bg-[#D0D5DD] h-8 w-[1px]"></div>
						<Select
							showSearch
							placeholder="Select a month"
							optionFilterProp="label"
							onChange={onChange}
							onSearch={onSearch}
							options={[
								{
									value: "january",
									label: "January",
								},
								{
									value: "february",
									label: "February",
								},
								{
									value: "march",
									label: "March",
								},
								{
									value: "april",
									label: "April",
								},
								{
									value: "may",
									label: "May",
								},
								{
									value: "june",
									label: "June",
								},
								{
									value: "july",
									label: "July",
								},
								{
									value: "august",
									label: "August",
								},
								{
									value: "september",
									label: "September",
								},
								{
									value: "october",
									label: "October",
								},
								{
									value: "november",
									label: "November",
								},
								{
									value: "december",
									label: "December",
								},
							]}
						/>
					</div>
				</div>
				<div className="mt-5">
					<Table columns={columns} data={sampleData} />
				</div>
			</div>
		</div>
	);
};

export default B2BLead;
