import Link from "next/link";
import Profile from "./Profile";

import { usePathname } from "next/navigation";

const NicheHader = () => {
	const pathname = usePathname();

	return (
		<div className=" flex-block w-full flex justify-between items-center bg-white rounded-[12px] p-7">
			<div className="flex flex-col gap-[34px]">
				<h3 className="font-inter text-[32px] font-medium text-[#1C1C1C]">
					My Niche hub
				</h3>
				{/* <div>
					<ul className="font-inter text-sm text-[#344054] flex  gap-[30px]">
						<li>Home</li>
						<li>Products</li>
						<li>Notifications</li>
					</ul>
				</div> */}
				<div>
					<ul className="font-inter text-sm text-[#344054] flex gap-[30px]">
						<li>
							<Link
								href="/dashboard/nichehub"
								className={
									pathname === "/dashboard/nichehub"
										? "text-blue-500 font-semibold"
										: ""
								}
							>
								Home
							</Link>
						</li>
						<li>
							<Link
								href="/dashboard/nichehub/products"
								className={
									pathname === "/dashboard/nichehub/products"
										? "text-blue-500 font-semibold "
										: ""
								}
							>
								Products
							</Link>
						</li>
						<li>
							<Link
								href="/dashboard/nichehub/notifications"
								className={
									pathname === "/dashboard/nichehub/notifications"
										? "text-blue-500 font-semibold"
										: ""
								}
							>
								Notifications
							</Link>
						</li>
					</ul>
				</div>
			</div>
			<Profile />
		</div>
	);
};

export default NicheHader;
