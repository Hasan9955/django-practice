"use client";

import { GoogleTranslateManager } from "./googleTranslate";
import React, { useEffect } from "react";

interface GoogleTranslateProviderProps {
	children: React.ReactNode;
}

export const GoogleTranslateProvider: React.FC<
	GoogleTranslateProviderProps
> = ({ children }) => {
	useEffect(() => {
		// Initialize Google Translate when component mounts
		if (typeof window !== "undefined") {
			const manager = GoogleTranslateManager.getInstance();
			manager.initialize().catch((error) => {
				console.error("Failed to initialize Google Translate:", error);
			});
		}
	}, []);

	return <>{children}</>;
};
