import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex pt-2 pb-[120px] items-center justify-center ">
			<div className="rounded-[12px] bg-[#fff] w-full p-7 flex-col items-center gap-14">
				{children}
			</div>
		</div>
	);
};

export default Layout;
