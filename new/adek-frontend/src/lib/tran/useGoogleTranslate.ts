
"use client";
import { GoogleTranslateManager } from './googleTranslate';

import { useState, useEffect } from "react";

export const useGoogleTranslate = () => {
	const [currentLanguage, setCurrentLanguage] = useState("en");
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const manager = GoogleTranslateManager.getInstance();

		// Subscribe to language changes
		const unsubscribe = manager.subscribe((lang) => {
			setCurrentLanguage(lang);
		});

		// Initialize
		const initializeManager = async () => {
			setIsLoading(true);
			try {
				await manager.initialize();
				setCurrentLanguage(manager.getCurrentLanguage());
				setIsReady(true);
			} catch (error) {
				console.error("Failed to initialize Google Translate:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (typeof window !== "undefined") {
			initializeManager();
		}

		return () => {
			unsubscribe();
		};
	}, []);

	const translateTo = (languageCode: string) => {
		const manager = GoogleTranslateManager.getInstance();
		return manager.translateTo(languageCode);
	};

	return {
		currentLanguage,
		translateTo,
		isReady,
		isLoading,
	};
};
