import AllCouponManagement from "@/components/pages/dashboard/adminDashboard/monetization&promotions/AllCouponManagement";

const page = () => {
  return (
    <div className="rounded-[16px] border border-[#CACACA] inline-flex p-6 flex-col items-start gap-8 flex-shrink-0 w-full">
      <h3 className="text-black font-nun text-[32px] font-bold">
        All Stores Coupon
      </h3>
      <AllCouponManagement />
    </div>
  );
};

export default page;
