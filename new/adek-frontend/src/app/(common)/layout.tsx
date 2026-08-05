import Footer from "@/components/shared/Footer/Footer";
import NavBar from "@/components/shared/NavBar/NavBar";
import { Toaster } from "sonner";
import React, { ReactNode } from "react";
import { CartProvider } from "./providers";

const layout = ({ children }: { children: ReactNode }) => {
	return (
		<div>
			<Toaster position="top-center" richColors />
			<NavBar />
			<div className="h-full  min-h-[calc(100vh-0px)] ">
				<CartProvider>{children}</CartProvider>
			</div>
			<Footer />
		</div>
	);
};

export default layout;
