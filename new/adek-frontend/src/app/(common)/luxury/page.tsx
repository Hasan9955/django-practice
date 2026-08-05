import model from "@/assets/images/luxury/image 69.png";
import LuxuryCollection from "@/components/pages/luxury/LuxuryCollection";
import ExploreStore from "@/components/pages/store/highlights/ExploreStore";
import Image from "next/image";

const page = () => {
  return (
    <div className="font-nun bg-[#f6f6f6] slim-scroll">
      <div className="luxury-bg w-full h-[452px] relative  bg-gradient-to-r from-white/0 via-white/10 to-black/70">
        <Image
          src={model}
          alt="Luxury Item"
          className="absolute top-0 left-48 h-full object-contain"
        />
        <div className="absolute top-40 h-full right-80  flex flex-col items-center ">
          <h3 className="text-white text-center font-nun text-xl  sm:text-2xl lg:text-4xl font-extrabold leading-[120%]">
            Discover Elegance, Redefined
          </h3>
          <p className="text-[#FBFBFB] text-center mt-3.5 w-[570px] font-nun text-lg font-medium leading-[148%]">
            Indulge in a curated collection of premium products from world-class
            brands and artisans. Whether it’s timeless fashion, cutting-edge
            tech, or elegant homeware, we have something for every connoisseur.
          </p>
        </div>
      </div>
      <LuxuryCollection />
      <ExploreStore />
    </div>
  );
};

export default page;
