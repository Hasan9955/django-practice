"use client";
import { useRouter } from "next/navigation";

interface ReceiptPageProps {
	transactionId: string;
}

export default function ReceiptPage({ transactionId }: ReceiptPageProps) {
	const router = useRouter();

	// Mock receipt data - in real app, fetch based on transactionId
	const receipt = {
		transactionId: transactionId || "TXN789456",
		date: "12/09/2024",
		customerName: "John Doe",
		customerEmail: "john.doe@email.com",
		paymentMethod: "Credit Card",
		amount: 150,
		description: "Product Purchase - Premium Package",
		status: "Completed",
		receiptNumber: `RCP-${(transactionId || "TXN789456").slice(-6)}`,
		companyName: "Your Company Name",
		companyAddress: "123 Business Street, City, State 12345",
		companyPhone: "+1 (555) 123-4567",
		companyEmail: "contact@yourcompany.com",
	};

	const handlePrint = () => {
		window.print();
	};

	const handleDownload = () => {
		const receiptContent = `
RECEIPT
${receipt.companyName}
${receipt.companyAddress}
Phone: ${receipt.companyPhone}
Email: ${receipt.companyEmail}

Receipt #: ${receipt.receiptNumber}
Transaction ID: ${receipt.transactionId}
Date: ${receipt.date}

Customer Information:
Name: ${receipt.customerName}
Email: ${receipt.customerEmail}

Payment Details:
Description: ${receipt.description}
Payment Method: ${receipt.paymentMethod}
Amount: $${receipt.amount}
Status: ${receipt.status}

Thank you for your business!
    `;

		const blob = new Blob([receiptContent], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `receipt-${receipt.receiptNumber}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="min-h-screen bg-[#F6F6F6] py-8">
			<div className="max-w-4xl mx-auto px-4">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<button
						onClick={() => router.back()}
						className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
					>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path
								d="M12.5 15L7.5 10L12.5 5"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Back to Dashboard
					</button>
					<div className="flex gap-3">
						<button
							onClick={handleDownload}
							className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
						>
							Download
						</button>
						<button
							onClick={handlePrint}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
						>
							Print Receipt
						</button>
					</div>
				</div>

				{/* Receipt */}
				<div
					className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
					id="receipt-content"
				>
					{/* Company Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{receipt.companyName}
						</h1>
						<p className="text-gray-600">{receipt.companyAddress}</p>
						<p className="text-gray-600">
							Phone: {receipt.companyPhone} | Email: {receipt.companyEmail}
						</p>
					</div>

					{/* Receipt Details */}
					<div className="border-t border-b border-gray-200 py-6 mb-6">
						<div className="grid grid-cols-2 gap-6 mb-6">
							<div>
								<p className="text-sm font-medium text-gray-600 mb-1">
									Receipt Number
								</p>
								<p className="text-xl font-semibold text-gray-900">
									{receipt.receiptNumber}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-600 mb-1">
									Transaction ID
								</p>
								<p className="text-xl font-semibold text-gray-900">
									{receipt.transactionId}
								</p>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-6">
							<div>
								<p className="text-sm font-medium text-gray-600 mb-1">Date</p>
								<p className="text-lg text-gray-900">{receipt.date}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-600 mb-1">Status</p>
								<span
									className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
										receipt.status === "Completed"
											? "bg-green-100 text-green-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{receipt.status}
								</span>
							</div>
						</div>
					</div>

					{/* Customer Information */}
					<div className="mb-8">
						<h3 className="text-xl font-semibold text-gray-900 mb-4">
							Customer Information
						</h3>
						<div className="bg-gray-50 rounded-lg p-6">
							<div className="grid grid-cols-2 gap-6">
								<div>
									<p className="text-sm font-medium text-gray-600 mb-1">Name</p>
									<p className="text-lg text-gray-900">
										{receipt.customerName}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-600 mb-1">
										Email
									</p>
									<p className="text-lg text-gray-900">
										{receipt.customerEmail}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Payment Details */}
					<div className="mb-8">
						<h3 className="text-xl font-semibold text-gray-900 mb-4">
							Payment Details
						</h3>
						<div className="space-y-4">
							<div className="flex justify-between py-2">
								<span className="text-gray-600">Description</span>
								<span className="text-gray-900 font-medium">
									{receipt.description}
								</span>
							</div>
							<div className="flex justify-between py-2">
								<span className="text-gray-600">Payment Method</span>
								<span className="text-gray-900 font-medium">
									{receipt.paymentMethod}
								</span>
							</div>
							<div className="border-t border-gray-200 pt-4">
								<div className="flex justify-between text-2xl font-bold">
									<span className="text-gray-900">Total Amount</span>
									<span className="text-gray-900">${receipt.amount}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="text-center text-gray-500 border-t border-gray-200 pt-6">
						<p className="text-lg">Thank you for your business!</p>
						<p className="mt-2">This is an electronic receipt.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
