"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";

interface LogoProps {
  width?: number;
  height?: number;
  href?: string;
  className?: string;
}

export default function Logo({
  width = 183,
  height = 57,
  href = "/",
  className = "",
}: LogoProps) {
  const { data, isLoading } = useGetPlatformDataForUserSupportQuery({});

  const logoFallback = "/placeholder.svg" as const;

  // Correct path based on actual API response structure
  const getLogoSrc = (): string => {
    const logo = data?.result?.CmsSetting?.[0]?.platform?.logo;
    if (!logo) return logoFallback;

    // Already a full S3 HTTPS URL (no prefix needed)
    return logo.startsWith("http")
      ? logo
      : `${process.env.NEXT_PUBLIC_API_URL}/${logo}`;
  };

  const computedSrc = getLogoSrc();

  const [logoSrc, setLogoSrc] = useState<string>(computedSrc);

  // Sync when API data changes
  useEffect(() => {
    setLogoSrc(computedSrc);
  }, [computedSrc]);

  const isExternal = logoSrc.startsWith("http") && logoSrc !== logoFallback;

  const logoContent = (
    <div
      className={cn(
        "flex items-center justify-center w-24 h-8 md:w-40 md:h-20",
        className
      )}
    >
      <Image
        src={logoSrc}
        alt="Sellapy Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
        unoptimized={isExternal}
        onError={() => {
          if (logoSrc !== logoFallback) {
            setLogoSrc(logoFallback);
          }
        }}
      />
    </div>
  );

  if (isLoading) {
    return (
      <Skeleton
        className={cn("w-24 h-8 md:w-40 md:h-20", className)}
        aria-label="Loading logo"
      />
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Go to homepage"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}