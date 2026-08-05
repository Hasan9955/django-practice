import ClientLayout from "@/components/pages/myaccount/clientLayout";

export default function AccountLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ClientLayout>{children}</ClientLayout>;
}
