// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// export class GoogleTranslateManager {
// 	private static instance: GoogleTranslateManager;
// 	private isInitialized = false;
// 	private isLoading = false;
// 	private currentLanguage = "en";
// 	private observers: Set<(lang: string) => void> = new Set();

// 	private constructor() {}

// 	static getInstance(): GoogleTranslateManager {
// 		if (!GoogleTranslateManager.instance) {
// 			GoogleTranslateManager.instance = new GoogleTranslateManager();
// 		}
// 		return GoogleTranslateManager.instance;
// 	}

// 	// Subscribe to language changes
// 	subscribe(callback: (lang: string) => void) {
// 		this.observers.add(callback);
// 		return () => this.observers.delete(callback);
// 	}

// 	private notifyObservers() {
// 		this.observers.forEach((callback) => callback(this.currentLanguage));
// 	}

// 	// Initialize Google Translate without React interference
// 	async initialize(): Promise<void> {
// 		if (this.isInitialized || this.isLoading) {
// 			return;
// 		}

// 		this.isLoading = true;

// 		try {
// 			// Add comprehensive styles to hide ALL Google Translate UI
// 			this.addStyles();

// 			// Load script only once
// 			await this.loadScript();

// 			// Initialize translate element in an isolated container
// 			this.initializeTranslateElement();

// 			// Get initial language state
// 			this.currentLanguage = this.getCurrentLanguageFromCookie();

// 			this.isInitialized = true;
// 			this.notifyObservers();
// 		} catch (error) {
// 			console.error("Failed to initialize Google Translate:", error);
// 		} finally {
// 			this.isLoading = false;
// 		}
// 	}

// 	private addStyles(): void {
// 		const styleId = "google-translate-override-styles";
// 		if (document.getElementById(styleId)) return;

// 		const style = document.createElement("style");
// 		style.id = styleId;
// 		style.innerHTML = `
//       /* Completely hide and disable all Google Translate UI */
//       .goog-te-banner-frame,
//       .goog-te-ftab,
//       .goog-te-balloon-frame,
//       .goog-te-menu-frame,
//       .skiptranslate,
//       #goog-gt-tt,
//       .goog-tooltip,
//       .goog-te-spinner-pos,
//       .goog-te-gadget,
//       .goog-te-combo,
//       #google_translate_element,
//       #google_translate_element *,
//       .goog-te-gadget > span,
//       .goog-te-gadget > span > a,
//       .goog-te-gadget .goog-te-combo,
//       iframe[src*="translate.googleapis.com"],
//       iframe[src*="translate.google.com"] {
//         display: none !important;
//         visibility: hidden !important;
//         opacity: 0 !important;
//         position: absolute !important;
//         left: -99999px !important;
//         top: -99999px !important;
//         width: 0 !important;
//         height: 0 !important;
//         margin: 0 !important;
//         padding: 0 !important;
//         border: none !important;
//         z-index: -99999 !important;
//         pointer-events: none !important;
//       }

//       /* Prevent body positioning issues */
//       body {
//         top: 0 !important;
//         position: static !important;
//       }

//       /* Override any inline styles Google Translate might add */
//       body[style*="top"] {
//         top: 0 !important;
//       }

//       /* Hide notification bars */
//       .goog-te-banner-frame.skiptranslate {
//         display: none !important;
//       }
//     `;

// 		// Insert at the beginning of head to ensure high priority
// 		document.head.insertBefore(style, document.head.firstChild);
// 	}

// 	private loadScript(): Promise<void> {
// 		return new Promise((resolve, reject) => {
// 			// Check if script already exists
// 			if (document.getElementById("google-translate-script")) {
// 				resolve();
// 				return;
// 			}

// 			// Create isolated container for Google Translate
// 			this.createIsolatedContainer();

// 			// Set up global callback
// 			(window as any).googleTranslateElementInit = () => {
// 				try {
// 					this.initializeTranslateElement();
// 					resolve();
// 				} catch (error) {
// 					reject(error);
// 				}
// 			};

// 			const script = document.createElement("script");
// 			script.id = "google-translate-script";
// 			script.src =
// 				"https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
// 			script.async = true;
// 			script.onerror = () =>
// 				reject(new Error("Failed to load Google Translate script"));

// 			document.body.appendChild(script);
// 		});
// 	}

// 	private createIsolatedContainer(): void {
// 		// Remove any existing container
// 		const existing = document.getElementById(
// 			"google-translate-isolated-container"
// 		);
// 		if (existing) {
// 			existing.remove();
// 		}

