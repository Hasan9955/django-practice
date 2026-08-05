"use client";

import { useState } from "react";
import Banner from "./Banner";
import Sidebar from "./Sidebar";
import SideNavbar from "./SideNavber";

import ContentSection from "./content-section";

const Profile = () => {
	const [activeSection, setActiveSection] = useState<string>("personal-info");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleNavItemClick = (itemId: string) => {
		setActiveSection(itemId);
		setIsMobileMenuOpen(false);
	};

	return (
		<div className="w-full h-auto">
			<Banner />
			<div className="container w-full lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto  h-auto flex gap-[120px] justify-center items-start">
				<div className="w-1/4 mt-[50px] ">
					<Sidebar />
					<div className={`lg:block ${isMobileMenuOpen ? "block" : "hidden"} `}>
						<SideNavbar
							activeItem={activeSection}
							onItemClick={handleNavItemClick}
						/>
					</div>
				</div>
				<div className="w-3/4  mt-[134px] ">
					<div className=" w-full">
						<ContentSection activeSection={activeSection} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
