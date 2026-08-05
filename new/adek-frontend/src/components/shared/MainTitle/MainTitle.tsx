import React from "react";
import clsx from "clsx";

interface TitleProps {
	children: React.ReactNode;
	className?: string;
}

const MainTitle: React.FC<TitleProps> = ({ children, className }) => {
	return (
		<h1
			className={clsx(
				"text-2xl md:text-3xl font-medium text-[#060708] font-volkhov",
				className
			)}
		>
			{children}
		</h1>
	);
};

export default MainTitle;
