"use client";

import type React from "react";
import Welcome from "./Welcome";
import ContactSeller from "./contactSeller/ContactSeller";
import B2B from "./b2b";

interface ContentSectionProps {
	activeSection: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({ activeSection }) => {
	const renderContent = () => {
		switch (activeSection) {
			case "my-orders":
				return <Welcome />;

			case "contact-seller":
				return <ContactSeller />;

			case "B2B-portal":
				return <B2B />;
		}
	};

	return <div className="w-full ">{renderContent()}</div>;
};

export default ContentSection;
