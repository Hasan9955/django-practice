import AdminPermissionsControl from "@/components/pages/dashboard/adminDashboard/user-support-control/AdminPermissionsControl";

const page = () => {
	return (
		<div className="inline-flex p-6 w-full bg-white flex-col items-start gap-8 rounded-xl border border-[#CACACA]">
			<h4 className="text-black text-[32px] font-bold font-nun">
				Admin Roles & Permissions Control
			</h4>
			<AdminPermissionsControl />
		</div>
	);
};

export default page;
