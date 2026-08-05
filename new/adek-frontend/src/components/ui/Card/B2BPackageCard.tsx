import PriceDisplay from "@/components/PriceDisplay";
import Link from "next/link";
import React from "react";

interface B2BPackage {
  id?: string;
  moq: number;
  maxMOQ: number;
  pricePerUnit: number;
  b2bPackageTag?: string;
}

interface B2BPackageCardProps {
  offer: B2BPackage;
  isSelected?: boolean;
}

const B2BPackageCard: React.FC<B2BPackageCardProps> = ({
  offer,
  isSelected = false,
}) => {
  return (
    <Link href="/account/B2B-portal">
      <div
        className={`
        relative flex flex-col justify-center items-center
        gap-1 border rounded-lg px-3 py-5
        cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "border-blue-600 bg-blue-50 shadow-sm"
            : "border-neutral-200 bg-white hover:border-neutral-400"
        }
      `}
      >
        {/* Tag Badge */}
        {offer.b2bPackageTag && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {offer.b2bPackageTag}
          </span>
        )}

        {/* MOQ Range */}
        <span className="text-neutral-800 text-[12px] font-medium tracking-wide ">
          {offer.moq}–{offer.maxMOQ} MOQ
        </span>

        {/* Price Per Unit */}
        <div className="flex items-baseline gap-0.5">
          <PriceDisplay
            basePrice={offer.pricePerUnit}
            showCode={false}
            className="text-neutral-900 font-semibold text-lg"
          />
          <span className="text-neutral-700 text-[10px] font-medium">
            /Per-Unit
          </span>
        </div>
      </div>
    </Link>
  );
};

export default B2BPackageCard;
