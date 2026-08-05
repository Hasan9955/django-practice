"use client";

import type React from "react";

import Banner from "./Banner";
import Sidebar from "./Sidebar";
import SideNavbar from "./SideNavber";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Banner />

      {/* Main Container - Responsive wrapper with adaptive padding */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-5 md:py-6 lg:py-8 xl:py-10">
        <div className="w-full lg:max-w-7xl lg:mx-auto h-auto flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          <aside className="w-full lg:w-1/4 lg:max-w-sm flex-shrink-0">
            <div className="lg:sticky top-16 flex flex-col justify-center items-center w-full sm:top-20 md:top-24 lg:top-32 z-10">
              <div className="w-full">
                <Sidebar />
              </div>
              <div className="w-full mt-4 sm:mt-5 md:mt-6 lg:mt-7">
                <SideNavbar activeItem="" onItemClick={() => {}} />
              </div>
            </div>
          </aside>

          {/* Main Content - Full width on mobile/SM, adaptive width on MD+ */}
          <main className="w-full md:flex-1 lg:w-3/4">
            <div className="w-full">{children}</div>
          </main>
        </div>

      </div>
    </div>
  );
}