// 		// Create new isolated container
// 		const container = document.createElement("div");
// 		container.id = "google-translate-isolated-container";
// 		container.style.cssText = `
//       position: absolute !important;
//       left: -99999px !important;
//       top: -99999px !important;
//       width: 0 !important;
//       height: 0 !important;
//       overflow: hidden !important;
//       visibility: hidden !important;
//       display: none !important;
//     `;

// 		const element = document.createElement("div");
// 		element.id = "google_translate_element";
// 		container.appendChild(element);

// 		document.body.appendChild(container);
// 	}

// 	private initializeTranslateElement(): void {
// 		try {
// 			const google = (window as any).google;
// 			if (!google?.translate?.TranslateElement) {
// 				throw new Error("Google Translate not available");
// 			}

// 			// Initialize in isolated container
// 			new google.translate.TranslateElement(
// 				{
// 					pageLanguage: "en",
// 					includedLanguages: "en,fr,es,de,ar,pt,hi,bn",
// 					layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
// 					autoDisplay: false,
// 					multilanguagePage: true,
// 				},
// 				"google_translate_element"
// 			);

// 			// Hide any elements that might still appear
// 			setTimeout(() => this.hideAllGoogleElements(), 100);
// 		} catch (error) {
// 			console.error("Error initializing translate element:", error);
// 		}
// 	}

// 	private hideAllGoogleElements(): void {
// 		// Find and hide any Google Translate elements that might have appeared
// 		const selectors = [
// 			".goog-te-banner-frame",
// 			".goog-te-ftab",
// 			".goog-te-balloon-frame",
// 			'iframe[src*="translate.googleapis.com"]',
// 			".skiptranslate",
// 		];

// 		selectors.forEach((selector) => {
// 			document.querySelectorAll(selector).forEach((el) => {
// 				const element = el as HTMLElement;
// 				element.style.cssText = `
//           display: none !important;
//           visibility: hidden !important;
//           position: absolute !important;
//           left: -99999px !important;
//         `;
// 			});
// 		});
// 	}

// 	// Translate to specific language
// 	translateTo(languageCode: string): boolean {
// 		try {
// 			if (languageCode === this.currentLanguage) {
// 				return true;
// 			}

// 			// Clear existing cookies first
// 			this.clearTranslateCookies();

// 			// Set new translation cookie
// 			if (languageCode !== "en") {
// 				const cookieValue = `/en/${languageCode}`;
// 				document.cookie = `googtrans=${cookieValue}; path=/; max-age=86400`;

// 				// Also set for current domain
// 				if (window.location.hostname !== "localhost") {
// 					document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}; max-age=86400`;
// 				}
// 			}

// 			this.currentLanguage = languageCode;

// 			// Store in localStorage for persistence
// 			localStorage.setItem("preferred-language", languageCode);

// 			// Notify observers
// 			this.notifyObservers();

// 			// Force page reload to apply translation
// 			setTimeout(() => {
// 				window.location.reload();
// 			}, 100);

// 			return true;
// 		} catch (error) {
// 			console.error("Error translating:", error);
// 			return false;
// 		}
// 	}

// 	private clearTranslateCookies(): void {
// 		const cookies = ["googtrans", "googtrans=/en/en"];

// 		cookies.forEach((cookie) => {
// 			document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
// 			if (window.location.hostname !== "localhost") {
// 				document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
// 			}
// 		});
// 	}

// 	getCurrentLanguage(): string {
// 		return this.currentLanguage;
// 	}

// 	private getCurrentLanguageFromCookie(): string {
// 		try {
// 			// Check localStorage first
// 			const stored = localStorage.getItem("preferred-language");
// 			if (stored) {
// 				return stored;
// 			}

// 			// Check cookie
// 			const cookies = document.cookie.split(";");
// 			for (const cookie of cookies) {
// 				const [name, value] = cookie.trim().split("=");
// 				if (name === "googtrans" && value) {
// 					const match = value.match(/\/en\/(.+)/);
// 					if (match && match[1]) {
// 						return match[1];
// 					}
// 				}
// 			}

// 			return "en";
// 		} catch (error) {
// 			return "en";
// 		}
// 	}

// 	isReady(): boolean {
// 		return this.isInitialized;
// 	}
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

export class GoogleTranslateManager {
  private static instance: GoogleTranslateManager;
  private isInitialized = false;
  private isLoading = false;
  private currentLanguage = "en";
  private observers: Set<(lang: string) => void> = new Set();

