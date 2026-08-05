import { Table } from "@/components/ui/Table/Table";
import { Select } from "antd";
import Image from "next/image";
import React from "react";
import { IoSearch } from "react-icons/io5";
import { TfiReload } from "react-icons/tfi";

interface SellerData {
	id: number;
	sellerName: string;
	sellerImage: string;
	email: string;
	contact: string;
	store: string;
	registeredDate: string;
	TotalProduct: number;
}

// Sample data array with the correct type applied
const sampleData: SellerData[] = [
	{
		id: 1,
		sellerName: "John Doe",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "john.doe@example.com",
		contact: "+1234567890",
		store: "Doe's Electronics",
		registeredDate: "2023-01-15",
		TotalProduct: 50,
	},
	{
		id: 2,
		sellerName: "Jane Smith",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "jane.smith@example.com",
		contact: "+1987654321",
		store: "Smith's Boutique",
		registeredDate: "2023-03-10",
		TotalProduct: 120,
	},
	{
		id: 3,
		sellerName: "Mark Johnson",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "mark.johnson@example.com",
		contact: "+1122334455",
		store: "Mark's Gadgets",
		registeredDate: "2023-05-22",
		TotalProduct: 75,
	},
	{
		id: 4,
		sellerName: "Emily Davis",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "emily.davis@example.com",
		contact: "+1678901234",
		store: "Davis Decor",
		registeredDate: "2022-08-11",
		TotalProduct: 200,
	},
	{
		id: 5,
		sellerName: "David Brown",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "david.brown@example.com",
		contact: "+1998765432",
		store: "Brown's Furniture",
		registeredDate: "2023-04-29",
		TotalProduct: 30,
	},
	{
		id: 6,
		sellerName: "Sophia Wilson",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "sophia.wilson@example.com",
		contact: "+1230987654",
		store: "Sophia's Artifacts",
		registeredDate: "2023-06-15",
		TotalProduct: 45,
	},
	{
		id: 7,
		sellerName: "Christopher Lee",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "christopher.lee@example.com",
		contact: "+1357924680",
		store: "Lee's Sports",
		registeredDate: "2023-07-02",
		TotalProduct: 60,
	},
	{
		id: 8,
		sellerName: "Olivia Martinez",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "olivia.martinez@example.com",
		contact: "+1483692571",
		store: "Olivia's Fashion",
		registeredDate: "2023-02-05",
		TotalProduct: 110,
	},
	{
		id: 9,
		sellerName: "Mason Clark",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "mason.clark@example.com",
		contact: "+1122334455",
		store: "Clark's Kitchen",
		registeredDate: "2023-03-18",
		TotalProduct: 85,
	},
	{
		id: 10,
		sellerName: "Isabella Taylor",
		sellerImage:
			"https://images.unsplash.com/photo-1669475576662-af6f022dad1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHByb2ZpbGUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		email: "isabella.taylor@example.com",
		contact: "+1236472589",
		store: "Isabella's Jewelry",
		registeredDate: "2023-01-25",
		TotalProduct: 40,
	},
];

const DeactivateExporter = () => {
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
			header: "Email",
			accessor: "email",
			className: "px-12",
		},
		{
			header: "Contact",
			accessor: "contact",
			className: "px-12",
		},
		{
			header: "Store",
			accessor: "store",
			className: "px-12",
		},
		{
			header: "Registered Date",
			accessor: "registeredDate",
			className: "px-12",
		},
		{
			header: "Total product",
			accessor: "TotalProduct",
			className: "px-12",
		},
		{
			header: "Action",
			accessor: "action",
			className: "px-2",
			render: (row: SellerData) => (
				<div className="flex items-center space-x-2">
					<button
						className="inline-flex items-center gap-[6.564px] bg-[#FFCC92] h-[32px] px-[9.846px] py-[4.923px] rounded-[6.564px] flex-shrink-0"
						onClick={() => handleViewDetails(row)}
					>
						Deactivated
					</button>
				</div>
			),
		},
	];
	const handleViewDetails = (row: SellerData) => console.log("hellrow", row.id);
	return (
		<div className="w-full mt-8 bg-white rounded-[12px]  p-7">
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
	);
};

export default DeactivateExporter;
