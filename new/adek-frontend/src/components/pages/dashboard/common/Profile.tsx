import { BiLogOut } from "react-icons/bi";
import { FiUser } from "react-icons/fi";
import Image from "next/image";

import { MdKeyboardArrowDown } from "react-icons/md";
import React, { useEffect, useRef, useState } from "react";
import sellerprofile from "@/assets/images/dashborad/Frame 1618873804.png";

const Profile = () => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="flex items-center gap-4">
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded-full transition-colors"
					aria-expanded={isDropdownOpen}
					aria-haspopup="true"
				>
					<div className="h-10 w-10 gap-2 rounded-full border overflow-hidden bg-gray-100">
						<Image
							height={100}
							width={100}
							src={sellerprofile}
							alt="User avatar"
							className="h-full w-full object-cover"
						/>
					</div>
					<h2 className="text-base font-inter font-normal text-[#1C1C1E]">
						Mahadi
					</h2>
					<MdKeyboardArrowDown className="h-5 w-5 text-gray-600" />
				</button>

				{isDropdownOpen && (
					<div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
						<div className="flex items-center gap-3 mx-3 border-b border-dashed cursor-pointer">
							<div className="h-10 w-10 rounded-full border overflow-hidden bg-gray-100">
								<Image
									height={100}
									width={100}
									src={sellerprofile}
									alt="User avatar"
									className="h-full w-full object-cover"
								/>
							</div>
							<h3 className="font-medium">Martin De</h3>
						</div>
						<button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
							<FiUser className="h-4 w-4 text-blue-primary" />
							My Profile
						</button>
						<button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
							<BiLogOut className="h-4 w-4 text-blue-primary" />
							Logout
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;
