"use client";
import { useUserStoreQuery } from "@/redux/features/storeapi/storeApi";
import Image from "next/image";
import Link from "next/link";
import { RiMessage2Line } from "react-icons/ri";
import { Skeleton } from "antd";

const Message = ({
  storeId,
  productId,
}: {
  storeId: string;
  productId: string;
}) => {
  const { data, isLoading } = useUserStoreQuery(storeId);
  const store = data?.result;

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (!store) return null;

  return (
    <div className="bg-[#FBE484] rounded-xl px-6 py-5 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        {store.shopLogo && (
          <div className="flex items-center gap-2 rounded-full overflow-hidden h-12 w-12">
            <Image
              src={store.shopLogo}
              alt={store.shopName}
              width={48}
              height={48}
              className="rounded-full object-cover w-[48px] h-[48px] aspect-square"
            />
            <div />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white px-3 py-1 rounded font-medium">
              Choice
            </span>
            <p className="font-bold text-lg">{store.shopName}</p>
          </div>
          <p className="text-sm">
            <span className="font-bold">97.5%</span> Positive Feedback •{" "}
            {store.followers} Followers
          </p>
        </div>
      </div>

      <Link href={`/products/${productId}/${store.seller?.id || ""}`}>
        <button className="flex items-center gap-3 bg-white border border-black px-8 py-3 rounded-xl font-semibold hover:bg-black hover:text-white transition">
          <RiMessage2Line className="text-xl" />
          Message Seller
        </button>
      </Link>
    </div>
  );
};

export default Message;
