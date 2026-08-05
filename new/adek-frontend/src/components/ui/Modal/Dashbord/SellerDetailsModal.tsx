import { SellersRequestData } from "@/components/pages/dashboard/adminDashboard/seller&store-oversight/SellersRequest";
import dayjs from "dayjs";
import {
  X,
  Store,
  User,
  MapPin,
  Calendar,
  Hash,
  Users,
  Wallet,
  Building2,
  Phone,
  Mail,
  Globe,
  Link,
} from "lucide-react";
import Image from "next/image";

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
    <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center">
      <Icon className="w-3.5 h-3.5 text-indigo-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide leading-none mb-1">
        {label}
      </p>
      <p className="text-sm text-gray-800 font-medium break-all">{value}</p>
    </div>
  </div>
);

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
      <span className="h-px flex-1 bg-gray-200" />
      {title}
      <span className="h-px flex-1 bg-gray-200" />
    </h3>
    <div className="space-y-0">{children}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };
  const dots: Record<string, string> = {
    Approved: "bg-emerald-500",
    Pending: "bg-amber-500",
    Rejected: "bg-red-500",
  };
  const style = styles[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const dot = dots[status] ?? "bg-gray-500";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};

const SellerDetailsModal = ({
  isOpen,
  onClose,
  sellerData,
}: {
  isOpen: boolean;
  onClose: () => void;
  sellerData: SellersRequestData | null;
}) => {
  if (!isOpen || !sellerData) return null;

  const fullName = sellerData.seller?.fullName || sellerData.name;
  const email = sellerData.seller?.email || sellerData.email;
  const phone = sellerData.seller?.phoneNumber || sellerData.phoneNumber;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        
        {/* ── Hero Banner ── */}
        <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 flex-shrink-0">
          {sellerData.bannerImage && (
            <Image
              src={sellerData.bannerImage}
              alt="Store Banner"
              fill
              className="object-cover"
            />
          )}
          {/* dark overlay for readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Status badge */}
          <div className="absolute top-3 left-4">
            <StatusBadge status={sellerData.status} />
          </div>

          {/* Logo anchored to bottom-left of banner */}
          <div className="absolute -bottom-10 left-5">
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-white overflow-hidden">
              {sellerData.shopLogo ? (
                <Image
                  src={sellerData.shopLogo}
                  alt="Shop Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <Store className="w-8 h-8 text-indigo-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Shop name row ── */}
        <div className="px-5 pt-12 pb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {sellerData.shopName}
          </h2>
          {sellerData.slug && (
            <p className="text-xs text-indigo-500 font-medium mt-0.5 flex items-center gap-1">
              <Link className="w-3 h-3" />
              /{sellerData.slug}
            </p>
          )}
          {sellerData.desc && (
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
              {sellerData.desc}
            </p>
          )}

          {/* Stats row */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-700">
                {sellerData.followers ?? 0} Followers
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-semibold text-purple-700">
                {sellerData.followings ?? 0} Following
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">
                ${sellerData.totalWithdraw ?? 0} Withdrawn
              </span>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto px-5 pb-5 space-y-4 flex-1">

          {/* Store Information */}
          <SectionCard title="Store Information">
            <InfoRow icon={Hash} label="Store ID" value={sellerData.id} />
            <InfoRow icon={Store} label="Shop Name" value={sellerData.shopName} />
            <InfoRow
              icon={Link}
              label="Slug"
              value={`/${sellerData.slug}`}
            />
            <InfoRow
              icon={Globe}
              label="Status"
              value={<StatusBadge status={sellerData.status} />}
            />
          </SectionCard>

          {/* Seller / Account Information */}
          <SectionCard title="Seller Account">
            <InfoRow
              icon={User}
              label="Full Name"
              value={fullName}
            />
            <InfoRow icon={Mail} label="Email" value={email} />
            <InfoRow icon={Phone} label="Phone" value={phone} />
            <InfoRow
              icon={Hash}
              label="Seller ID"
              value={
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {sellerData.sellerId}
                </span>
              }
            />
            {sellerData.seller?.companyName && (
              <InfoRow
                icon={Building2}
                label="Company"
                value={sellerData.seller.companyName}
              />
            )}
            {sellerData.seller?.location && (
              <InfoRow
                icon={Globe}
                label="Location Code"
                value={sellerData.seller.location}
              />
            )}
          </SectionCard>

          {/* Address */}
          <SectionCard title="Address">
            {sellerData.address && (
              <InfoRow icon={MapPin} label="Street" value={sellerData.address} />
            )}
            {sellerData.city && (
              <InfoRow icon={MapPin} label="City" value={sellerData.city} />
            )}
            {sellerData.country && (
              <InfoRow icon={Globe} label="Country" value={sellerData.country} />
            )}
            {sellerData.zipcode && (
              <InfoRow icon={Hash} label="Zip Code" value={sellerData.zipcode} />
            )}
          </SectionCard>

          {/* Timestamps */}
          <SectionCard title="Timeline">
            <InfoRow
              icon={Calendar}
              label="Created At"
              value={
                sellerData.createdAt
                  ? dayjs(sellerData.createdAt).format("MMM DD, YYYY — HH:mm")
                  : "N/A"
              }
            />
            <InfoRow
              icon={Calendar}
              label="Last Updated"
              value={dayjs(sellerData.updatedAt).format("MMM DD, YYYY — HH:mm")}
            />
          </SectionCard>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailsModal;