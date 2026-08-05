import ReceiptPage from "@/components/pages/dashboard/Payment/Receipt";

interface PageProps {
	params: Promise<{
		transactionId: string;
		searchParams?: Record<string, string>;
	}>;
}

export default async function Page({ params }: PageProps) {
	const { transactionId } = await params;
	return <ReceiptPage transactionId={String(transactionId)} />;
}
