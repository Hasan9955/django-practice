import PriceDisplay from "@/components/PriceDisplay";

interface BundleOffer {
  id: string;
  quantity: number;
  discount: number;
  bundleTag: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedBundle {
  id: string;
  quantity: number;
  discount: number;
}

interface BundleOfferListProps {
  bundleOffers: BundleOffer[];
  selectedBundle: SelectedBundle | undefined;
  setSelectedBundle: (bundle: SelectedBundle) => void;
  basePrice: number;
}

const BundleOfferList = ({
  bundleOffers,
  selectedBundle,
  setSelectedBundle,
  basePrice,
}: BundleOfferListProps) => {
  return (
    <div className="flex flex-col gap-3">
      {bundleOffers.map((offer) => {
        const isSelected = selectedBundle?.id === offer.id;

        const totalPrice = parseFloat(
          (
            basePrice * offer.quantity -
            (basePrice * offer.quantity * offer.discount) / 100
          ).toFixed(2),
        );

        return (
          <div
            key={offer.id}
            onClick={() =>
              setSelectedBundle({
                id: offer.id,
                quantity: offer.quantity,
                discount: offer.discount,
              })
            }
            className={`relative flex justify-between items-center
              py-3 px-3 sm:py-4 sm:px-5 rounded-2xl border-[1.5px] cursor-pointer
              transition-all duration-200 overflow-hidden gap-2 sm:gap-3
              ${
                isSelected
                  ? "bg-blue-700/10 border-blue-700"
                  : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40"
              }`}
          >
            {/* Left: radio + info */}
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                  ${
                    isSelected
                      ? "border-blue-700 bg-white"
                      : "border-slate-300 bg-white hover:border-blue-500"
                  }`}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-blue-700" />
                )}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <span
                  className={`text-[13px] sm:text-[15px] font-semibold tracking-tight transition-colors truncate
                    ${isSelected ? "text-blue-700" : "text-slate-900"}`}
                >
                  Buy {offer.quantity} pcs
                </span>
                <span
                  className={`inline-flex w-fit text-[10px] sm:text-[11px] font-bold uppercase tracking-widest
                    px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap
                    ${
                      isSelected
                        ? "bg-blue-700/10 text-blue-700 border-blue-300"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                >
                  {offer.bundleTag}
                </span>
              </div>
            </div>

            {/* Right: discount + price */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              <span
                className={`text-[10px] sm:text-xs font-bold tracking-wide px-2 sm:px-2.5 py-1 rounded-full transition-colors whitespace-nowrap
                  ${
                    isSelected
                      ? "bg-blue-700/15 text-blue-700"
                      : "bg-slate-900 text-white"
                  }`}
              >
                -{offer.discount}%
              </span>

              <PriceDisplay
                basePrice={totalPrice}
                showCode={false}
                className={`px-2.5 sm:px-3.5 py-1.5 text-[13px] sm:text-[15px] font-bold tracking-tight rounded-full transition-colors whitespace-nowrap min-w-[60px] text-center
                  ${
                    isSelected
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BundleOfferList;
