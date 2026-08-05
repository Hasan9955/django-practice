/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DatePicker } from "antd";
import { useEffect, useState } from "react";
// import { Invoice } from "./InvoiceBilling";
import { usePathname } from "next/navigation";
import { Table } from "@/components/ui/Table/Table";
import { FaFileInvoiceDollar } from "react-icons/fa";
const { RangePicker } = DatePicker;
const invoiceBillingData: any[] = [];
const CustomerInvoce = () => {
	const [invoces, setInvocesList] = useState<any[]>();
	const pathname = usePathname();
	const segments = pathname.split("/");
	const id = segments[segments.length - 1];

	const invoce = invoiceBillingData.find((item: { id: string; }) => item.id === id);

	useEffect(() => {
		if (invoce) {
			setInvocesList(invoce?.invoice);
		}
	}, [invoce]);

	const columns = [
		{
			header: "Transaction Date",
			accessor: "transactionDate",
			className: "pl-4 pr-12",
		},
		{
			header: "Transaction ID",
			accessor: "transactionID",
			className: "px-12",
		},
		{
			header: "Payment Method",
			accessor: "paymentMethod",
			className: "px-12",
		},
		{
			header: "Amount Paid",
			accessor: "amountPaid",
			className: "px-12",
		},
		{
			header: "Platform fee ",
			accessor: "platformFee",
			className: "px-12",
		},
		{
			header: "Platform fee",
			accessor: "delete",
			className: "px-2",
			render: (row: any) => (
				<div
					onClick={() => handleViewDetails(row)}
					className=" hover:opacity-90 cursor-pointer"
				>
					<FaFileInvoiceDollar />
				</div>
			),
		},
	];

	const handleViewDetails = (row: any) => {
		return console.log(row.id);
	};
	return (
		<div className="flex flex-col justify-between min-h-[88vh]">
			<div>
				<div className="flex justify-between items-start">
					<div>
						<h2 className="text-black font-sans text-2xl font-bold leading-normal">
							D.G.D collage
						</h2>
						<p className="text-black font-sans text-base font-semibold leading-normal">
							All product List
						</p>
					</div>
					<div className="flex gap-4">
						<RangePicker className="border-[#656562] border-[1px] h-[48px] " />
					</div>
				</div>
				<div className="mt-8">
					<Table columns={columns} data={invoces || []} />
				</div>
			</div>
		</div>
	);
};

export default CustomerInvoce;
