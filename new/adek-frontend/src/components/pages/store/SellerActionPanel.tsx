/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { BsPersonAdd, BsPersonCheck } from "react-icons/bs";
import { GiDandelionFlower, GiWorld } from "react-icons/gi";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";

interface Seller {
  followers: number | string;
  itemsSold: number;
}

interface SellerActionPanelProps {
  seller: Seller;
  isFollowLoading: boolean;
  handleFollow: () => void;
  followersData: any;
  isFollowersLoading: boolean;
}

const SellerActionPanel: React.FC<SellerActionPanelProps> = ({
  seller,
  isFollowLoading,
  handleFollow,
  followersData,
  isFollowersLoading,
}) => {
  const storeFollowers = followersData?.result;
  const user = useAppSelector((state: RootState) => state.auth.user);

  // Check if the current logged-in user is already following this store
  const isAlreadyFollowing = useMemo(() => {
    if (!user?.id || !storeFollowers?.length) return false;
    return storeFollowers.some(
      (follower: any) => follower.followerId === user.id
    );
  }, [storeFollowers, user?.id]);

  return (
    <div className="flex flex-col lg:w-1/4 gap-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-start lg:justify-end gap-3">
        <Button
          variant="secondary"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base font-medium rounded-[12px] border-0 px-4 py-2"
        >
          {isFollowersLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <GiDandelionFlower className="text-lg mr-2" />
              Followers {storeFollowers?.length ?? 0}
            </>
          )}
        </Button>

        <Button
          onClick={handleFollow}
          disabled={isFollowLoading || isAlreadyFollowing}
          variant="secondary"
          className={`text-white text-sm border-2 sm:text-base font-medium rounded-[12px] px-4 py-2 flex items-center
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              isAlreadyFollowing
                ? "bg-blue-primary border-blue-primary cursor-default"
                : "bg-transparent border-white hover:bg-blue-primary"
            }`}
        >
          {isFollowLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Following...
            </>
          ) : isAlreadyFollowing ? (
            <>
              <BsPersonCheck className="text-lg mr-2" />
              Following
            </>
          ) : (
            <>
              <BsPersonAdd className="text-lg mr-2" />
              Follow
            </>
          )}
        </Button>
      </div>

      {/* Seller Information */}
      <div className="flex flex-col gap-2 text-sm sm:text-base font-normal text-white/90 mt-2">
        <div className="flex items-center gap-2">
          <GiWorld className="text-base" />
          <span>Send Inquiry</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>30 day easy return policy</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span>{seller?.itemsSold?.toLocaleString()} Items sold</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default SellerActionPanel;