  private constructor() {}

  static getInstance(): GoogleTranslateManager {
    if (!GoogleTranslateManager.instance) {
      GoogleTranslateManager.instance = new GoogleTranslateManager();
    }
    return GoogleTranslateManager.instance;
  }

  // Subscribe to language changes
  subscribe(callback: (lang: string) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    this.observers.forEach((callback) => callback(this.currentLanguage));
  }

  // Initialize Google Translate
  async initialize(): Promise<void> {
    if (typeof window === "undefined") return; // SSR-safe
    if (this.isInitialized || this.isLoading) return;

    this.isLoading = true;

    try {
      this.addStyles();
      await this.loadScript();
      this.initializeTranslateElement();
      this.currentLanguage = this.getCurrentLanguageFromCookie();
      this.isInitialized = true;
      this.notifyObservers();
    } catch (error) {
      console.error("Failed to initialize Google Translate:", error);
    } finally {
      this.isLoading = false;
    }
  }

  private addStyles(): void {
    if (typeof document === "undefined") return;
    const styleId = "google-translate-override-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      /* Hide Google Translate UI */
      .goog-te-banner-frame,
      .goog-te-gadget,
      .skiptranslate,
      iframe[src*="translate.googleapis.com"] {
        display: none !important;
      }
      body { top: 0 !important; position: static !important; }
    `;
    document.head.insertBefore(style, document.head.firstChild);
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof document === "undefined") {
        resolve();
        return;
      }

      if (document.getElementById("google-translate-script")) {
        resolve();
        return;
      }

      this.createIsolatedContainer();

      (window as any).googleTranslateElementInit = () => {
        try {
          this.initializeTranslateElement();
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () =>
        reject(new Error("Failed to load Google Translate script"));

      document.body.appendChild(script);
    });
  }

  private createIsolatedContainer(): void {
    if (typeof document === "undefined") return;

    const existing = document.getElementById(
      "google-translate-isolated-container"
    );
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = "google-translate-isolated-container";
    container.style.cssText = `
      position: absolute !important;
      left: -99999px !important;
      top: -99999px !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
      visibility: hidden !important;
      display: none !important;
    `;

    const element = document.createElement("div");
    element.id = "google_translate_element";
    container.appendChild(element);

    document.body.appendChild(container);
  }

  private initializeTranslateElement(): void {
    if (typeof window === "undefined") return;

    const google = (window as any).google;
    if (!google?.translate?.TranslateElement) return;

    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,fr,es,de,ar,pt,hi,bn",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true,
      },
      "google_translate_element"
    );

    setTimeout(() => this.hideAllGoogleElements(), 100);
  }

  private hideAllGoogleElements(): void {
    if (typeof document === "undefined") return;

    const selectors = [
      ".goog-te-banner-frame",
      ".goog-te-ftab",
      ".goog-te-balloon-frame",
      'iframe[src*="translate.googleapis.com"]',
      ".skiptranslate",
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const element = el as HTMLElement;
        element.style.cssText = `
          display: none !important;
          visibility: hidden !important;
          position: absolute !important;
          left: -99999px !important;
        `;
      });
    });
  }

  translateTo(languageCode: string): boolean {
    if (typeof document === "undefined") return false;

    try {
      if (languageCode === this.currentLanguage) return true;

      this.clearTranslateCookies();

      if (languageCode !== "en") {
        const cookieValue = `/en/${languageCode}`;
        document.cookie = `googtrans=${cookieValue}; path=/; max-age=86400`;

        if (window.location.hostname !== "localhost") {
          document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}; max-age=86400`;
        }
      }

      this.currentLanguage = languageCode;
      localStorage.setItem("preferred-language", languageCode);
      this.notifyObservers();

      setTimeout(() => {
        window.location.reload();
      }, 100);

      return true;
    } catch (error) {
      console.error("Error translating:", error);
      return false;
    }
  }

  private clearTranslateCookies(): void {
    if (typeof document === "undefined") return;

    const cookies = ["googtrans", "googtrans=/en/en"];

    cookies.forEach((cookie) => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      if (window.location.hostname !== "localhost") {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      }
    });
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  private getCurrentLanguageFromCookie(): string {
    if (typeof document === "undefined") return "en";

    try {
      const stored = localStorage.getItem("preferred-language");
      if (stored) return stored;

      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "googtrans" && value) {
          const match = value.match(/\/en\/(.+)/);
          if (match && match[1]) return match[1];
        }
      }

      return "en";
    } catch (error) {
      return "en";
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
