"use client";

import { useState } from "react";

interface CouponNavbarProps {
	onSearch: () => void;
	onRefresh: () => void;
	sortBy: string;
	onSortChange: (sort: string) => void;
}

export default function CouponNavbar({
	onSearch,

	onRefresh,
	sortBy,
	onSortChange,
}: CouponNavbarProps) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const sortOptions = [
		"Coupon Code",
		"Total Sale",
		"Total Revenue",
		"Items",
		"Date Created",
	];

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				padding: "16px 24px",
				borderBottom: "1px solid #f0f0f0",
				backgroundColor: "white",
			}}
		>
			<div
				style={{
					fontSize: "16px",
					fontWeight: 500,
					color: "#262626",
				}}
			>
				Coupon promotion list
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "16px",
				}}
			>
				<button
					onClick={onSearch}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						padding: "8px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					aria-label="Search"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
				</button>

				<button
					onClick={onRefresh}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						padding: "8px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					aria-label="Refresh"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
					</svg>
				</button>

				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={{ fontSize: "14px", color: "#595959" }}>Short by :</span>
					<div style={{ position: "relative" }}>
						<button
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
								background: "none",
								border: "none",
								cursor: "pointer",
								padding: "8px 12px",
								fontSize: "14px",
								color: "#595959",
							}}
							aria-haspopup="true"
							aria-expanded={isDropdownOpen}
						>
							{sortBy}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{
									marginLeft: "4px",
									transition: "transform 0.2s",
									transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
								}}
							>
								<polyline points="6 9 12 15 18 9"></polyline>
							</svg>
						</button>

						{isDropdownOpen && (
							<div
								style={{
									position: "absolute",
									top: "100%",
									right: 0,
									width: "180px",
									backgroundColor: "white",
									boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
									borderRadius: "4px",
									zIndex: 1000,
									marginTop: "4px",
								}}
							>
								{sortOptions.map((option) => (
									<button
										key={option}
										onClick={() => {
											onSortChange(option);
											setIsDropdownOpen(false);
										}}
										style={{
											display: "block",
											width: "100%",
											textAlign: "left",
											padding: "8px 12px",
											fontSize: "14px",
											border: "none",
											background: option === sortBy ? "#f5f5f5" : "white",
											cursor: "pointer",
										}}
									>
										{option}
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
