import OrderDetails from "@/components/pages/dashboard/oders/OrderDetails";

const page = async ({
  params,
}: {
  params: Promise<{ orderdetails: string }>;
}) => {
  const { orderdetails } = await params;

  return <OrderDetails orderId={orderdetails} />;
};

export default page;
