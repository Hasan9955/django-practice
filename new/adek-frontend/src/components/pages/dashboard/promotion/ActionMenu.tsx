"use client";

import { useState, useRef, useEffect } from "react";

interface ActionMenuProps {
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onActivate: () => void;
	onDeactivate: () => void;
	onExport: () => void;
	isActive?: boolean;
}

export default function ActionMenu({
	onView,
	onEdit,
	onDelete,
	onDuplicate,
	onActivate,
	onDeactivate,
	onExport,
	isActive = true,
}: ActionMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div style={{ position: "relative" }} ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				style={{
					backgroundColor: "transparent",
					border: "none",
					borderRadius: "4px",
					width: "32px",
					height: "32px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					color: "#8c8c8c",
					fontSize: "16px",
					transition: "color 0.3s",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.color = "#1890ff";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.color = "#8c8c8c";
				}}
				aria-label="More actions"
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
					<circle cx="12" cy="12" r="1"></circle>
					<circle cx="19" cy="12" r="1"></circle>
					<circle cx="5" cy="12" r="1"></circle>
				</svg>
			</button>

			{isOpen && (
				<div
					style={{
						position: "absolute",
						right: 0,
						top: "100%",
						marginTop: "4px",
						backgroundColor: "white",
						borderRadius: "4px",
						boxShadow:
							"0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08)",
						zIndex: 1000,
						width: "160px",
						overflow: "hidden",
					}}
				>
					<button
						onClick={() => {
							onView();
							setIsOpen(false);
						}}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							width: "100%",
							textAlign: "left",
							padding: "8px 16px",
							border: "none",
							backgroundColor: "transparent",
							cursor: "pointer",
							fontSize: "14px",
							color: "#595959",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#f5f5f5";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
							<circle cx="12" cy="12" r="3"></circle>
						</svg>
						View Details
					</button>

					<button
						onClick={() => {
							onEdit();
							setIsOpen(false);
						}}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							width: "100%",
							textAlign: "left",
							padding: "8px 16px",
							border: "none",
							backgroundColor: "transparent",
							cursor: "pointer",
							fontSize: "14px",
							color: "#595959",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#f5f5f5";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
							<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
						</svg>
						Edit
					</button>

					<button
						onClick={() => {
							onDuplicate();
							setIsOpen(false);
						}}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							width: "100%",
							textAlign: "left",
							padding: "8px 16px",
							border: "none",
							backgroundColor: "transparent",
							cursor: "pointer",
							fontSize: "14px",
							color: "#595959",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#f5f5f5";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
						Duplicate
					</button>

					{isActive ? (
						<button
							onClick={() => {
								onDeactivate();
								setIsOpen(false);
							}}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								width: "100%",
								textAlign: "left",
								padding: "8px 16px",
								border: "none",
								backgroundColor: "transparent",
								cursor: "pointer",
								fontSize: "14px",
								color: "#595959",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f5f5f5";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
								<circle cx="8" cy="12" r="3"></circle>
							</svg>
							Deactivate
						</button>
					) : (
						<button
							onClick={() => {
								onActivate();
								setIsOpen(false);
							}}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								width: "100%",
								textAlign: "left",
								padding: "8px 16px",
								border: "none",
								backgroundColor: "transparent",
								cursor: "pointer",
								fontSize: "14px",
								color: "#595959",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f5f5f5";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
								<circle cx="16" cy="12" r="3"></circle>
							</svg>
							Activate
						</button>
					)}

					<button
						onClick={() => {
							onExport();
							setIsOpen(false);
						}}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							width: "100%",
							textAlign: "left",
							padding: "8px 16px",
							border: "none",
							backgroundColor: "transparent",
							cursor: "pointer",
							fontSize: "14px",
							color: "#595959",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#f5f5f5";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
							<polyline points="7 10 12 15 17 10"></polyline>
							<line x1="12" y1="15" x2="12" y2="3"></line>
						</svg>
						Export
					</button>

					<div
						style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0" }}
					></div>

					<button
						onClick={() => {
							onDelete();
							setIsOpen(false);
						}}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							width: "100%",
							textAlign: "left",
							padding: "8px 16px",
							border: "none",
							backgroundColor: "transparent",
							cursor: "pointer",
							fontSize: "14px",
							color: "#ff4d4f",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#fff1f0";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="3,6 5,6 21,6"></polyline>
							<path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
						</svg>
						Delete
					</button>
				</div>
			)}
		</div>
	);
}
